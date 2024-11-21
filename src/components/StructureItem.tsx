// src/components/StructureItem.tsx
import React, { useState } from "react";
import Structure from "../interfaces/Structure";
import SvgViewer from "./SvgViewer";
import CopyableTextBlock from "./CopyableTextBlock";

interface StructureItemProps {
    item: Structure;
    height?: string;
    resizable?: boolean;

    onViewClick?: () => void; // New prop to handle the click event
}

const StructureItem: React.FC<StructureItemProps> = ({
    item,
    height,
    resizable,
    onViewClick,
}) => {
    const [openInNewTab, setOpenInNewTab] = useState(false);

    const strucUrl = `${process.env.REACT_APP_BASENAME}/struc/${item.id}`;

    const handleClick = (event: React.MouseEvent) => {
        if (onViewClick && !openInNewTab) {
            event.preventDefault();
            onViewClick();
        }
    };

    return (
        <div className="grid-item">
            <div className="motif-item-title">
                <h2 style={{ margin: 0 }}>Structure ID: {item.id}</h2>

                <span className="info-icon">
                    <i
                        className="fas fa-info-circle"
                        style={{ fontSize: 20 }}
                    ></i>
                    <span className="tooltip-text">
                        Additional info about this item
                    </span>
                </span>
            </div>

            <h3>{item.names[0]}</h3>

            <div className="inline-container">
                <strong style={{ marginRight: "4px" }}>Family:</strong>
                <p className="p-nomargin">{item.family}</p>
            </div>
            <br />
            <SvgViewer
                svgXML={item.svgContent[0]}
                type="struc"
                resetToolOnMouseLeave={true}
                height={height || "300px"}
                resizable={resizable || false}
                showDownloadButton={true}
            ></SvgViewer>

            {onViewClick && (
                <div
                    className="centered-container"
                    style={{ marginTop: "8px", flexDirection: "column" }}
                >
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={openInNewTab}
                            onChange={() => setOpenInNewTab(!openInNewTab)}
                        />
                        Open in New Tab
                    </label>
                    <a
                        href={strucUrl}
                        target={openInNewTab ? "_blank" : "_self"}
                        rel={openInNewTab ? "noopener noreferrer" : ""}
                    >
                        <button className="expand-button" onClick={handleClick}>
                            View Structure
                        </button>
                    </a>
                </div>
            )}

            <p>
                Number of Motifs: {item.motifsID.length} <br />
                Length: {item.length} <br />
                Number of Pairs: {item.numPairs} <br />
                Number of Loops: {item.numLoops}
            </p>

            <CopyableTextBlock
                text={item.dotBracket || ""}
                label="Dot-Bracket Structure"
            />
        </div>
    );
};

export default StructureItem;
