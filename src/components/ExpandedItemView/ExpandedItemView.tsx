import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Motif from "../../interfaces/Motif";
import Structure from "../../interfaces/Structure";
import {
    ItemsPageState,
    ExpandedItemPageState,
} from "../../interfaces/ItemsPageState";
import ItemsGridView from "./ItemsGridView";
import LoadingSpinner from "../LoadingSpinnner";
import SvgViewer from "../SvgViewer";
import CopyableTextBlock from "../CopyableTextBlock";
import { motifService } from "../../services/motifService"; // Import the service to fetch motifs
import { structureService } from "../../services/structureService";
import RNAName from "../RNAName";

function processStructureIDs(structureIDs: string[]): Record<string, string[]> {
    return structureIDs.reduce<Record<string, string[]>>((acc, id) => {
        // Split the ID into base ID and suffix
        const parts = id.split("_");
        const baseID = parts.slice(0, 2).join("_"); // Combine the first two parts
        const suffix = parts[2]; // The third part is the suffix

        // If the base ID is not already in the map, initialize it
        if (!acc[baseID]) {
            acc[baseID] = [];
        }

        // Add the suffix to the array of the base ID
        acc[baseID].push(suffix);

        return acc;
    }, {});
}

function processMotifIDs(motifIDs: string[]): Record<string, string[]> {
    return motifIDs.reduce<Record<string, string[]>>((acc, id) => {
        acc[id] = [];
        return acc;
    }, {});
}

const ExpandedItemView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialItem = location.state?.item as Motif | Structure | undefined;

    const [item, setItem] = useState<Motif | Structure | undefined>(
        initialItem
    );
    const [loading, setLoading] = useState(!initialItem); // Set loading to true if initialItem is undefined

    const restoredExpandedMotifPageState =
        (location.state?.expandedMotifPageState as ExpandedItemPageState) || {};
    const restoredMotifPageState =
        (location.state?.motifPageState as ItemsPageState) || {};
    const initialCurrentPage = restoredExpandedMotifPageState.currentPage || 1;
    const initialItemsPerPage =
        restoredExpandedMotifPageState.itemsPerPage || 10;

    const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
    const [itemsPerPage, setItemsPerPage] =
        useState<number>(initialItemsPerPage);

    const [currentSvgIndex, setCurrentSvgIndex] = useState(0);

    const isMotif = (item: Motif | Structure): item is Motif =>
        item?.type === "motif";

    // Function to go to the next SVG (for Structures only)
    const handleNextSvg = () => {
        if (item && !isMotif(item) && item.svgContent) {
            setCurrentSvgIndex((prevIndex) =>
                prevIndex + 1 >= item.svgContent.length ? 0 : prevIndex + 1
            );
        }
    };

    // Function to go to the previous SVG (for Structures only)
    const handlePrevSvg = () => {
        if (item && !isMotif(item) && item.svgContent) {
            setCurrentSvgIndex((prevIndex) =>
                prevIndex - 1 < 0 ? item.svgContent.length - 1 : prevIndex - 1
            );
        }
    };

    const isSingleSvg = item && (isMotif(item) || item.svgContent?.length <= 1);

    useEffect(() => {
        const itemID = location.pathname.split("/").pop(); // Extract the item ID from the URL
        const isMotif = !itemID?.includes("_"); // Determine if it's a motif or structure

        if (itemID) {
            const fetchItem = async () => {
                setLoading(true); // Start loading
                const fetchedItem = isMotif
                    ? await motifService.getMotif(itemID)
                    : await structureService.getStructure(itemID, []);
                setItem(fetchedItem);
                setLoading(false); // Stop loading after fetch
            };
            fetchItem();
        }
    }, [location.pathname]); // Add location.pathname as a dependency

    if (loading) {
        return <LoadingSpinner message="Loading Item..." />;
    }

    if (!item) {
        return <h1>Error: Motif not found</h1>;
    }

    const handleViewClick = (item: Motif | Structure) => {
        // const expandedMotifPageState: ExpandedItemPageState = {
        //     motif: item as Motif,
        //     currentPage,
        //     itemsPerPage,
        // };

        // navigate(`/structure/${structure.id}`, {
        //     state: {
        //         structure,
        //         motif: item,
        //         expandedMotifPageState,
        //         motifPageState: restoredMotifPageState,
        //     },
        // });

        navigate(`/item/${item.id}`, {
            state: {
                item,
                // expandedMotifPageState: {
                //     currentPage,
                //     itemsPerPage,
                // },
                // motifPageState: restoredMotifPageState,
            },
        });
    };

    const handleBackClick = () => {
        navigate("/", { state: restoredMotifPageState });
    };

    return (
        <div>
            {/* {location.state?.motif && ( */} {/* [TODO] FIX THIS*/}
            {true && (
                <>
                    <button
                        className="back-button"
                        onClick={handleBackClick}
                        style={{ marginTop: "16px" }}
                    >
                        {"< Back to All Items Page"}
                    </button>
                    <br />
                    <br />
                </>
            )}
            {isMotif(item) ? (
                <h2 className="grid-item-title" style={{ fontSize: "28px" }}>
                    Motif ID: {item.id}
                </h2>
            ) : (
                <RNAName names={item.names} bigTitle={true} />
            )}
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
            <SvgViewer
                svgXML={
                    isMotif(item)
                        ? item.svg
                        : item.svgContent?.[currentSvgIndex] || ""
                }
                type={isMotif(item) ? "motif" : "struc"}
                showMiniature={true}
                alwaysShowToolbar={true}
                toolbarPosition="left"
                showDownloadButton={true}
                resizable={true}
                width="60%"
                height="60vh"
            ></SvgViewer>
            {/* <p>
                Number of Occurrences: {item.numOccurences} <br />
                Number of Families: {Object.keys(item.families).length} <br />
                Length: {item.length} <br />
                Boundary Pairs: {item.bpairs.length} <br />
                Internal Pairs: {item.ipairs.length} <br />
                Number of Loops: {item.numLoops}
            </p> */}
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
            <p>
                Length: {item.length} <br />
                Number of Loops: {item.numLoops}
                <br />
                {isMotif(item) ? (
                    <>
                        Number of Occurrences: {item.numOccurences} <br />
                        Boundary Pairs: {item.bpairs.length} <br />
                        Internal Pairs: {item.ipairs.length} <br />
                    </>
                ) : (
                    <>
                        Number of Pairs: {item.numPairs}
                        <br />
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
            <h2
                style={{
                    textAlign: "center",
                    marginTop: "48px",
                    marginBottom: "8px",
                }}
            >
                {isMotif(item)
                    ? "Structures Containing the Undesignable Motif"
                    : "Minimal Unique Undesignable Motifs in this Structure"}
            </h2>
            {/* Display the structures using the grid */}
            <ItemsGridView
                itemType={isMotif(item) ? "struc" : "motif"}
                itemIDs={
                    isMotif(item)
                        ? processStructureIDs(item.structures_id)
                        : processMotifIDs(item.motifsID)
                }
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
                handleViewClick={handleViewClick}
            />
        </div>
    );
};

export default ExpandedItemView;
