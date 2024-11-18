import React, { useState } from "react";

interface SearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchQueryChange,
}) => {
    const [localQuery, setLocalQuery] = useState<string>(searchQuery);

    // Handle Enter key press or blur event
    const handleInputCommit = () => {
        onSearchQueryChange(localQuery);
    };

    return (
        <input
            type="text"
            placeholder="Search by ID"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)} // Update local state
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleInputCommit(); // Trigger search on Enter
                }
            }}
            onBlur={handleInputCommit} // Trigger search when input loses focus
            className="search-bar"
            style={{ width: "200px", marginRight: "24px" }}
        />
    );
};

export default SearchBar;
