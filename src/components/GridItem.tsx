import React, { useState } from "react";
import SvgViewer from "./SvgViewer";
import CopyableTextBlock from "./CopyableTextBlock";
import Motif from "../interfaces/Motif";
import Structure from "../interfaces/Structure";
import "./GridItem.css";
import RNAName from "./RNAName";

interface GridItemProps {
    item: Motif | Structure;
    height?: string;
    resizable?: boolean;
    onViewClick?: () => void;
}

const GridItem: React.FC<GridItemProps> = ({
    item,
    height,
    resizable,
    onViewClick,
}) => {
    const [openInNewTab, setOpenInNewTab] = useState(true);

    // State to track the currently displayed SVG index for Structures
    const [currentSvgIndex, setCurrentSvgIndex] = useState(0);

    // Determine if the item is a Motif or a Structure
    const isMotif = (item: Motif | Structure): item is Motif =>
        item.type === "motif";

    const itemUrl = `${process.env.REACT_APP_BASENAME}/item/${item.id}`;

    const handleClick = (event: React.MouseEvent) => {
        if (onViewClick && !openInNewTab) {
            event.preventDefault();
            onViewClick();
        }
    };

    // Function to go to the next SVG (for Structures only)
    const handleNextSvg = () => {
        if (!isMotif(item) && item.svgContent) {
            setCurrentSvgIndex((prevIndex) =>
                prevIndex + 1 >= item.svgContent.length ? 0 : prevIndex + 1
            );
        }
    };

    // Function to go to the previous SVG (for Structures only)
    const handlePrevSvg = () => {
        if (!isMotif(item) && item.svgContent) {
            setCurrentSvgIndex((prevIndex) =>
                prevIndex - 1 < 0 ? item.svgContent.length - 1 : prevIndex - 1
            );
        }
    };

    const isSingleSvg = isMotif(item) || item.svgContent?.length <= 1;

    return (
        <div className="grid-item">
            <div className="motif-item-title">
                {isMotif(item) ? (
                    <h2 className="grid-item-title">Motif ID: {item.id}</h2>
                ) : (
                    <RNAName names={item.names} />
                )}
                {/* <span className="info-icon">
                    <i
                        className="fas fa-info-circle"
                        style={{ fontSize: 20 }}
                    ></i>
                    <span className="tooltip-text">
                        Additional info about this item
                    </span>
                </span> */}
            </div>

            <br />

            {/* Families */}
            {isMotif(item) && (
                <>
                    <strong className="p-nomargin">Families:</strong>
                    <p className="p-nomargin">
                        {Object.entries(item.families).length > 0
                            ? Object.entries(item.families)
                                  .map(
                                      ([family, count]) =>
                                          `${family} (${count})`
                                  )
                                  .join(", ")
                            : "None"}
                    </p>
                    <br />
                </>
            )}
            {!isMotif(item) && (
                <div className="inline-container">
                    <strong style={{ marginRight: "4px" }}>Family:</strong>
                    <p className="p-nomargin">{item.family}</p>
                </div>
            )}

            {!isMotif(item) && (
                <span>(Structure ID: {item.id || "Unnamed Structure"})</span>
            )}

            {/* SVG Viewer */}
            <SvgViewer
                svgXML={
                    isMotif(item)
                        ? item.svg
                        : item.svgContent?.[currentSvgIndex] || ""
                }
                type={isMotif(item) ? "motif" : "struc"}
                resetToolOnMouseLeave={true}
                height={height || "300px"}
                resizable={resizable || false}
                showDownloadButton={true}
            />

            {/* Navigation for multiple SVGs */}
            {!isMotif(item) && item.svgContent && (
                <div className="svg-navigation">
                    <button
                        onClick={handlePrevSvg}
                        disabled={isSingleSvg}
                        className={`nav-button ${
                            isSingleSvg ? "disabled" : ""
                        }`}
                    >
                        &lt; Prev
                    </button>
                    <span className="svg-index">
                        View {currentSvgIndex + 1} /{" "}
                        {isMotif(item) ? 1 : item.svgContent?.length || 1}
                    </span>
                    <button
                        onClick={handleNextSvg}
                        disabled={isSingleSvg}
                        className={`nav-button ${
                            isSingleSvg ? "disabled" : ""
                        }`}
                    >
                        Next &gt;
                    </button>
                </div>
            )}

            {/* View Button */}
            {onViewClick && (
                <div
                    className="centered-container"
                    style={{ marginTop: "8px", flexDirection: "column" }}
                >
                    {/* <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={openInNewTab}
                            onChange={() => setOpenInNewTab(!openInNewTab)}
                        />
                        Open in New Tab
                    </label> */}
                    <a
                        href={itemUrl}
                        target={openInNewTab ? "_blank" : "_self"}
                        rel={openInNewTab ? "noopener noreferrer" : ""}
                    >
                        <button className="expand-button" onClick={handleClick}>
                            View {isMotif(item) ? "Motif" : "Structure"}
                        </button>
                    </a>
                </div>
            )}

            <p>
                Length: {item.length} <br />
                Number of Loops: {item.numLoops} <br />
                {isMotif(item) ? (
                    <>
                        Number of Occurrences: {item.numOccurences} <br />
                        Boundary Pairs: {item.bpairs.length} <br />
                        Internal Pairs: {item.ipairs.length} <br />
                    </>
                ) : (
                    <>
                        Number of Pairs: {item.numPairs} <br />
                        Min. Unique Undesignable Motifs: {
                            item.motifsID.length
                        }{" "}
                    </>
                )}
            </p>

            {/* Dot-Bracket Structure */}
            <CopyableTextBlock
                text={
                    isMotif(item)
                        ? item.dotBracket?.[0] || ""
                        : item.dotBracket || ""
                }
                label="Dot-Bracket Structure"
            />
        </div>
    );
};

export default GridItem;
