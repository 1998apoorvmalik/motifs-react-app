import axios from "axios";
import Motif, { motifFromJson } from "../interfaces/Motif";
import Structure from "../interfaces/Structure";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";

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
        signal: AbortSignal
    ): Promise<Motif[]> {
        function parseJSONSafely(jsonString: string): any | null {
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                console.error("Failed to parse JSON:", error);
                return null;
            }
        }

        function parseAndStoreMotifs(jsonData: any, motifs: Motif[]) {
            jsonData.motifs.forEach((motifData: any, index: number) => {
                try {
                    const newMotif = motifFromJson(motifData);
                    newMotif.id =
                        (motifData.id_uniq > 361 ? "New" : motifData.id_uniq) ||
                        motifData.id;
                    newMotif.svg = jsonData.svgs[index]?.content || "";
                    motifs.push(newMotif);
                } catch (error) {
                    console.error("Error processing motif data:", error);
                }
            });
        }

        const motifs: Motif[] = [];
        let partialData = "";

        const response = await fetch(`${API_URL}/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ structure }),
            signal,
        });

        if (!response.body) {
            throw new Error("Streaming not supported by this browser.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        return new Promise<Motif[]>((resolve, reject) => {
            const processChunk = async () => {
                try {
                    let done: boolean = false;

                    while (!done) {
                        const { value, done: readerDone } = await reader.read();
                        done = readerDone;

                        if (value) {
                            const chunk = decoder.decode(value, {
                                stream: true,
                            });
                            partialData += chunk;

                            // Process lines
                            const lines = partialData.split("\n\n");
                            partialData = lines.pop() || "";

                            for (const line of lines) {
                                if (line.startsWith("data: ")) {
                                    const jsonData = parseJSONSafely(
                                        line.slice(6)
                                    );
                                    if (!jsonData) continue; // Skip invalid JSON

                                    if (jsonData.error) {
                                        reject(new Error(jsonData.error));
                                        return;
                                    }

                                    if (jsonData.progress) {
                                        onProgress(jsonData.progress);
                                    }

                                    if (jsonData.motifs && jsonData.svgs) {
                                        parseAndStoreMotifs(jsonData, motifs);
                                    }
                                }
                            }
                        }
                    }

                    resolve(motifs);
                } catch (error) {
                    reject(error);
                }
            };

            processChunk().catch(reject);
        });
    },
};
