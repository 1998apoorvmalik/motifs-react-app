import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Motif from "../../interfaces/Motif";
import MotifItem from "../MotifItem";
import Pagination from "../Pagination";
import ItemsPerPage from "../ItemsPerPage";

interface LocationState {
  motifs: Motif[];
}

const NewMotifsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { motifs } = location.state as LocationState;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Calculate total pages based on motifs length and items per page
    setTotalPages(Math.ceil(motifs.length / itemsPerPage));
    // Reset to the first page when items per page changes
    setCurrentPage(1);
  }, [motifs.length, itemsPerPage]);

  const handleBackClick = () => {
    navigate("/");
  };

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMotifs = motifs.slice(startIndex, endIndex);

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
          ? `Found ${motifs.length} Undesignable Motifs in the Input Structure`
          : "No Undesignable Motifs Found in the Input Structure!"}
      </h2>
      <div className="container">
        <div className="header-bar">
          <div style={{ marginLeft: "16px" }}>
            <ItemsPerPage
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1); // Reset to first page when items per page changes
              }}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)} // Ensure page updates
          />
        </div>
        <div
          className="grid-container"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(50%, 1fr))" }}
        >
          {currentMotifs.map((item, index) => (
            <MotifItem
              key={index}
              item={item}
              height="60vh"
              onViewClick={() => console.log(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewMotifsPage;
