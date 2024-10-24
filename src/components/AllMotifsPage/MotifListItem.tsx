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

  return (
    <div className="list-item">
      <span className="id-column">{item.id}</span>
      <span className="families-column">{formattedFamilies}</span>
      <span className="occurrences-column">{item.numOccurences}</span>
      <span className="length-column">{item.length}</span>
      <span className="bpairs-column">{item.bpairs.length}</span>
      <span className="ipairs-column">{item.ipairs.length}</span>
      <span className="loops-column">{item.loops.length}</span>
      <button className="expand-button" onClick={onViewClick}>
        View Motif
      </button>
    </div>
  );
};

export default MotifListItem;
