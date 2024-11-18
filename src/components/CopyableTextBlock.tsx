// src/components/CopyableTextBlock.tsx
import React, { useState } from "react";

import "./CopyableTextBlock.css";

interface CopyableTextBlockProps {
    text: string;
    label: string; // Label to describe what the text is (e.g., "y_sub" or "y*")
}

const CopyableTextBlock: React.FC<CopyableTextBlockProps> = ({
    text,
    label,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div className="copyable-text-block">
            <p>{label}:</p>
            <pre>{text} </pre>

            {/* Font Awesome icon */}
            <span className="copy-icon" onClick={handleCopy}>
                <i className={`fas ${copied ? "fa-check" : "fa-copy"}`}></i>
            </span>
        </div>
    );
};

export default CopyableTextBlock;
