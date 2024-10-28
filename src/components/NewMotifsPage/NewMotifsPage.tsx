// src/components/NewMotifsPage/NewMotifsPage.tsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Motif from "../../interfaces/Motif";
import MotifItem from "../MotifItem";

interface LocationState {
  motifs: Motif[];
}

const NewMotifsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { motifs } = location.state as LocationState; // Retrieve motifs from location state

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div>
      <button
        className="back-button"
        onClick={handleBackClick}
        style={{ marginTop: "16px" }}
      >
        {"< Back to All Motifs Page"}
      </button>
      <h2>
        {motifs.length > 0
          ? "Undesignable Motifs in the Input Structure"
          : "No Undesignable Motifs Found in the Input Structure!"}
      </h2>
      <div
        className="grid-container"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(50%, 1fr))" }}
      >
        {motifs.map((item, index) => (
          <MotifItem
            key={index}
            item={item}
            height="60vh"
            onViewClick={() => console.log(item)} // Replace with your actual view click handler
          />
        ))}
      </div>
    </div>
  );
};

export default NewMotifsPage;
