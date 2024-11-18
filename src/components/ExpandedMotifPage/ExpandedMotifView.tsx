import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Motif from "./../../interfaces/Motif";
import Structure from "../../interfaces/Structure";
import {
    MotifPageState,
    ExpandedMotifPageState,
} from "../../interfaces/MotifPageState";
import StructuresGridView from "./StructuresGridView";
import LoadingSpinner from "../LoadingSpinnner";
import SvgViewer from "../SvgViewer";
import CopyableTextBlock from "../CopyableTextBlock";
import { motifService } from "./../../services/motifService"; // Import the service to fetch motifs

const ExpandedMotifView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialItem = location.state?.motif as Motif | undefined;
    const [item, setItem] = useState<Motif | undefined>(initialItem);
    const [loading, setLoading] = useState(!initialItem); // Set loading to true if initialItem is undefined

    const restoredExpandedMotifPageState =
        (location.state?.expandedMotifPageState as ExpandedMotifPageState) ||
        {};
    const restoredMotifPageState =
        (location.state?.motifPageState as MotifPageState) || {};
    const initialCurrentPage = restoredExpandedMotifPageState.currentPage || 1;
    const initialItemsPerPage =
        restoredExpandedMotifPageState.itemsPerPage || 10;

    const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
    const [itemsPerPage, setItemsPerPage] =
        useState<number>(initialItemsPerPage);

    useEffect(() => {
        // Fetch the motif if it's not available in location.state
        if (!item) {
            const motifID = location.pathname.split("/").pop(); // Extract motif ID from URL
            if (motifID) {
                const fetchMotif = async () => {
                    setLoading(true); // Start loading
                    const fetchedMotif = await motifService.getMotif(motifID);
                    setItem(fetchedMotif);
                    setLoading(false); // Stop loading after fetch
                };
                fetchMotif();
            }
        }
    }, [item, location.pathname]);

    if (loading) {
        return <LoadingSpinner message="Loading Motif..." />;
    }

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
            {location.state?.motif && (
                <button
                    className="back-button"
                    onClick={handleBackClick}
                    style={{ marginTop: "16px" }}
                >
                    {"< Back to All Motifs Page"}
                </button>
            )}
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

            <h2
                style={{
                    textAlign: "center",
                    marginTop: "48px",
                    marginBottom: "8px",
                }}
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
