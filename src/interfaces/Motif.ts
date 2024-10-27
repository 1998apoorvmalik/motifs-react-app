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
  y_sub: string;
  y_star: string;
  structures_id: string[];
}
