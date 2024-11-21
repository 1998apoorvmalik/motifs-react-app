// src/components/MotifListItem.tsx
import React from "react";
import Motif from "../../interfaces/Motif";

interface MotifListItemProps {
    item: Motif;
    onViewClick: () => void;
}

const MotifListItem: React.FC<MotifListItemProps> = ({ item, onViewClick }) => {
    // Format families in the desired "3 {grp(1), srp(2)}" format
    const formattedFamilies = `${Object.entries(item.families)
        .map(([family, count]) => `${family}(${count})`)
        .join(", ")}`;

    const itemUrl = `${process.env.REACT_APP_BASENAME}/item/${item.id}`;
    return (
        <div className="list-item list-item-motif">
            <span className="id-column">{item.id}</span>
            <span className="families-column">{formattedFamilies}</span>
            <span className="occurrences-column">{item.numOccurences}</span>
            <span className="length-column">{item.length}</span>
            <span className="bpairs-column">{item.bpairs.length}</span>
            <span className="ipairs-column">{item.ipairs.length}</span>
            <span className="loops-column">{item.numLoops}</span>
            <a href={itemUrl} target={"_blank"} rel={"noopener noreferrer"}>
                <button className="expand-button" onClick={() => {}}>
                    View Motif
                </button>
            </a>
        </div>
    );
};

export default MotifListItem;
