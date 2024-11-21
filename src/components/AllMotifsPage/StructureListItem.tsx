// src/components/StuctureListItem.tsx
import React from "react";
import Structure from "../../interfaces/Structure";

interface StructureListItemProps {
    item: Structure;
    onViewClick: () => void;
}

const StructureListItem: React.FC<StructureListItemProps> = ({
    item,
    onViewClick,
}) => {
    const itemUrl = `${process.env.REACT_APP_BASENAME}/item/${item.id}`;
    return (
        <div className="list-item list-item-structure">
            <span className="id-column">{item.id}</span>
            <span className="families-column">{item.family}</span>
            <span className="length-column">{item.length}</span>
            <span className="bpairs-column">{item.numPairs}</span>
            <span className="loops-column">{item.numLoops}</span>
            <span className="motifs-column">{item.motifsID.length}</span>
            <a href={itemUrl} target={"_blank"} rel={"noopener noreferrer"}>
                <button className="expand-button" onClick={() => {}}>
                    View Structure
                </button>
            </a>
        </div>
    );
};

export default StructureListItem;
