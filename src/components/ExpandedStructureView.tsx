import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SvgViewer from "./SvgViewer";

const ExpandedStructureView: React.FC = () => {
  const location = useLocation(); // To get the passed state
  const navigate = useNavigate(); // For navigation

  const structure = location.state.structure || {};

  // Handle case where the item is not passed (e.g., direct URL access)
  if (!structure) {
    return <h1>Error: Structure not found</h1>;
  }

  // Function to handle back navigation
  const handleBackClick = () => {
    if (location.state?.motif) {
      delete location.state.structure; // Remove structure from state to avoid passing it back
      navigate(`/motif/${location.state.motif.id}`, {
        state: location.state,
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div>
      {/* Back Button to navigate back */}
      <button
        className="back-button"
        onClick={handleBackClick}
        style={{ marginTop: "16px" }}
      >
        {"< Back to Expanded Motif Page"}
      </button>
      <h1>Structure ID: {structure.id}</h1>
      <div className="inline-container">
        <strong style={{ marginRight: "4px" }}>Family:</strong>
        <p className="p-nomargin">{structure.family}</p>
      </div>

      {/* SVG Viewer for displaying the structure */}
      <SvgViewer
        svgXML={structure.svgContent}
        showMiniature={true}
        alwaysShowToolbar={true}
        toolbarPosition="left"
        showDownloadButton={true}
        resizable={true}
        width="60%"
        height="80vh"
      />
    </div>
  );
};

export default ExpandedStructureView;
