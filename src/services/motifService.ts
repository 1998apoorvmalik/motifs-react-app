import axios from "axios";
import Motif, { motifFromJson } from "../interfaces/Motif";
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

  async getMotif(id: string): Promise<Motif> {
    try {
      // console.log("Fetching Motif with ID:", id); // Debugging line
      const response = await axios.get(API_URL + "/motif", {
        params: { id },
      });
      return motifFromJson(response.data);
    } catch (error: unknown) {
      this._handleError(error);
    }
    return {} as Motif; // Return an empty motif in case of error
  },

  async getStructure(id: string): Promise<Structure> {
    try {
      // console.log("Fetching Structure with ID:", id); // Debugging line
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

      const motifs: Motif[] = response.data.motifs.map(motifFromJson);

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

  async newStructure(
    structure: string,
    onProgress: (progress: string) => void,
    signal: AbortSignal // Add the AbortSignal parameter
  ): Promise<Motif[]> {
    const motifs: Motif[] = [];
    let partialData = "";

    const response = await fetch(`${API_URL}/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structure }),
      signal, // Pass the signal to the fetch request
    });

    if (!response.body) {
      throw new Error("Streaming not supported by this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    return new Promise<Motif[]>((resolve, reject) => {
      const processChunk = async () => {
        let done: boolean;
        let value: Uint8Array | undefined;

        while ((({ done, value } = await reader.read()), !done)) {
          const chunk = decoder.decode(value, { stream: true });
          partialData += chunk;

          const lines = partialData.split("\n\n");
          partialData = lines.pop() || "";

          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              try {
                const parsedData = JSON.parse(line.slice(6));

                if (parsedData.error) {
                  reject(new Error(parsedData.error));
                } else if (parsedData.progress) {
                  onProgress(parsedData.progress);
                } else if (parsedData.motifs && parsedData.svgs) {
                  parsedData.motifs.forEach((motifData: any, index: number) => {
                    // console.log(motifData.id, motifData.id_uniq); // debugging line
                    const newMotif = motifFromJson(motifData);
                    newMotif.id =
                      (motifData.id_uniq > 361 ? "New" : motifData.id_uniq) ||
                      motifData.id; // Use id_uniq if available
                    newMotif.svg = parsedData.svgs[index]?.content || "";
                    motifs.push(newMotif);
                  });
                }
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
          });
        }

        resolve(motifs);
      };

      processChunk().catch((error) => {
        reject(error);
      });
    });
  },
};
