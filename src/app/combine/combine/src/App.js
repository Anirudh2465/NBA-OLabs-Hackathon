import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ExperimentForm from './components/ExperimentForm';
import ExperimentStatus from './components/ExperimentStatus';
import ExperimentQuiz from './components/ExperimentQuiz';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [experiment, setExperiment] = useState(null);
  const [activeExperiment, setActiveExperiment] = useState(null);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ExperimentForm setExperiment={setExperiment} />} />
            <Route 
              path="/status/:folderName" 
              element={<ExperimentStatus experiment={experiment} setActiveExperiment={setActiveExperiment} />} 
            />
            <Route 
              path="/quiz/:folderName" 
              element={
                activeExperiment ? <ExperimentQuiz experiment={activeExperiment} /> : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;