// src/components/AllMotifsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Motif from "../../interfaces/Motif";
import { MotifPageState } from "../../interfaces/MotifPageState";
import { motifService } from "../../services/motifService";
import SearchBar from "../SearchBar";
import FamilyFilterDropdown from "../FamilyFilterDropdown";
import SortDropdown from "./SortDropdown";
import Pagination from "../Pagination";
import ItemsPerPage from "../ItemsPerPage";
import MotifListItem from "./MotifListItem";
import MotifItem from "../MotifItem";
import NewStructureInput from "./../NewStructureInput";
import LoadingSpinner from "../LoadingSpinnner";
import FindNewMotifsProgress from "./FindNewMotifsProgress";

const AllMotifsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const restoredMotifPageState = (location.state as MotifPageState) || {};
    const initialViewMode = restoredMotifPageState.viewMode || "grid";
    const initialCurrentPage = restoredMotifPageState.currentPage || 1;
    const initialItemsPerPage = restoredMotifPageState.itemsPerPage || 30;
    const initialSearchQuery = restoredMotifPageState.searchQuery || "";
    const initialSelectedFilters = restoredMotifPageState.selectedFilters || [];
    const initialSelectedSort =
        restoredMotifPageState.selectedSort || "Number of Families";
    const initialSortOrder = restoredMotifPageState.sortOrder || "desc";

    const [isFilterOpen, setFilterOpen] = useState(false);
    const [isSortOpen, setSortOpen] = useState(false);

    const [selectedFilters, setSelectedFilters] = useState<string[]>(
        initialSelectedFilters
    );
    const [selectedSort, setSelectedSort] =
        useState<string>(initialSelectedSort);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        initialSortOrder
    );

    const toggleFilterDropdown = () => setFilterOpen(!isFilterOpen);
    const toggleSortDropdown = () => setSortOpen(!isSortOpen);

    const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
    const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

    // Pagination states
    const [itemsPerPage, setItemsPerPage] =
        useState<number>(initialItemsPerPage);
    const [currentPage, setCurrentPage] = useState(initialCurrentPage);
    const [motifs, setMotifs] = useState<Motif[]>([]); // State to store the fetched motifs
    const [totalPages, setTotalPages] = useState(1); // State for total number of pages

    // New Structure Process States
    const [response, setResponse] = useState<{ motifs: Motif[] } | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [inputStructure, setInputStructure] = useState("");

    // Separate loading states
    const [loadingMotifs, setLoadingMotifs] = useState(false);
    const [loadingNewMotifs, setLoadingNewMotifs] = useState(false);
    const [progressUpdates, setProgressUpdates] = useState<string[]>([]); // Store all progress updates
    const abortControllerRef = useRef<AbortController | null>(null); // Ref to store AbortController
    const [error, setError] = useState<string | null>(null);

    // Fetch paginated motifs when component mounts or page/itemsPerPage changes
    useEffect(() => {
        const fetchMotifs = async () => {
            console.log("Fetching motifs...");
            setLoadingMotifs(true);
            setError(null); // Clear previous errors
            try {
                const data = await motifService.getFilteredPaginatedMotifs(
                    currentPage,
                    itemsPerPage,
                    selectedFilters,
                    searchQuery,
                    selectedSort,
                    sortOrder
                );
                setMotifs(data.motifs); // Set the fetched motifs
                const totalPages = Math.ceil(data.totalItems / itemsPerPage);
                setCurrentPage(Math.max(Math.min(currentPage, totalPages), 1)); // Reset current page if it exceeds total pages
                setTotalPages(totalPages); // Calculate total pages
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unknown error occurred"
                );
            } finally {
                setLoadingMotifs(false); // Stop loading after the request completes
            }
        };

        fetchMotifs();
    }, [
        currentPage,
        itemsPerPage,
        searchQuery,
        selectedFilters,
        selectedSort,
        sortOrder,
    ]);

    const handleViewClick = (motif: Motif) => {
        const motifPageState: MotifPageState = {
            viewMode,
            currentPage,
            itemsPerPage,
            searchQuery,
            selectedFilters,
            selectedSort,
            sortOrder,
        };
        navigate(`/motif/${motif.id}`, {
            state: {
                motif,
                motifPageState,
            },
        });
    };

    const handleNewButtonClick = () => {
        setIsDialogVisible(true);
    };

    const handleNewMotifsRedirection = () => {
        if (response && response.motifs && response.motifs.length > 0) {
            navigate("/new", { state: { motifs: response?.motifs } });
        } else {
            handleCancelNewMotifs();
        }
    };

    const handleDialogSubmit = async (newStructure: string) => {
        setError(null);
        setProgressUpdates([]);
        setIsDialogVisible(false); // Close the dialog
        setLoadingNewMotifs(true);

        // Initialize AbortController
        abortControllerRef.current = new AbortController();

        try {
            setInputStructure(newStructure);
            const motifs: Motif[] = await motifService.newStructure(
                newStructure,
                (progressUpdate: string) => {
                    setProgressUpdates((prevUpdates) => [
                        ...prevUpdates,
                        progressUpdate,
                    ]);
                },
                abortControllerRef.current.signal // Pass the signal to the service
            );
            setResponse({ motifs });
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                console.log("Request was canceled");
            } else {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred"
                );
            }
        }
    };

    const handleCloseDialog = () => {
        setIsDialogVisible(false);
    };

    const handleCancelNewMotifs = () => {
        // Abort the ongoing request
        setLoadingNewMotifs(false);
        setProgressUpdates([]);
        setResponse(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    // Render loading, error, or the grid of motifs
    if (loadingMotifs) {
        return <LoadingSpinner message="Loading Motifs..." />;
    }

    if (loadingNewMotifs) {
        return (
            <FindNewMotifsProgress
                inputStructure={inputStructure}
                progressUpdates={progressUpdates}
                response={response}
                onRedirectNowClick={handleNewMotifsRedirection}
                onCancel={handleCancelNewMotifs}
            />
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>FastMotif</h1>
            <p style={{ textAlign: "center", fontSize: "20px" }}>
                Scalable and Interpretable Identification of Minimal
                Undesignable RNA Structure Motifs with Rotational Invariance
            </p>
            {/* <div style={{ display: "flex", justifyContent: "end", alignItems: "center" }}> */}
            <a href="https://github.com/shanry/RNA-Undesign/">
                <i className="fab fa-github" style={{ marginRight: "8px" }}></i>
                https://github.com/shanry/RNA-Undesign/
            </a>
            {/* </div> */}
            <div className="container">
                <div className="header-bar">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />

                    <div className="header-section">
                        <div>
                            <button
                                className="new-structure-button"
                                onClick={handleNewButtonClick}
                            >
                                Input Structure
                            </button>

                            <NewStructureInput
                                placeholder="Enter dot-bracket structure"
                                onInputSubmit={handleDialogSubmit}
                                isVisible={isDialogVisible}
                                onClose={handleCloseDialog}
                            />
                        </div>
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchQueryChange={(e) => {
                                console.log("Search query changed:", e);
                                return setSearchQuery(e);
                            }}
                        />
                        <div className="view-toggle">
                            <button
                                className={`view-button ${
                                    viewMode === "grid" ? "active" : ""
                                }`}
                                onClick={() => setViewMode("grid")}
                            >
                                <i className="fas fa-th-large"></i> Icon View
                            </button>
                            <button
                                className={`view-button ${
                                    viewMode === "list" ? "active" : ""
                                }`}
                                onClick={() => setViewMode("list")}
                            >
                                <i className="fas fa-list"></i> List View
                            </button>
                        </div>
                    </div>

                    <div className="centered-container">
                        <div
                            className="centered-container"
                            style={{ gap: "0px" }}
                        >
                            <FamilyFilterDropdown
                                isOpen={isFilterOpen}
                                toggleDropdown={toggleFilterDropdown}
                                selectedFilters={selectedFilters}
                                setSelectedFilters={setSelectedFilters}
                            />

                            <SortDropdown
                                isOpen={isSortOpen}
                                toggleDropdown={toggleSortDropdown}
                                selectedSort={selectedSort}
                                setSelectedSort={setSelectedSort}
                                sortOrder={sortOrder}
                                setSortOrder={setSortOrder}
                            />
                        </div>
                        <div
                            className="center"
                            style={{ marginLeft: "8px", marginRight: "16px" }}
                        >
                            <ItemsPerPage
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />
                        </div>
                    </div>
                </div>

                {viewMode === "grid" ? (
                    <div className="grid-container">
                        {motifs.map((item, index) => (
                            <MotifItem
                                key={index}
                                item={item}
                                onViewClick={() => handleViewClick(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <div>
                        {/* Table-like header */}
                        <div className="list-header">
                            <span>Motif ID</span>
                            <span>#Families</span>
                            <span>#Occurrences</span>
                            <span>Length</span>
                            <span>#Boundary Pairs</span>
                            <span>#Internal Pairs</span>
                            <span>#Loops</span>
                        </div>
                        <div className="list-container">
                            {motifs.map((item, index) => (
                                <MotifListItem
                                    key={index}
                                    item={item}
                                    onViewClick={() => handleViewClick(item)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllMotifsPage;
