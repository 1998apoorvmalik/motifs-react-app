// src/interfaces/motif.tsx

export default interface Motif {
  id: string;
  numOccurences: number;
  length: number;
  families: { [familyName: string]: number }; // Dictionary of family counts
  bpairs: number[][];
  ipairs: number[][];
  loops: number;
  svg: string; // Single SVG path based on index
  dotBracket: string[]; // Dot-bracket notation of the motif
  structures_id: string[];
}

// Function to map raw json data (possible from a server response) to a Motif object with default values
export function motifFromJson(data: any): Motif {
  return {
    id: data._id || "unknown",                          // Default to "unknown" if id is missing
    numOccurences: data.occurrences?.length || 0,       // Default to 0 if occurrences is missing
    length: data.length || 0,                           // Default to 0 if length is missing
    families: data.family2count || {},                  // Default to an empty object if families are missing
    bpairs: data.bpairs || [],                          // Default to an empty array if bpairs are missing
    ipairs: data.ipairs || [],                          // Default to an empty array if ipairs are missing
    loops: data.cardinality || 0,                       // Default to 0 if loops are missing
    svg: data.motif_svg || "",                          // Default to an empty string if svg is missing
    dotBracket: data["dot-bracket"] || [],              // Default to an empty array if dot-bracket is missing
    structures_id: data.occurrences || []               // Default to an empty array if structures_id is missing
  };
}

