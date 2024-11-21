import json
from pymongo import MongoClient

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017/")
db = client["motifs"]
data_collection = db["motifs"]


def export_motifs_data(file_path):
    try:
        # Open the file in write mode
        with open(file_path, "w") as file:
            # Iterate over each document in the collection
            for document in data_collection.find():
                # Convert each document to a JSON string
                json_line = json.dumps(document, default=str)
                # Write the JSON string to the file, followed by a newline
                file.write(json_line + "\n")

        print(f"Data successfully exported to {file_path}")

    except Exception as e:
        print(f"An error occurred while exporting data: {str(e)}")


if __name__ == "__main__":
    export_motifs_data("lib_undesignable.txt")
