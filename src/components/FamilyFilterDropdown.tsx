import React, { useState } from "react";
import { familyMapping } from "../constants/familyMapping";

interface FamilyFilterProps {
    selectedFilters: string[];
    setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

const filterOptions = familyMapping;

const FamilyFilter: React.FC<FamilyFilterProps> = ({
    selectedFilters,
    setSelectedFilters,
}) => {
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

    const applyFilters = () => {
        setSelectedFilters(tempFilters);
    };

    const resetFilters = () => {
        // setTempFilters([]);
        setSelectedFilters([]);
    };

    return (
        <div className="filter-container">
            {/* Render all filter options horizontally */}
            <div
                className="inline-container"
                style={{ justifyContent: "space-between" }}
            >
                <div></div>
                <h3 style={{ margin: "0px" }}>Family Filter</h3>
                <div className="filter-actions">
                    <button onClick={applyFilters} className="apply-button">
                        Apply
                    </button>
                    <button onClick={resetFilters} className="reset-button">
                        Reset
                    </button>
                </div>
            </div>
            <div className="filter-options">
                {filterOptions.map((option) => (
                    <div key={option.value} className="filter-item">
                        <label className="filter-label">
                            <input
                                type="checkbox"
                                style={{ marginLeft: 0, marginRight: 0 }}
                                checked={tempFilters.includes(option.value)}
                                onChange={() =>
                                    handleFilterChange(option.value)
                                }
                            />
                            {option.display}
                        </label>
                    </div>
                ))}
            </div>
            {/* Apply and Reset buttons */}
        </div>
    );
};

export default FamilyFilter;
