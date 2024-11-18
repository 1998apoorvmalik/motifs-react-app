// src/components/StructureItem.tsx
import React from "react";
import Structure from "./../../interfaces/Structure";
import SvgViewer from "./../SvgViewer";

interface StructureItemProps {
    index: number;
    item: Structure;
    onViewClick: () => void; // New prop to handle the click event
}

const StructureItem: React.FC<StructureItemProps> = ({
    index,
    item,
    onViewClick,
}) => {
    return (
        <div className="grid-item">
            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                Structure #{index + 1}
            </h3>
            <div className="inline-container">
                <strong style={{ marginRight: "4px" }}>Family:</strong>
                <p className="p-nomargin">{item.family}</p>
            </div>
            <SvgViewer
                svgXML={item.svgContent}
                resetToolOnMouseLeave={true}
                height="40vh"
                resizable={false}
            ></SvgViewer>

            <button
                className="expand-button"
                style={{ marginTop: "8px" }}
                onClick={onViewClick}
            >
                View Structure
            </button>
        </div>
    );
};

export default StructureItem;
