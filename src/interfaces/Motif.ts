// src/interfaces/motif.tsx
import { familyDisplayMap } from "../constants/familyMapping";

export default interface Motif {
    type: "motif";
    id: string;
    motif: Object;
    new: boolean;
    numOccurences: number;
    length: number;
    families: { [familyName: string]: number };
    bpairs: number[][];
    ipairs: number[][];
    numLoops: number;
    svg: string;
    dotBracket: string[];
    structures_id: string[];
}

export function motifFromJson(data: any): Motif {
    // Type the result of Object.fromEntries explicitly to match { [key: string]: number }
    const families: { [key: string]: number } = Object.fromEntries(
        Object.entries(data.family2count || {}).map(([key, count]) => [
            familyDisplayMap[key] || key,
            count as number, // Assert count as number
        ])
    );

    return {
        type: "motif",
        id: data._id || "unknown",
        motif: data.motif || {},
        new: !data.is_duplicated || false,
        numOccurences: data.occurrences?.length || 0,
        length: data.length || 0,
        families, // Mapped family names with correct typing
        bpairs: data.bpairs || [],
        ipairs: data.ipairs || [],
        numLoops: data.cardinality || 0,
        svg: data.motif_svg || "",
        dotBracket: data["dot-bracket"] || [],
        structures_id: data.occurrences || [],
    };
}
