import React, { useEffect, useRef, useState } from "react";

interface SortDropdownProps {
  isOpen: boolean;
  toggleDropdown: () => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

const sortOptions = [
  "ID",
  "Number of Occurrences",
  "Number of Families",
  "Length",
  "Boundary Pairs",
  "Internal Pairs",
  "Number of Loops",
];

const SortDropdown: React.FC<SortDropdownProps> = ({
  isOpen,
  toggleDropdown,
  selectedSort,
  setSelectedSort,
  sortOrder,
  setSortOrder,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Temporary state for sort options when the dropdown is open
  const [tempSort, setTempSort] = useState<string>(selectedSort);
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">(sortOrder);

  // Handle sort option changes in temp state
  const handleSortChange = (sort: string) => {
    setTempSort(sort);
  };

  // Handle sort order changes in temp state
  const handleSortOrderChange = (order: "asc" | "desc") => {
    setTempSortOrder(order);
  };

  // Handle click outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        toggleDropdown(); // Close the dropdown
        setTempSort(selectedSort); // Reset temp sort
        setTempSortOrder(sortOrder); // Reset temp sort order
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleDropdown, selectedSort, sortOrder]);

  // Apply the selected sort and order to the main state
  const applySort = () => {
    setSelectedSort(tempSort);  // Since selectedSort cannot be null, no need for checks
    setSortOrder(tempSortOrder);
    toggleDropdown(); // Close the dropdown after applying sort
  };

  // Reset the sort and order to the default state
  const resetSort = () => {
    setTempSort("ID"); // Reset to default
    setTempSortOrder("asc"); // Reset sort order to default
  };

  return (
    <div ref={dropdownRef} className="dropdown">
      <button
        className={`header-button ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
      >
        Sort
      </button>
      {isOpen && (
        <div className="dropdown-menu" style={{ width: "300px" }}>
          {sortOptions.map((option) => (
            <div key={option} className="dropdown-item">
              <label className="dropdown-label">
                <input
                  type="radio"
                  name="sort"
                  checked={tempSort === option}
                  onChange={() => handleSortChange(option)}
                />
                {option}
              </label>
            </div>
          ))}

          <div className="horizontal-spacer"></div>

          <div className="dropdown-item" style={{ borderTopWidth: "1px" }}>
            <label className="dropdown-label">
              <input
                type="radio"
                name="order"
                checked={tempSortOrder === "asc"}
                onChange={() => handleSortOrderChange("asc")}
              />
              Ascending
            </label>
          </div>

          <div className="dropdown-item">
            <label className="dropdown-label">
              <input
                type="radio"
                name="order"
                checked={tempSortOrder === "desc"}
                onChange={() => handleSortOrderChange("desc")}
              />
              Descending
            </label>
          </div>

          {/* Apply and Reset buttons */}
          <div className="dropdown-actions">
            <button onClick={applySort} className="apply-button">
              Apply
            </button>
            <button onClick={resetSort} className="reset-button">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
