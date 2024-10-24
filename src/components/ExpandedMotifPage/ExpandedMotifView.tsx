import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Motif from "./../../interfaces/Motif";
import Structure from "../../interfaces/Structure";
import {
  MotifPageState,
  ExpandedMotifPageState,
} from "../../interfaces/MotifPageState";
import StructuresGridView from "./StructuresGridView";
import SvgViewer from "../SvgViewer";

const ExpandedMotifView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.motif as Motif | undefined;

  const restoredExpandedMotifPageState =
    (location.state?.expandedMotifPageState as ExpandedMotifPageState) || {};
  const restoredMotifPageState =
    (location.state?.motifPageState as MotifPageState) || {};
  const initialCurrentPage = restoredExpandedMotifPageState.currentPage || 1;
  const initialItemsPerPage = restoredExpandedMotifPageState.itemsPerPage || 10;

  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);

  if (!item) {
    return <h1>Error: Motif not found</h1>;
  }

  const handleViewClick = (structure: Structure) => {
    const expandedMotifPageState: ExpandedMotifPageState = {
      motif: item,
      currentPage,
      itemsPerPage,
    };

    navigate(`/structure/${structure.id}`, {
      state: {
        structure,
        motif: item,
        expandedMotifPageState,
        motifPageState: restoredMotifPageState,
      },
    });
  };

  const handleBackClick = () => {
    navigate("/", { state: restoredMotifPageState });
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
      <h1>Motif ID: {item.id}</h1>
      <div className="inline-container">
        <strong style={{ marginRight: "4px" }}>Families:</strong>
        <p className="p-nomargin">
          {Object.entries(item.families)
            .map(([family, count]) => `${family} (${count})`)
            .join(", ")}
        </p>
      </div>

      <SvgViewer
        svgXML={item.svg}
        showMiniature={true}
        alwaysShowToolbar={true}
        toolbarPosition="left"
        showDownloadButton={true}
        resizable={true}
        width="60%"
        height="60vh"
      ></SvgViewer>

      <h2
        style={{ textAlign: "center", marginTop: "48px", marginBottom: "8px" }}
      >
        Structures Containing the Motif
      </h2>
      {/* Display the structures using the grid */}
      <StructuresGridView
        structureIDs={item.structures_id}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        handleViewClick={handleViewClick}
      />
    </div>
  );
};

export default ExpandedMotifView;
