# /bin/python
from flask import Flask, Response, request, jsonify, stream_with_context
from flask_cors import CORS
from pymongo import MongoClient
import glob
import json
from shutil import which
import subprocess
import os
import traceback
import time
import re

from export_motifs_data import export_motifs_data

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017/")
db = client["motifs"]  # Connect to the 'motifs' database
data_collection = db["motifs"]
motifs_collection = db["motifs_svg"]
strucs_single_motif_svg_collection = db["strucs_svg"]
strucs_collection = db["structures"]


@app.route("/api")
def home():
    return "Welcome to the Flask MongoDB app!\n"


# route to get the total count of motifs present in the 'motifs' collection
@app.route("/total", methods=["GET"])
def get_num_docs():
    try:
        num_docs = data_collection.count_documents({})
        response = {"count": num_docs}
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Route to fetch a single motif along with its SVG file from the MongoDB collection
@app.route("/api/motif", methods=["GET"])
def get_motif_by_id():
    try:
        # Get the motif ID from the query parameter
        motif_id = request.args.get("id")
        if not motif_id:
            return jsonify({"error": "No motif ID provided"}), 400

        # Build the query object to find the motif
        query = {"_id": motif_id}

        # Fetch the motif document from the data collection
        motif = data_collection.find_one(query)

        # If no motif is found, return a 404 error
        if not motif:
            return jsonify({"error": "Motif not found"}), 404

        # Fetch the corresponding SVG file from the motifs collection
        motif_svg = motifs_collection.find_one(
            {"_id": motif_id + "_mode0"}, {"_id": 0, "content": 1}
        )

        # If an SVG file is found, add it to the motif data
        if motif_svg:
            motif["motif_svg"] = motif_svg["content"]

        # Response with the single motif data and SVG file
        return jsonify(motif), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# route to fetch structures based on a list of structure IDs
