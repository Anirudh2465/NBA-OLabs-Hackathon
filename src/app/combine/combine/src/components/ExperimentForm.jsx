// components/ExperimentForm.jsx - Create new experiments
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExperimentForm.css';

const ExperimentForm = ({ setExperiment }) => {
  const [formData, setFormData] = useState({
    experiment_name: '',
    experiment_description: '',
    complexity_level: 'Intermediate',
    target_age_group: 'High School'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://localhost:8000/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit experiment');
      }
  
      const data = await response.json();
      setExperiment(data);
      
      // Create a folder name from the experiment name using the same logic as the backend
      const folderName = formData.experiment_name
        .split('')
        .map(c => (c.match(/[a-zA-Z0-9 _]/) ? c : '_'))
        .join('')
        .replace(/ /g, '_')
        .toLowerCase();
      
      // Navigate to status page
      navigate(`/status/${folderName}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="experiment-form-container">
      <div className="form-wrapper">
        <h2>Create Experiment Simulation</h2>
        <p className="form-description">
          Enter details about a science experiment you want to simulate, and our AI will generate a complete interactive web application for you.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="experiment_name">Experiment Name</label>
            <input
              type="text"
              id="experiment_name"
              name="experiment_name"
              value={formData.experiment_name}
              onChange={handleChange}
              placeholder="e.g., Acid-Base Titration"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="experiment_description">Experiment Description</label>
            <textarea
              id="experiment_description"
              name="experiment_description"
              value={formData.experiment_description}
              onChange={handleChange}
              placeholder="Describe the science experiment in detail..."
              rows="6"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="complexity_level">Complexity Level</label>
              <select
                id="complexity_level"
                name="complexity_level"
                value={formData.complexity_level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="form-group half">
              <label htmlFor="target_age_group">Target Age Group</label>
              <select
                id="target_age_group"
                name="target_age_group"
                value={formData.target_age_group}
                onChange={handleChange}
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Generate Experiment Simulation'}
            </button>
          </div>
        </form>
        
        <div className="experiment-examples">
          <h3>Example Experiments</h3>
          <ul>
            <li>Electrolysis of water with visualization of H₂ and O₂ production</li>
            <li>Acid-base titration with pH indicator color changes</li>
            <li>Chemical equilibrium simulation with Le Chatelier's principle</li>
            <li>Redox reactions with electron transfer visualization</li>
            <li>Precipitation reactions with solubility rules</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExperimentForm;