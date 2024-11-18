import React, { useState, useEffect } from "react";
import Structure from "./../../interfaces/Structure";
import { motifService } from "./../../services/motifService";
import StructureItem from "./StructureItem";
import Pagination from "./../Pagination";
import ItemsPerPage from "../ItemsPerPage";

interface GridProps {
    structureIDs: string[];
    currentPage: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (itemsPerPage: number) => void;
    handleViewClick: (structure: Structure) => void; // Add onViewClick prop
}

const StructuresGridView: React.FC<GridProps> = ({
    structureIDs,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    handleViewClick,
}) => {
    const [structures, setStructures] = useState<Structure[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Calculate the total number of pages
    const totalPages = Math.ceil(structureIDs.length / itemsPerPage);

    // Get the items for the current page
    const paginatedStructureIDs = structureIDs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fetch the structures
    useEffect(() => {
        const fetchStructures = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await Promise.all(
                    paginatedStructureIDs.map((id) =>
                        motifService.getStructure(id)
                    )
                );
                setStructures(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unknown error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStructures();
    }, [currentPage, itemsPerPage]);

    if (loading) {
        return (
            <div
                className="centered-container"
                style={{ minHeight: "50vh", flexDirection: "column" }}
            >
                <p>Loading Structures...</p>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container">
            <div className="header-bar">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div style={{ marginRight: "16px" }}>
                    <ItemsPerPage
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {/* Display structures in a grid */}
            <div className="grid-container">
                {structures.map((item, index) => (
                    <StructureItem
                        item={item}
                        index={(currentPage - 1) * itemsPerPage + index}
                        key={item.id}
                        onViewClick={() => handleViewClick(item)} // Pass click handler to trigger navigation
                    />
                ))}
            </div>
        </div>
    );
};

export default StructuresGridView;
