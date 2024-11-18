// src/components/MotifFilterDropdown.tsx
import React, { useEffect, useRef } from "react";

interface MotifFilterDropdownProps {
    isOpen: boolean;
    toggleDropdown: () => void;
    selectedFilter: string | null;
    setSelectedFilter: React.Dispatch<React.SetStateAction<string | null>>;
}

const filterOptions = ["New Motif", "Old Motif"];

const MotifFilterDropdown: React.FC<MotifFilterDropdownProps> = ({
    isOpen,
    toggleDropdown,
    selectedFilter,
    setSelectedFilter,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                toggleDropdown(); // Close the dropdown
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

    const handleFilterChange = (filter: string | null) => {
        setSelectedFilter(filter);
        toggleDropdown();
    };

    return (
        <div ref={dropdownRef} className="dropdown">
            <button
                className={`header-button ${isOpen ? "active" : ""}`}
                onClick={toggleDropdown}
            >
                Filter Motifs
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {filterOptions.map((option) => (
                        <div key={option} className="dropdown-item">
                            <label className="dropdown-label">
                                <input
                                    type="radio"
                                    name="motifFilter"
                                    checked={selectedFilter === option}
                                    onChange={() => handleFilterChange(option)}
                                />
                                {option}
                            </label>
                        </div>
                    ))}
                    <div className="dropdown-actions">
                        <button
                            onClick={() => handleFilterChange(null)}
                            className="reset-button"
                            style={{ flexGrow: 1 }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MotifFilterDropdown;