@app.route("/api/struc", methods=["GET"])
def get_structure_by_id():
    try:
        # get the structure ID from the query parameter
        structure_id = request.args.get("id")
        motifs_id = request.args.get("motifNums")
        motifs_id = [mid.strip() for mid in motifs_id.split(",") if mid.strip()]

        if "ymotif" in structure_id:
            structure_id = "_".join(structure_id.split("_")[:2])

        if not structure_id:
            return jsonify({"error": "No structure ID provided"}), 400

        # fetch the structure from the 'strucs_collection' based on the provided ID
        structure = strucs_collection.find_one(
            {"_id": structure_id}, {"svg_content": 0} if len(motifs_id) else {}
        )

        # print(structure)

        if motifs_id:
            # print("here")
            svg_content = []
            for mid in motifs_id:
                key = structure_id + "_" + mid
                data = strucs_single_motif_svg_collection.find_one(
                    {"_id": key},
                    {
                        "_id": 0,
                        "content": 1,
                    },
                )
                svg_content.append(data["content"])
            structure["svg_content"] = svg_content

        if structure:
            # structure["svg_content"] = []
            # print(structure)
            return jsonify(structure), 200
        else:
            return jsonify({"error": "Structure not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# route to get paginated motifs along with SVG files from the MongoDB collections
@app.route("/api/motifs", methods=["GET"])
def get_paginated_motifs_with_svg():
    try:
        # Get pagination parameters from the request, with defaults
        page = int(request.args.get("page", 1))  # Default page is 1
        limit = int(request.args.get("limit", 10))  # Default limit is 10
        families = request.args.get(
            "families", ""
        )  # Get the 'families' query parameter as a list
        motif_id = request.args.get("motifID", None)  # Optional id parameter
        sort_field = request.args.get(
            "sortField", "ID"
        )  # Default sort field is 'Number of Occurrences'
        sort_order = request.args.get(
            "sortOrder", "Ascending"
        )  # Default sort order is 'Ascending'

        # Split the families string into a list (ignore empty strings)
        families = [family.strip() for family in families.split(",") if family.strip()]

        # set valid value of page
        page = max(1, page)

        # Build the query object
        query = {}

        # If 'id' is provided, add it to the query
        if motif_id:
            query["_id"] = motif_id

        # Add families filter to the query, even if 'id' is provided
        if families:
            query["$or"] = [
                {"family2count." + family: {"$exists": True}} for family in families
            ]

        # Calculate the number of documents to skip (only for pagination if 'id' is not provided)
        skip = (page - 1) * limit

        # Determine the sort order: Ascending (1) or Descending (-1)
        sort_direction = -1 if sort_order == "desc" else 1

        # Map the sort field to the correct MongoDB field or precomputed fields
        sort_mapping = {
            "ID": "num_id",
            "Number of Occurrences": "num_occurrences",
            "Number of Families": "num_families",
            "Length": "length",
            "Boundary Pairs": "num_bpairs",
            "Internal Pairs": "num_ipairs",
            "Number of Loops": "cardinality",
        }

        # Get the appropriate sorting criteria
        sort_criteria = sort_mapping.get(sort_field, "ID")

        # Use MongoDB aggregation to handle sorting and pagination
        pipeline = [
            {"$match": query},  # Apply the query
            {
                "$sort": {  # Sort based on the precomputed fields or normal fields
                    sort_criteria: sort_direction
                }
            },
            {"$skip": skip},  # Pagination: skip documents
            {"$limit": limit},  # Limit the number of documents
        ]

        # Fetch the total count of documents that match the query (without pagination)
        total_documents = data_collection.count_documents(query)

        # Handle the case when no documents are found
        if total_documents == 0:
            return (
                jsonify(
                    {
                        "totalItems": 0,
                        "motifs": [],
                        "message": "No documents found matching the criteria.",
                    }
                ),
                200,
            )  # Return an empty result set with a success response

        # Fetch the documents with pagination, sorting, and filtering applied
        documents = list(data_collection.aggregate(pipeline))

        # For each document, fetch the corresponding motif SVG file from the 'motifs' collection
        for document in documents:
            motif_svg = motifs_collection.find_one(
                {"_id": document["_id"] + "_mode0"}, {"_id": 0, "content": 1}
            )
            if motif_svg:
                document["motif_svg"] = motif_svg["content"]

        # Response with paginated data and SVG files
        response = {"totalItems": total_documents, "motifs": documents}

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/strucs", methods=["GET"])
def get_paginated_structures():
    """
    Fetch paginated structures with filtering, sorting, and pagination.
    """
    try:
        # Get pagination parameters from the request, with defaults
        page = int(request.args.get("page", 1))  # Default page is 1
        limit = int(request.args.get("limit", 10))  # Default limit is 10
        families = request.args.get(
            "families", ""
        )  # Get the 'families' query parameter as a list
        struc_id = request.args.get("strucID", None)  # Optional ID parameter
        sort_field = request.args.get("sortField", "length")  # Default sort field
        sort_order = request.args.get("sortOrder", "Ascending")  # Default sort order

        # Split the families string into a list (ignore empty strings)
        families = [family.strip() for family in families.split(",") if family.strip()]

        # Set valid page
        page = max(1, page)

        # Build the query object
        query = {}

        # If 'strucID' is provided, add it to the query
        if struc_id:
            query["_id"] = struc_id

        # Add families filter to the query
        if families:
            query["family"] = {"$in": families}

        # Calculate the number of documents to skip (only for pagination if 'strucID' is not provided)
        skip = (page - 1) * limit

        # Determine the sort order: Ascending (1) or Descending (-1)
        sort_direction = -1 if sort_order.lower() == "desc" else 1

        # Map the sort field to the correct MongoDB field
        sort_mapping = {
            "ID": "_id",
            "Length": "length",
            "Number of Pairs": "num_pairs",
            "Number of Loops": "num_loops",
            "Number of Motifs": "num_motifs",
        }

        # Get the appropriate sorting criteria
        sort_criteria = sort_mapping.get(sort_field, "_id")

        # Use MongoDB aggregation to handle sorting and pagination
        pipeline = [
            {"$match": query},  # Apply the query
            {
                "$sort": {  # Sort based on the mapped field
                    sort_criteria: sort_direction
                }
            },
            {"$skip": skip},  # Pagination: skip documents
            {"$limit": limit},  # Limit the number of documents
            {
                "$project": {  # Exclude fields not needed in the response
                    "svg_content": 1,
                    "names": 1,
                    "family": 1,
                    "dot_bracket": 1,
                    "length": 1,
                    "num_loops": 1,
                    "num_pairs": 1,
                    "motifs_id": 1,
                }
            },
        ]

        # Fetch the total count of documents that match the query (without pagination)
        total_documents = strucs_collection.count_documents(query)

        # Handle the case when no documents are found
        if total_documents == 0:
            return (
                jsonify(
                    {
                        "totalItems": 0,
                        "strucs": [],
                        "message": "No structures found matching the criteria.",
                    }
                ),
                200,
            )  # Return an empty result set with a success response

        # Fetch the documents with pagination, sorting, and filtering applied
        documents = list(strucs_collection.aggregate(pipeline))

        # Response with paginated data
        response = {"totalItems": total_documents, "strucs": documents}

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/new", methods=["POST"])
def run_structure():
    def clean_output(undesign_data_path=None, unique_id=None):
        if unique_id:
            matching_files = glob.glob(f"*{unique_id}*")
            for file_path in matching_files:
                os.remove(file_path)
                # print(f"Deleted file: {file_path}")

        if undesign_data_path and os.path.exists(undesign_data_path):
            os.remove(undesign_data_path)

        if os.path.exists("lib_undesignable.txt"):
            os.remove("lib_undesignable.txt")

        if os.path.exists("lib_designable.txt"):
            os.remove("lib_designable.txt")

    data = request.json
    structure = data.get("structure", "")

    if not structure:
        return jsonify({"error": "Structure is required"}), 400

    # export mongodb database
    undesign_data_path = f"lib_undesignable_{str(int(time.time()))}.txt"
    export_motifs_data(undesign_data_path)

    # Set environment variables
    env = os.environ.copy()
    # env["PATH_UNDESIGNABLE_LIB"] = "/nfs/guille/huang/users/zhoutian/shared/motifs/libs/lib_undesignable.txt"
    env["PATH_UNDESIGNABLE_LIB"] = undesign_data_path
    env["PATH_DESIGNABLE_LIB"] = "./libs/lib_designable.txt"
    env["PATH_FASTMOTIF"] = "./RNA-Undesign"
    env["VRNABIN"] = "./ViennaRNA-2.5.1/src/bin"
    env["VIENNA"] = "./ViennaRNA-2.5.1/src"

    try:
        # Define the command
        command = f"echo '{structure}' | ./RNA-Undesign/bin/main --alg fastmotif --plot"
        print(f"Command: {command}")

        # Start the process
        process = subprocess.Popen(
            command,
            shell=True,
            env=env,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        def generate():
            unique_id = None  # To store the unique identifier for deletion

            try:
                # Stream stdout line-by-line, filtering for `[ProgressInfo]`
                for line in iter(process.stdout.readline, ""):
                    # print(line)
                    if "[ProgressInfo]" in line:
                        yield f"data: {json.dumps({'progress': line.strip()})}\n\n"

                    # Capture the unique identifier if it appears in the program output
                    if "Strings written to file:" in line:
                        # Extract the unique identifier from the filename (e.g., 20241030124851)
                        filename = line.split("Strings written to file:")[-1].strip()
                        unique_id = filename.split(".")[
                            0
                        ]  # Extract the identifier from filename
                        print(f"Captured unique identifier: {unique_id}")

                process.stdout.close()
                process.wait()

                if process.returncode != 0:
                    error_message = process.stderr.read()
                    yield f"data: {json.dumps({'error': error_message.strip()})}\n\n"
                else:
                    yield 'data: {"message": "Task completed successfully."}\n\n'

                # Process JSON and SVG files after command completes
                json_content = []
                json_files = glob.glob(f"{unique_id}*.txt")
                if json_files:
                    for json_file_path in json_files:
                        with open(json_file_path, "r") as f:
                            for line in f:
                                json_content.append(json.loads(line.strip()))

                pdf_files = glob.glob(f"outputs/{unique_id}*.pdf")
                pdf_files = sorted(
                    pdf_files, key=lambda x: int(re.search(r"ymotif(\d+)", x).group(1))
                )
                # print(pdf_files)
                svg_content = []
                if which("pdf2svg"):
                    for pdf_path in pdf_files:
                        svg_path = pdf_path.replace(".pdf", ".svg")
                        subprocess.run(["pdf2svg", pdf_path, svg_path])
                        with open(svg_path, "r") as svg_file:
                            svg_content.append(
                                {
                                    "id": os.path.basename(svg_path).replace(
                                        ".svg", ""
                                    ),
                                    "content": svg_file.read(),
                                }
                            )
                        os.remove(pdf_path)
                        os.remove(svg_path)

                yield f"data: {json.dumps({'motifs': json_content, 'svgs': svg_content})}\n\n"

            except Exception as e:
                error_trace = traceback.format_exc()
                print(f"Error during streaming: {error_trace}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                # Delete all files containing the unique identifier
                clean_output(undesign_data_path, unique_id)

        response = Response(
            stream_with_context(generate()), mimetype="text/event-stream"
        )
        response.headers["X-Accel-Buffering"] = "no"
        response.headers["Cache-Control"] = "no-cache"
        response.headers["Connection"] = "keep-alive"
        return response

    except subprocess.CalledProcessError as e:
        # Log the specific error with detailed information
        error_trace = traceback.format_exc()
        print(f"Subprocess error: {error_trace}")
        clean_output(undesign_data_path)
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        # General exception handling to capture any other issues
        error_trace = traceback.format_exc()
        print(f"General error: {error_trace}")
        clean_output(undesign_data_path)
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
