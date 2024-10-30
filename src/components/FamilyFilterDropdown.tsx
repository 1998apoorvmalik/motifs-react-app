// src/components/FamilyFilterDropdown.tsx
import React, { useEffect, useRef, useState } from "react";

interface FamilyFilterDropdownProps {
  isOpen: boolean;
  toggleDropdown: () => void;
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

const filterOptions = [
  "eterna",
  "5s",
  "srp",
  "RNaseP",
  "tmRNA",
  "grp1",
  "16s",
  "23s",
  "Others",
];

const FamilyFilterDropdown: React.FC<FamilyFilterDropdownProps> = ({
  isOpen,
  toggleDropdown,
  selectedFilters,
  setSelectedFilters,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Temporary filters state for when the dropdown is open
  const [tempFilters, setTempFilters] = useState<string[]>(selectedFilters);

  const handleFilterChange = (filter: string) => {
    setTempFilters((prevFilters) => {
      if (prevFilters.includes(filter)) {
        return prevFilters.filter((f) => f !== filter);
      } else {
        return [...prevFilters, filter];
      }
    });
  };

  // Handle click outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        toggleDropdown(); // Close the dropdown
        setTempFilters(selectedFilters); // Reset temp filters
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
  }, [isOpen, toggleDropdown]);

  // Apply selected filters to the main state
  const applyFilters = () => {
    setSelectedFilters(tempFilters);
    toggleDropdown(); // Close the dropdown after applying filters
  };

  // Reset the selected filters
  const resetFilters = () => {
    setTempFilters([]); // Reset temp filters
  };

  return (
    <div ref={dropdownRef} className="dropdown">
      <button
        className={`header-button ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
      >
        Filter
      </button>
      {isOpen && (
        <div className={"dropdown-menu"}>
          {filterOptions.map((option) => (
            <div key={option} className={"dropdown-item"}>
              <label className={"dropdown-label"}>
                <input
                  type="checkbox"
                  checked={tempFilters.includes(option)}
                  onChange={() => handleFilterChange(option)}
                />
                {option}
              </label>
            </div>
          ))}
          {/* Apply and Reset buttons */}
          <div className="dropdown-actions">
            <button onClick={applyFilters} className="apply-button">
              Apply
            </button>
            <button onClick={resetFilters} className="reset-button">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyFilterDropdown;
