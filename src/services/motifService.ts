import axios from "axios";
import Motif from "../interfaces/Motif";
import Structure from "../interfaces/Structure";


const API_URL = process.env.REACT_APP_API_URL || "/127.0.0.1:5000";

// Service to fetch paginated motif data
export const motifService = {
  async _handleError(error: unknown): Promise<void> {
    // Handle the error and throw it to be caught in the component
    if (axios.isAxiosError(error)) {
      // Axios error with a response from the server
      if (error.response) {
        throw new Error(
          `Error: ${error.response.status} - ${error.response.statusText}`
        );
      }
      // No response received (network issue or server unreachable)
      else if (error.request) {
        throw new Error("No response received from the server");
      }
    }
    // Handle other generic errors
    if (error instanceof Error) {
      throw new Error(error.message || "An unknown error occurred");
    } else {
      throw new Error("An unknown error occurred");
    }
  },

  async getMotifsCount(): Promise<number> {
    try {
      const response = await axios.get(API_URL + "/total");
      return response.data.count;
    } catch (error: unknown) {
      this._handleError(error);
    }
    return 0;
  },

  async getFilteredPaginatedMotifs(
    page: number,
    limit: number,
    families: string[],
    motifID: string,
    sortField: string,
    sortOrder: string
  ): Promise<{
    totalItems: number;
    motifs: Motif[];
  }> {
    try {
      const response = await axios.get(API_URL + "/motifs", {
        params: {
          page,
          limit,
          families: families.join(","), // Convert array to comma-separated string
          motifID,
          sortField,
          sortOrder,
        },
      });

      const motifs: Motif[] = response.data.motifs.map((motif: any) => ({
        id: motif._id,
        numOccurences: motif.occurrences.length,
        length: motif.length,
        families: motif.family2count,
        bpairs: motif.bpairs,
        ipairs: motif.ipairs,
        loops: motif.cardinality,
        svg: motif.motif_svg,
        y_sub: motif.y_sub,
        y_star: motif.y_star,
        structures_id: motif.occurrences,
      }));

      return {
        totalItems: response.data.totalItems,
        motifs: motifs,
      };
    } catch (error: unknown) {
      this._handleError(error);
    }
    return {
      totalItems: 0,
      motifs: [],
    };
  },

  async getStructure(id: string): Promise<Structure> {
    try {
      const response = await axios.get(API_URL + "/structure", {
        params: { id },
      });

      const structure: Structure = {
        id: response.data.id,
        family: response.data.id.split("_")[0],
        svgContent: response.data.svg_content,
      };
      return structure;
    } catch (error: unknown) {
      this._handleError(error);
    }
    return {} as Structure; // Return an empty structure in case of error
  },

  async newStructure(structure: string): Promise<Motif[]> {
    try {
      const response = await axios.post(API_URL + "/new", { structure });
  
      // Convert the `motifs` field to an array of `Motif` objects
      const motifs: Motif[] = response.data.motifs.map((motifData: any, index: number) => ({
        id: motifData.id,
        numOccurences: motifData.numOccurences || 0,
        length: motifData.end - motifData.start + 1,
        families: [],
        bpairs: motifData.bpairs,
        ipairs: motifData.ipairs,
        loops: motifData.ipairs.length + 1,
        svg: response.data.svgs[index]?.content || "", // Use the corresponding SVG content
        y_sub: motifData.y_sub,
        y_star: motifData.y_star,
        structures_id: [],
      }));

      return motifs;
    } catch (error: unknown) {
      this._handleError(error);
    }
    return [] as Motif[]; // Return an empty array in case of error
  }
};
