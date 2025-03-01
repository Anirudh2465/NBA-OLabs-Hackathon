import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./ExperimentStatus.css";

const ExperimentStatus = () => {
  const { folderName } = useParams();
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/experiments/${folderName}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch experiment status");
        }

        const statusData = await response.json();
        setData(statusData);
        setStatus(statusData.status);

        // If still processing, poll again after 5 seconds
        if (statusData.status === "processing") {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    };

    checkStatus();
  }, [folderName]);

  const handleRunSimulation = () => {
    setShowSimulation(true);
  };

  return (
    <div className="experiment-status-container">
      <h2>Experiment Generation Status</h2>

      {error && (
        <div className="error-message">
          {error}
          <Link to="/" className="retry-link">
            Return to form
          </Link>
        </div>
      )}

      {!error && (
        <div className="status-card">
          <div className="status-header">
            <h3>{folderName.replace(/_/g, " ")}</h3>
            <div className={`status-badge ${status}`}>
              {status === "processing"
                ? "Processing"
                : status === "completed"
                ? "Completed"
                : "Error"}
            </div>
          </div>

          <div className="status-content">
            {status === "processing" && (
              <div className="processing-info">
                <div className="loader"></div>
                <p>Your experiment simulation is being generated...</p>
                <p className="processing-details">
                  This process uses AI to create a complete interactive web
                  application based on your experiment specifications. This may
                  take a few minutes.
                </p>
              </div>
            )}

            {status === "completed" && !showSimulation && (
              <div className="completed-info">
                <div className="success-icon">✓</div>
                <p>Your experiment simulation is ready!</p>
                <p className="completed-details">
                  The generated project includes a React frontend and FastAPI
                  backend that simulate the experiment you specified.
                </p>
                <button
                  className="run-simulation-button"
                  onClick={handleRunSimulation}
                >
                  Run Simulation
                </button>
                <div className="instructions">
                  <h4>What to expect:</h4>
                  <p>
                    The simulation will open in an interactive window below
                    where you can:
                  </p>
                  <ul>
                    <li>Perform virtual experiments</li>
                    <li>Observe chemical reactions and results in real-time</li>
                    <li>Learn concepts through hands-on interaction</li>
                  </ul>
                </div>
              </div>
            )}

            {status === "completed" && showSimulation && (
              <div className="simulation-container">
                <h3>Interactive Simulation</h3>
                <div className="iframe-container">
                  <iframe
                    src={`http://localhost:8000/projects/${folderName}/index.html`}
                    title="Experiment Simulation"
                    className="simulation-iframe"
                    allow="accelerometer; camera; microphone; fullscreen"
                  />
                </div>
                <button
                  className="close-simulation-button"
                  onClick={() => setShowSimulation(false)}
                >
                  Hide Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="navigation-links">
        <Link to="/" className="back-link">
          Create Another Experiment
        </Link>
      </div>
    </div>
  );
};

export default ExperimentStatus;
