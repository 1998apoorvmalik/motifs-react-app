import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinnner";
import SvgViewer from "./SvgViewer";
import { motifService } from "./../services/motifService"; // Assuming you have a service to fetch structures

const ExpandedStructureView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [structure, setStructure] = useState(location.state?.structure || null); // Initialize with structure from state if available
  const [loading, setLoading] = useState(!location.state?.structure); // Initialize loading state
  const url = location.pathname;
  const structureID = url.split("/").pop(); // Extract the structure ID from the URL

  useEffect(() => {
    // Fetch the structure if it's not available in location.state
    if (!structure && structureID) {
      const fetchStructure = async () => {
        setLoading(true); // Set loading to true while fetching
        const fetchedStructure = await motifService.getStructure(structureID);
        setStructure(fetchedStructure);
        setLoading(false); // Set loading to false after fetching
      };
      fetchStructure();
    }
  }, [structure, structureID]);

  // Display loading message while fetching data
  if (loading) {
    return <LoadingSpinner message="Loading Structure..." />;
  }

  // Handle case where the item is not passed or not found
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
      {location.state?.structure && (
        <button
          className="back-button"
          onClick={handleBackClick}
          style={{ marginTop: "16px" }}
        >
          {"< Back to Expanded Motif Page"}
        </button>
      )}
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
