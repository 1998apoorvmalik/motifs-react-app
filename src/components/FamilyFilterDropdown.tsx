import React, { useEffect, useRef, useState } from "react";
import { familyMapping } from "../constants/familyMapping";

interface FamilyFilterDropdownProps {
    isOpen: boolean;
    toggleDropdown: () => void;
    selectedFilters: string[];
    setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

const filterOptions = familyMapping;

const FamilyFilterDropdown: React.FC<FamilyFilterDropdownProps> = ({
    isOpen,
    toggleDropdown,
    selectedFilters,
    setSelectedFilters,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Temporary filters state for when the dropdown is open
    const [tempFilters, setTempFilters] = useState<string[]>(selectedFilters);

    const handleFilterChange = (filterValue: string) => {
        setTempFilters((prevFilters) => {
            if (prevFilters.includes(filterValue)) {
                return prevFilters.filter((f) => f !== filterValue);
            } else {
                return [...prevFilters, filterValue];
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
                toggleDropdown();
                setTempFilters(selectedFilters);
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
    }, [isOpen, toggleDropdown, selectedFilters]);

    // Apply selected filters to the main state
    const applyFilters = () => {
        setSelectedFilters(tempFilters);
        toggleDropdown();
    };

    // Reset the selected filters
    const resetFilters = () => {
        setTempFilters([]);
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
                <div className="dropdown-menu">
                    {filterOptions.map((option) => (
                        <div key={option.value} className="dropdown-item">
                            <label className="dropdown-label">
                                <input
                                    type="checkbox"
                                    checked={tempFilters.includes(option.value)}
                                    onChange={() =>
                                        handleFilterChange(option.value)
                                    }
                                />
                                {option.display}
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
