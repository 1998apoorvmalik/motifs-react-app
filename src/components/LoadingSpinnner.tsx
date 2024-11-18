// src/components/LoadingSpinner.tsx
import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
        <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>{message}</p>
        </div>
    );
};

export default LoadingSpinner;
