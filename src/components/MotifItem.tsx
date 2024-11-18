import React, { useState } from "react";
import Motif from "../interfaces/Motif";
import CopyableTextBlock from "./CopyableTextBlock";
import SvgViewer from "./SvgViewer";

interface MotifItemProps {
    item: Motif;
    height?: string;
    resizable?: boolean;
    onViewClick?: () => void;
}

const MotifItem: React.FC<MotifItemProps> = ({
    item,
    height,
    resizable,
    onViewClick,
}) => {
    const [openInNewTab, setOpenInNewTab] = useState(false);
    const motifUrl = `${process.env.REACT_APP_BASENAME}/motif/${item.id}`;

    const handleClick = (event: React.MouseEvent) => {
        if (onViewClick && !openInNewTab) {
            event.preventDefault();
            onViewClick();
        }
    };

    return (
        <div className="grid-item">
            <div className="motif-item-title">
                <h2 style={{ margin: 0 }}>Motif ID: {item.id}</h2>

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
            />

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
                        href={motifUrl}
                        target={openInNewTab ? "_blank" : "_self"}
                        rel={openInNewTab ? "noopener noreferrer" : ""}
                    >
                        <button className="expand-button" onClick={handleClick}>
                            View Motif
                        </button>
                    </a>
                </div>
            )}

            <p>
                Number of Occurrences: {item.numOccurences} <br />
                Number of Families: {Object.keys(item.families).length} <br />
                Length: {item.length} <br />
                Boundary Pairs: {item.bpairs.length} <br />
                Internal Pairs: {item.ipairs.length} <br />
                Number of Loops: {item.loops}
            </p>

            <CopyableTextBlock
                text={item.dotBracket?.[0] || ""}
                label="Dot-Bracket Structure"
            />
        </div>
    );
};

export default MotifItem;
