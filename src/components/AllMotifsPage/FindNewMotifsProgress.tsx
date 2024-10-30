import React, { useState, useEffect, useRef } from "react";
import "./FindNewMotifsProgress.css";
import CopyableTextBlock from "../CopyableTextBlock";
import Motif from "../../interfaces/Motif";

interface FindNewMotifsProgressProps {
  inputStructure: string;
  progressUpdates: string[];
  response: { motifs: Motif[] } | null;
  onRedirectNowClick: () => void;
  onCancel: () => void;
}

const FindNewMotifsProgress: React.FC<FindNewMotifsProgressProps> = ({
  inputStructure,
  progressUpdates,
  response,
  onRedirectNowClick,
  onCancel,
}) => {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const progressLogRef = useRef<HTMLDivElement>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Individual state for each phase's time
  const [setupTime, setSetupTime] = useState<number | null>(null);
  const [motifFindingTime, setMotifFindingTime] = useState<number | null>(null);
  const [plotTime, setPlotTime] = useState<number | null>(null);

  // Track motif finding completion timestamp to calculate plot time later
  const motifCompletionTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (progressLogRef.current) {
      progressLogRef.current.scrollTop = progressLogRef.current.scrollHeight;
    }
  }, [progressUpdates]);

  useEffect(() => {
    if (response) {
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            setTimeout(onRedirectNowClick, 0);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [response, onRedirectNowClick]);

  // Extract timings based on progress updates
  useEffect(() => {
    progressUpdates.forEach((update) => {
      if (!setupTime && update.includes("Time cost for loading motif libs")) {
        const timeMatch = update.match(
          /Time cost for loading motif libs: ([\d.e-]+) seconds/
        );
        if (timeMatch) {
          const time = parseFloat(timeMatch[1]);
          setSetupTime(Math.max(0.0001, time));
        }
      } else if (
        setupTime &&
        !motifFindingTime &&
        update.includes("time cost for whole structure")
      ) {
        const timeMatch = update.match(
          /time cost for whole structure: ([\d.e-]+) seconds/
        );
        if (timeMatch) {
          const time = parseFloat(timeMatch[1]);
          setMotifFindingTime(time);
          motifCompletionTimeRef.current = Date.now(); // Store completion timestamp
        }
      }
    });
  }, [progressUpdates, motifFindingTime, setupTime]);

  // Calculate plot time when response becomes available
  useEffect(() => {
    if (
      response &&
      motifCompletionTimeRef.current &&
      motifFindingTime &&
      !plotTime
    ) {
      const currentTime = Date.now();
      const plotTimeInSeconds =
        (currentTime - motifCompletionTimeRef.current) / 1000;
      setPlotTime(plotTimeInSeconds);
    }
  }, [response, motifFindingTime, plotTime]);

  // Construct the simple progress summary with intermediate steps
  const simpleProgressSummary = [
    setupTime === null ? (
      <p key="setup-progress">
        Setting up Environment and Loading Libraries{" "}
        <i className="fas fa-spinner fa-spin"></i>
      </p>
    ) : (
      <p key="setup-complete">
        Setting up Environment and Loading Libraries done in{" "}
        {setupTime.toFixed(4)} seconds
      </p>
    ),
    setupTime !== null && motifFindingTime === null ? (
      <p key="motif-progress">
        Finding Undesignable Motifs <i className="fas fa-spinner fa-spin"></i>
      </p>
    ) : (
      setupTime !== null &&
      motifFindingTime !== null && (
        <p key="motif-complete">
          Undesignable Motifs found in {motifFindingTime.toFixed(4)} seconds
        </p>
      )
    ),
    setupTime !== null && motifFindingTime !== null && plotTime === null ? (
      <p key="plot-progress">
        Creating plots <i className="fas fa-spinner fa-spin"></i>
      </p>
    ) : (
      setupTime !== null &&
      motifFindingTime !== null &&
      plotTime !== null && (
        <p key="plot-complete">
          Creating plots done in {plotTime.toFixed(4)} seconds
        </p>
      )
    ),
  ];

  return (
    <div className="loading-progress-container">
      <h2>
        {response
          ? response.motifs.length > 0
            ? `Found ${response.motifs.length} Motifs in the Input Structure`
            : "No Undesignable Motifs Found in the Input Structure!"
          : "Processing"}
      </h2>
      {response && (
        <h3 style={{ marginTop: "0px", color: "green" }}>
          Redirecting in {redirectCountdown} seconds
        </h3>
      )}
      {!response && (
        <i
          className="fas fa-spinner fa-spin fa-2x"
          style={{ marginBottom: "16px" }}
        ></i>
      )}
      {!response ? (
        <button
          className="cancel-button"
          onClick={onCancel}
          style={{ marginBottom: "24px" }}
        >
          Cancel
        </button>
      ) : (
        <button
          className="apply-button"
          onClick={() => setTimeout(onRedirectNowClick, 0)}
          style={{ marginBottom: "24px" }}
        >
          Redirect Now
        </button>
      )}
      <div style={{ width: "80%" }}>
        <CopyableTextBlock text={inputStructure} label={"Input Structure"} />
        <div className="header-bar">
          <div className="header-section">
            <h3 style={{ margin: 0, marginLeft: "8px" }}>Progress Info</h3>
          </div>
          <div className="header-section">
            <div className="view-toggle">
              <button
                className={`view-button ${mode === "simple" ? "active" : ""}`}
                onClick={() => setMode("simple")}
              >
                Simple
              </button>
              <button
                className={`view-button ${mode === "advanced" ? "active" : ""}`}
                onClick={() => setMode("advanced")}
              >
                Advanced
              </button>
            </div>
          </div>
        </div>
        <div className="progress-log" ref={progressLogRef}>
          {mode === "simple"
            ? simpleProgressSummary
            : progressUpdates.map((update, index) => (
                <p key={index}>{update}</p>
              ))}
        </div>
      </div>
    </div>
  );
};

export default FindNewMotifsProgress;
