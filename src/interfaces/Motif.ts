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
  dotBracket: string; // Dot-bracket notation of the motif
  structures_id: string[];
}
