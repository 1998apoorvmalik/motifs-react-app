import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Motif from "../../interfaces/Motif";
import MotifItem from "../GridItem";
import Pagination from "../Pagination";
import ItemsPerPage from "../ItemsPerPage";
import MotifFilterDropdown from "./MotifFilterDropdown";

interface LocationState {
    motifs: Motif[];
}

const NewMotifsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [redirecting, setRedirecting] = useState(false);

    const motifs = useMemo(
        () => (location.state as LocationState)?.motifs || [],
        [location.state]
    );

    // Calculate newMotifCount based on the original motifs array
    const newMotifCount = useMemo(
        () => motifs.filter((motif) => motif.id === "New").length,
        [motifs]
    );

    useEffect(() => {
        if (!location.state) {
            setRedirecting(true);
            setTimeout(() => navigate("/"), 2000);
        }
    }, [location.state, navigate]);

    // Pagination and filtering states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(5);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);

    // Count new motifs when motifs data changes
    useEffect(() => {
        setTotalPages(Math.ceil(motifs.length / itemsPerPage));
        setCurrentPage(1);
    }, [motifs.length, itemsPerPage]);

    const handleBackClick = () => {
        navigate("/");
    };

    const toggleFilterDropdown = () => {
        setFilterDropdownOpen(!isFilterDropdownOpen);
    };

    // Filter motifs based on the selected filter
    const filteredMotifs = motifs.filter((motif) =>
        selectedFilter === "New Motif"
            ? motif.id === "New"
            : selectedFilter === "Old Motif"
            ? motif.id !== "New"
            : true
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMotifs = filteredMotifs.slice(startIndex, endIndex);

    if (redirecting) {
        return (
            <h2>
                You cannot navigate to this page directly! Redirecting to
                homepage...
            </h2>
        );
    }

    return (
        <div>
            <button
                className="back-button"
                onClick={handleBackClick}
                style={{ marginTop: "16px" }}
            >
                {"< Back to All Motifs Page"}
            </button>
            <h2 style={{ textAlign: "center" }}>
                {motifs.length > 0
                    ? `Found ${
                          motifs.length
                      } (${newMotifCount} New) Undesignable ${
                          motifs.length === 1 ? "Motif" : "Motifs"
                      } in the Input Structure`
                    : "No Undesignable Motifs Found in the Input Structure!"}
            </h2>
            <div className="container">
                <div className="header-bar">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                    <div className="centered-container">
                        <MotifFilterDropdown
                            isOpen={isFilterDropdownOpen}
                            toggleDropdown={toggleFilterDropdown}
                            selectedFilter={selectedFilter}
                            setSelectedFilter={setSelectedFilter}
                        />
                        <div style={{ marginLeft: "8px", marginRight: "16px" }}>
                            <ItemsPerPage
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={(value) => {
                                    setItemsPerPage(value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className="grid-container"
                    style={{
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(50%, 1fr))",
                    }}
                >
                    {currentMotifs.map((item, index) => (
                        <MotifItem
                            key={index}
                            item={item}
                            height="60vh"
                            onViewClick={
                                item.id !== "New"
                                    ? () => navigate(`/motif/${item.id}`)
                                    : undefined
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewMotifsPage;
