import Motif from "./Motif";

export interface ItemsPageState {
    viewMode: "grid" | "list"; // The current view mode for displaying motifs
    currentPage: number; // The current page number
    itemsPerPage: number; // The number of items per page
    searchQuery: string; // The current search query
    selectedFilters: string[]; // Array of selected filters
    selectedSort: string; // The selected sorting option
    sortOrder: "asc" | "desc"; // The order of sorting
}

export interface ExpandedItemPageState {
    motif: Motif; // The current motif being viewed
    currentPage: number; // The current page number
    itemsPerPage: number; // The number of items per page
}
