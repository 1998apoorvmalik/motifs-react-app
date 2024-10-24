// src/services/motifService.ts
export interface MotifData {
  id: string;
  ocrnc_count: number;
  length: number;
  families: { [familyName: string]: number }; // Dictionary of family counts
  bpairs: number[][];
  ipairs: number[][];
  loops: number[];
  pdf: string; // Single PDF path based on index
  svg: string; // Single SVG path based on index
  y_sub: string;
  y_star: string;
  structures: string[];
}

const files = [
  'uniq_jsons.txt', // File containing all entries
];

// export const fetchMotifData = async (): Promise<MotifData[]> => {
//   const promises = files.map(async (file) => {
//     const response = await fetch(`/assets/motifs/${file}`);
//     const text = await response.text();
//     return parseMotifData(text);
//   });

//   const data = await Promise.all(promises);
//   const flatData = data.flat(); // Flatten in case of multiple files
//   return flatData;
// };

export const fetchMotifData = async (): Promise<MotifData[]> => {
  const files = ['uniq_jsons.txt'];
  
  const promises = files.map(async (file) => {
    try {
      const response = await fetch(`/assets/motifs/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
      }

      const text = await response.text();

      if (text.startsWith("<")) {
        throw new Error("Received HTML instead of JSON. Check the file path.");
      }

      return parseMotifData(text);
    } catch (error) {
      console.error(error);
      return []; // Return an empty array on error
    }
  });

  const data = await Promise.all(promises);
  const flatData = data.flat();

  // Sort by `ocrnc_count`
  const sortedData = flatData.sort((a, b) => {
    return b.ocrnc_count - a.ocrnc_count; // Sort in descending order by `ocrnc_count`
  });

  return sortedData;
};

// Parse the text data and generate MotifData objects
const parseMotifData = (text: string): MotifData[] => {
  return text
    .trim()
    .split('\n')
    .map((line, index) => {
      const json = JSON.parse(line); // Parse each line of JSON data
      const pdf = generatePdfUrl(index + 1); // Generate PDF URL based on the index
      const svg = generateSvgUrl(index + 1); // Generate SVG URL based on the index

      return {
        id: index.toString(),
        ocrnc_count: (Object.values(json.family2count) as number[]) // Cast as number[]
          .reduce((acc, count) => acc + count, 0), // Sum family2count
        length: json.length,
        families: json.family2count,      // Family count mapping from JSON
        bpairs: json.bpairs,              // Base pairs
        ipairs: json.ipairs,              // Internal pairs
        loops: json.motif.root.children[0]?.loops || [], // Extract loops safely
        pdf,
        svg,
        y_sub: json.y_sub,                // y_sub structure
        y_star: json.y_star,              // y_star structure
        structures: getStructuresUrl(json.occurrences) // Get structure URLs
      };
    });
};

// Generate the correct PDF URL using the index
const generatePdfUrl = (index: number): string => {
  return `${process.env.PUBLIC_URL}/assets/motifs/uniq_motifs/${index}_mode0.pdf`; // PDFs are indexed by the position in the file
};

const generateSvgUrl = (index: number): string => {
  return `${process.env.PUBLIC_URL}/assets/motifs/uniq_motifs_svg/${index}_mode0.svg`; // SVGs are indexed by the position in the file
}

const getStructuresUrl = (fileNames: string[]): string[] => { 
  return fileNames.map((fileName) => `${process.env.PUBLIC_URL}/assets/motifs/structures_svg/${fileName}.svg`);
};