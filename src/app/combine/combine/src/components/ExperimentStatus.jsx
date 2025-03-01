import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ExperimentStatus.css';

const ExperimentStatus = ({ experiment, setActiveExperiment }) => {
  const { folderName } = useParams();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showSimulation, setShowSimulation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/experiments/${folderName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch experiment status');
        }
        
        const statusData = await response.json();
        setData(statusData);
        setStatus(statusData.status);
        
        // If still processing, poll again after 5 seconds
        if (statusData.status === 'processing') {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    };
    
    checkStatus();
  }, [folderName]);

  const handleRunSimulation = () => {
    setShowSimulation(true);
  };

  const handleTakeQuiz = () => {
    // Store the active experiment data for the quiz
    setActiveExperiment({
      folderName,
      name: folderName.replace(/_/g, ' '),
      data: data
    });
    
    // Navigate to the quiz page
    navigate(`/quiz/${folderName}`);
  };

  return (
    <div className="experiment-status-container">
      <h2>Experiment Generation Status</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <Link to="/" className="retry-link">Return to form</Link>
        </div>
      )}
      
      {!error && (
        <div className="status-card">
          <div className="status-header">
            <h3>{folderName.replace(/_/g, ' ')}</h3>
            <div className={`status-badge ${status}`}>
              {status === 'processing' ? 'Processing' : 
               status === 'completed' ? 'Completed' : 
               'Error'}
            </div>
          </div>
          
          <div className="status-content">
            {status === 'processing' && (
              <div className="processing-info">
                <div className="loader"></div>
                <p>Your experiment simulation is being generated...</p>
                <p className="processing-details">
                  This process uses AI to create a complete interactive web application 
                  based on your experiment specifications. This may take a few minutes.
                </p>
              </div>
            )}
            
            {status === 'completed' && !showSimulation && (
              <div className="completed-info">
                <div className="success-icon">✓</div>
                <p>Your experiment simulation is ready!</p>
                <p className="completed-details">
                  The generated project includes a React frontend and FastAPI backend 
                  that simulate the experiment you specified.
                </p>
                <button className="run-simulation-button" onClick={handleRunSimulation}>
                  Run Simulation
                </button>
                <div className="instructions">
                  <h4>What to expect:</h4>
                  <p>The simulation will open in an interactive window below where you can:</p>
                  <ul>
                    <li>Perform virtual science experiments</li>
                    <li>Observe chemical reactions and results in real-time</li>
                    <li>Learn scientific concepts through hands-on interaction</li>
                  </ul>
                </div>
              </div>
            )}
            
            {status === 'completed' && showSimulation && (
              <div className="simulation-container">
                <h3>Interactive Science Simulation</h3>
                <div className="iframe-container">
                  <iframe 
                    src={`http://localhost:8000/projects/${folderName}/index.html`}
                    title="Science Experiment Simulation"
                    className="simulation-iframe"
                    allow="accelerometer; camera; microphone; fullscreen"
                  />
                </div>
                <div className="simulation-controls">
                  <button 
                    className="hide-simulation-button" 
                    onClick={() => setShowSimulation(false)}
                  >
                    Hide Simulation
                  </button>
                  <button 
                    className="take-quiz-button" 
                    onClick={handleTakeQuiz}
                  >
                    Take Quiz on This Experiment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="navigation-links">
        <Link to="/" className="back-link">Create Another Experiment</Link>
      </div>
    </div>
  );
};

export default ExperimentStatus;