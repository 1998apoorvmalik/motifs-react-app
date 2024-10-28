// src/components/AllMotifsPage.tsx
import React, { useState, useEffect } from "react";
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

  // Dialog box state
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSortOpen, setSortOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    initialSelectedFilters
  );
  const [selectedSort, setSelectedSort] = useState<string>(initialSelectedSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  const toggleFilterDropdown = () => setFilterOpen(!isFilterOpen);
  const toggleSortDropdown = () => setSortOpen(!isSortOpen);

  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [motifs, setMotifs] = useState<Motif[]>([]); // State to store the fetched motifs
  const [totalPages, setTotalPages] = useState(1); // State for total number of pages
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch paginated motifs when component mounts or page/itemsPerPage changes
  useEffect(() => {
    const fetchMotifs = async () => {
      setLoading(true);
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
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false); // Stop loading after the request completes
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

  const handleDialogSubmit = async (newStructure: string) => {
    try {
      setLoading(true);
      const motifs: Motif[] = await motifService.newStructure(newStructure);

      navigate("/new", { state: { motifs } });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  };

  const handleCloseDialog = () => {
    setIsDialogVisible(false);
  };

  // Render loading, error, or the grid of motifs
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Motifs App</h1>
      <div className="container">
        <div className="header-bar">
          <div>
            <button className="header-button" onClick={handleNewButtonClick}>
              New
            </button>

            <NewStructureInput
              placeholder="Enter dot-bracket structure"
              onInputSubmit={handleDialogSubmit}
              isVisible={isDialogVisible}
              onClose={handleCloseDialog}
            />
          </div>

          {/* View toggle buttons */}
          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <i className="fas fa-th-large"></i> Icon View
            </button>
            <button
              className={`view-button ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <i className="fas fa-list"></i> List View
            </button>
          </div>

          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={(e) => {
              console.log("Search query changed:", e);
              return setSearchQuery(e);
            }}
          />

          <div className="right-section">
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

            <div
              className="center"
              style={{ marginLeft: "12px", marginRight: "8px" }}
            >
              <ItemsPerPage
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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
              <span>ID</span>
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
