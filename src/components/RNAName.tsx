import React, { useState } from 'react';
import './RNAName.css';

interface RNANameProps {
  name: string;
  names: string[];
  bigTitle?: boolean;
}

const RNAName: React.FC<RNANameProps> = ({ name, names, bigTitle }) => {
  // const [selectedName, setSelectedName] = useState(names[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to process a single name
  const processName = (name: string) => {
    const [prefix, rest] = name.split(','); // Split into parts before and after the comma
    if (!rest) return name; // Return original name if no comma

    const words = rest.trim().split(' '); // Get words after the comma
    const firstWord = words.shift(); // Extract the first word

    // Format the first word
    let italicWord = firstWord || '';
    if (italicWord.includes('.')) {
      italicWord = italicWord.replace(/\./g, '. '); // Add a space after dots
    }

    return (
      <>
        {prefix}, <i>{italicWord.trim()}</i> {words.join(' ')}
      </>
    );
  };

  // Toggle the dropdown
  const toggleExpand = () => {
    if (names.length > 1) {
      setIsExpanded(prev => !prev);
    }
  };

  // // Handle clicking on a name
  // const handleNameClick = (name: string) => {
  //     setSelectedName(name);
  //     setIsExpanded(false);
  // };

  return (
    <div className="rna-name-container">
      {/* Main selected name with optional big title styling */}
      <h2 className="grid-item-title" style={bigTitle ? { fontSize: '28px' } : {}}>
        <div className="selected-name">{processName(name)}</div>
      </h2>

      {/* Expand/Collapse toggle */}
      <div
        className={`expand-toggle ${names.length === 1 ? 'disabled-toggle' : ''}`}
        onClick={toggleExpand}
      >
        {isExpanded ? '▼ Hide Other Names' : '▶ Show Other Names'}
      </div>

      {/* Dropdown list */}
      {isExpanded && names.length > 1 && (
        <ul className="dropdown-names">
          {names.map(other_name => (
            <li
              key={other_name}
              className={`dropdown-name-item ${other_name === name ? 'selected' : ''}`}
              // onClick={() => handleNameClick(name)}
            >
              {processName(other_name)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RNAName;
