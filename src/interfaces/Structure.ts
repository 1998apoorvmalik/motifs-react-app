// src/iterfaces/Structure.ts

export default interface Structure {
    type: "struc";
    id: string;
    name: string;
    names: string[];
    family: string;
    dotBracket: string;
    length: number;
    numLoops: number;
    numPairs: number;
    motifsID: string[];
    svgContent: string[]; // svg xml string
}

export function structureFromJson(data: any): Structure {
    return {
        type: "struc",
        id: data._id || "unknown",
        name: data.name || "unknown",
        names: data.names || [],
        family: data.family || "unknown",
        dotBracket: data.dot_bracket || "",
        length: data.length || 0,
        numLoops: data.num_loops || 0,
        numPairs: data.num_pairs || 0,
        motifsID: data.motifs_id || [],
        svgContent: data.svg_content || [],
    };
}
