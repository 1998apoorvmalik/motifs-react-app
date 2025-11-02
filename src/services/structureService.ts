// src/services/structureService.ts
import axios from 'axios';
import Structure, { structureFromJson } from '../interfaces/Structure';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const structureService = {
  async _handleError(error: unknown): Promise<void> {
    // Handle the error and throw it to be caught in the component
    if (axios.isAxiosError(error)) {
      // Axios error with a response from the server
      if (error.response) {
        throw new Error(`Error: ${error.response.status} - ${error.response.statusText}`);
      }
      // No response received (network issue or server unreachable)
      else if (error.request) {
        throw new Error('No response received from the server');
      }
    }
    // Handle other generic errors
    if (error instanceof Error) {
      throw new Error(error.message || 'An unknown error occurred');
    } else {
      throw new Error('An unknown error occurred');
    }
  },

  async getStructure(id: string, motifNums: string[]): Promise<Structure> {
    try {
      // console.log("Fetching Structure with ID:", id); // Debugging line
      const response = await axios.get(API_URL + '/struc', {
        params: { id, motifNums: motifNums.join(',') },
      });
      return structureFromJson(response.data);
    } catch (error: unknown) {
      this._handleError(error);
    }
    return {} as Structure; // Return an empty structure in case of error
  },

  async getFilteredPaginatedStructures(
    page: number,
    limit: number,
    families: string[],
    strucID: string,
    sortField: string,
    sortOrder: string
  ): Promise<{
    totalItems: number;
    strucs: Structure[];
  }> {
    try {
      const response = await axios.get(API_URL + '/strucs', {
        params: {
          page,
          limit,
          families: families.join(','), // Convert array to comma-separated string
          strucID,
          sortField,
          sortOrder,
        },
      });

      const strucs: Structure[] = response.data.strucs.map(structureFromJson);

      return {
        totalItems: response.data.totalItems,
        strucs: strucs,
      };
    } catch (error: unknown) {
      this._handleError(error);
    }
    return {
      totalItems: 0,
      strucs: [],
    };
  },
};
