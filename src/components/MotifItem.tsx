// src/components/MotifItem.tsx
import React from "react";
import Motif from "../interfaces/Motif";
import CopyableTextBlock from "./CopyableTextBlock";
import SvgViewer from "./SvgViewer";

interface MotifItemProps {
  item: Motif;
  height?: string;
  resizable?: boolean;
  onViewClick: () => void;
}

const MotifItem: React.FC<MotifItemProps> = ({
  item,
  height,
  resizable,
  onViewClick,
}) => {
  return (
    <div className="grid-item">
      <div className="motif-item-title">
        <h2
          style={{
            margin: 0,
            // color: item.id === "online" ? "Blue" : "inherit",
          }}
        >
          Motif ID: {item.id}
        </h2>

        <span className="info-icon">
          <i className="fas fa-info-circle" style={{ fontSize: 20 }}></i>
          <span className="tooltip-text">Additional info about this item</span>
        </span>
      </div>
      <br />
      <strong className="p-nomargin">Families:</strong>
      <p className="p-nomargin">
        {Object.entries(item.families).length > 0
          ? Object.entries(item.families)
              .map(([family, count]) => `${family} (${count})`)
              .join(", ")
          : "None"}
      </p>
      <br />

      <SvgViewer
        svgXML={item.svg}
        resetToolOnMouseLeave={true}
        height={height || "300px"}
        resizable={resizable || false}
        showDownloadButton={true}
      ></SvgViewer>

      <button
        className="expand-button"
        style={{ marginTop: "8px" }}
        onClick={onViewClick}
      >
        View Motif
      </button>

      <p>
        Number of Occurrences: {item.numOccurences} <br />
        Number of Families: {Object.keys(item.families).length} <br />
        Length: {item.length} <br />
        Boundary Pairs: {item.bpairs.length} <br />
        Internal Pairs: {item.ipairs.length} <br />
        Number of Loops: {item.loops}
      </p>

      <CopyableTextBlock text={item.dotBracket} label="Dot-Bracket Structure" />
    </div>
  );
};

export default MotifItem;
