import React, { useState, useEffect } from "react";
import Structure from "../../interfaces/Structure";
// import { motifService } from "./../../services/motifService";
// import StructureItem from "../StructureItem";
import Pagination from "../Pagination";
import ItemsPerPage from "../ItemsPerPage";
import { structureService } from "../../services/structureService";
import MotifItem from "../GridItem";
import Motif from "../../interfaces/Motif";
import { motifService } from "../../services/motifService";

interface GridProps {
    itemType: "motif" | "struc";
    itemIDs: Record<string, string[]>;
    currentPage: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (itemsPerPage: number) => void;
    handleViewClick: (item: Motif | Structure) => void; // Add onViewClick prop
}

const ItemsGridView: React.FC<GridProps> = ({
    itemType,
    itemIDs,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    handleViewClick,
}) => {
    const [items, setItems] = useState<Motif[] | Structure[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Calculate the total number of pages
    const totalPages = Math.ceil(Object.keys(itemIDs).length / itemsPerPage);

    // Get the items for the current page
    const paginatedItemIDs = Object.keys(itemIDs).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fetch the items
    useEffect(() => {
        const fetchStructures = async () => {
            setLoading(true);
            setError(null);
            try {
                let data: Motif[] | Structure[] = [];
                if (itemType === "motif") {
                    data = await Promise.all(
                        paginatedItemIDs.map((id) => motifService.getMotif(id))
                    );
                } else {
                    data = await Promise.all(
                        paginatedItemIDs.map((id) =>
                            structureService.getStructure(id, itemIDs[id])
                        )
                    );
                }

                setItems(data);
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
                {items.map((item) => {
                    // console.log(item);
                    return (
                        <MotifItem
                            key={item.id}
                            item={item}
                            // index={(currentPage - 1) * itemsPerPage + index}
                            onViewClick={() => handleViewClick(item)} // Pass click handler to trigger navigation
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ItemsGridView;
