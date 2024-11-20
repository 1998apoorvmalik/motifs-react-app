import React from "react";
import "./ToggleSwitch.css";

interface ToggleSwitchProps {
    leftLabel: string;
    rightLabel: string;
    isLeft: boolean; // Controlled state from the parent
    onToggle: () => void; // Notify parent when the toggle is clicked
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    leftLabel,
    rightLabel,
    isLeft,
    onToggle,
}) => {
    return (
        <div className="toggle-switch">
            <span className={`label ${isLeft ? "active" : ""}`}>
                {leftLabel}
            </span>
            <div
                className={`switch ${isLeft ? "left" : "right"}`}
                onClick={onToggle} // Notify parent of toggle change
            >
                <div className="toggle"></div>
            </div>
            <span className={`label ${!isLeft ? "active" : ""}`}>
                {rightLabel}
            </span>
        </div>
    );
};

export default ToggleSwitch;
