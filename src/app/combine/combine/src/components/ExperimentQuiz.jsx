import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import './ExperimentQuiz.css';

const ExperimentQuiz = ({ experiment }) => {
  const { folderName } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answerKeys, setAnswerKeys] = useState([]);
  const [answers, setAnswers] = useState({});
  const [gradingResponse, setGradingResponse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [batchStatus, setBatchStatus] = useState("");

  // Helper function to extract options from question text
  const parseOptions = (questionText) => {
    const lines = questionText.split('\n');
    const options = [];
    
    for (let line of lines) {
      if (line.trim().startsWith('Option ')) {
        options.push(line.trim());
      }
    }
    
    return options;
  };

  // Fetch questions from FastAPI with retry logic
  useEffect(() => {
    const fetchQuestions = async () => {
      console.log(`Fetching questions for ${folderName} (attempt ${retryCount + 1})...`);
      setLoading(true);
      setError(null);
      setBatchStatus("Loading questions...");
      
      try {
        // We now pass the experiment folderName to generate relevant questions
        const response = await fetch(`http://localhost:8000/api/generate_questions/${folderName}`);
        
        if (response.status === 429) {
          // Rate limit hit - wait and retry
          const backoffTime = Math.min(2 ** retryCount + Math.random(), 30);
          setBatchStatus(`Rate limit hit. Retrying in ${backoffTime.toFixed(1)} seconds...`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, backoffTime * 1000);
          
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received data:", data);
        
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setAnswerKeys(data.ansmcq || []);
          setBatchStatus("");
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Received invalid data format from server");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        
        if (retryCount < 3) {
          // Auto-retry a few times
          const backoffTime = Math.min(2 ** retryCount + Math.random(), 10);
          setBatchStatus(`Error: ${error.message}. Retrying in ${backoffTime.toFixed(1)} seconds...`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, backoffTime * 1000);
        } else {
          setError(error.message);
          setLoading(false);
          setBatchStatus("");
        }
      }
    };

    fetchQuestions();
  }, [folderName, retryCount]);

  // Handle answer selection/input
  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  // Submit answers for grading with retry logic
  const submitAnswer = async (question, index) => {
    console.log("Submitting answer for:", question);
    const studentAnswer = answers[question] || "";
    let retries = 0;
    const maxRetries = 3;
    
    setGradingResponse((prev) => ({ 
      ...prev, 
      [question]: "Grading..." 
    }));
    
    const attemptGrading = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/grade_answer/${folderName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            question: question, 
            student_answer: studentAnswer 
          }),
        });

        if (response.status === 429 && retries < maxRetries) {
          retries++;
          const backoffTime = Math.min(2 ** retries + Math.random(), 10);
          
          setGradingResponse((prev) => ({ 
            ...prev, 
            [question]: `Rate limit hit. Retrying in ${backoffTime.toFixed(1)} seconds... (${retries}/${maxRetries})` 
          }));
          
          setTimeout(attemptGrading, backoffTime * 1000);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        console.log("Grading response:", data);
        
        setGradingResponse((prev) => ({ 
          ...prev, 
          [question]: data.graded_score || "Grading completed, but no feedback received" 
        }));
      } catch (error) {
        console.error("Error submitting answer:", error);
        
        if (retries < maxRetries) {
          retries++;
          const backoffTime = Math.min(2 ** retries + Math.random(), 10);
          
          setGradingResponse((prev) => ({ 
            ...prev, 
            [question]: `Error: ${error.message}. Retrying in ${backoffTime.toFixed(1)} seconds... (${retries}/${maxRetries})` 
          }));
          
          setTimeout(attemptGrading, backoffTime * 1000);
        } else {
          setGradingResponse((prev) => ({ 
            ...prev, 
            [question]: `Error after ${maxRetries} retries: ${error.message}. Please try again later.` 
          }));
        }
      }
    };
    
    attemptGrading();
  };

  // Display main question content without the options
  const getMainQuestion = (questionText) => {
    if (!questionText) return "";
    
    const lines = questionText.split('\n');
    let mainQuestion = [];
    
    for (let line of lines) {
      if (!line.trim().startsWith('Option ')) {
        mainQuestion.push(line);
      } else {
        break; // Stop when we reach the options
      }
    }
    
    return mainQuestion.join('\n');
  };

  // Manual retry button
  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Return to simulation
  const handleReturnToSimulation = () => {
    window.history.back();
  };

  const experimentName = experiment?.name || folderName.replace(/_/g, ' ');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="quiz-header">
        <h1 className="text-2xl font-bold text-center mb-2">Quiz: {experimentName}</h1>
        <p className="text-center mb-6 text-gray-600">Test your understanding of the experiment</p>
        <button onClick={handleReturnToSimulation} className="return-btn">
          ← Return to Simulation
        </button>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <p className="text-lg">Loading questions...</p>
          {batchStatus && (
            <p className="text-sm text-blue-600 mt-2">{batchStatus}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">This may take a few moments as we generate personalized questions.</p>
          
          {retryCount > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700">Attempt {retryCount + 1} of 4</p>
              <p className="text-sm text-yellow-600 mt-1">We're experiencing some delays with the question generator. Please be patient.</p>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2">This may be due to rate limiting or server issues.</p>
          <button 
            onClick={handleManualRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry Loading Questions
          </button>
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center text-red-500">No questions available. Please try again later.</p>
      ) : (
        <div className="space-y-8">
          {questions.map((q, index) => {
            const options = q.is_exploratory === 0 ? parseOptions(q.question_text) : [];
            const mainQuestion = getMainQuestion(q.question_text);
            
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-medium text-lg">Question {index + 1}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {q.is_exploratory === 0 ? "Multiple Choice" : "Exploratory"}
                  </span>
                </div>
                
                <p className="font-medium text-gray-800 mb-4 whitespace-pre-line text-xl">{mainQuestion}</p>

                {q.is_exploratory === 0 ? (
                  <div className="space-y-4 ml-2">
                    {options.length > 0 ? (
                      options.map((option, optIndex) => (
                        <div key={optIndex} className="mb-3">
                          <label className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option.substring(0, 8)} // "Option X"
                              checked={answers[q.question_text] === option.substring(0, 8)}
                              onChange={() => handleAnswerChange(q.question_text, option.substring(0, 8))}
                              className="form-radio mt-1"
                            />
                            <span className="text-gray-700 text-lg block">{option}</span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="text-yellow-600 bg-yellow-50 p-3 rounded">
                        No options found in question text. This might be a formatting issue.
                      </div>
                    )}
                    
                    {answers[q.question_text] && (
                      <div className="mt-6">
                        <button 
                          onClick={() => submitAnswer(q.question_text, index)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          Check Answer
                        </button>
                        
                        {gradingResponse[q.question_text] && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded">
                            <h3 className="font-medium text-blue-800 mb-1">Feedback:</h3>
                            <p className="text-gray-700 whitespace-pre-line">{gradingResponse[q.question_text]}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Write your answer here... Explain your understanding of the concept in detail."
                      value={answers[q.question_text] || ""}
                      onChange={(e) => handleAnswerChange(q.question_text, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32 text-lg"
                    />
                    
                    <button 
                      onClick={() => submitAnswer(q.question_text, index)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={!answers[q.question_text] || answers[q.question_text].length < 10}
                    >
                      Submit for Grading
                    </button>
                    
                    {!answers[q.question_text] || answers[q.question_text].length < 10 ? (
                      <p className="text-sm text-gray-500">Please write at least 10 characters for grading.</p>
                    ) : null}
                    
                    {gradingResponse[q.question_text] && (
                      <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded">
                        <h3 className="font-medium text-gray-800 mb-2">Feedback:</h3>
                        <p className="text-gray-700 whitespace-pre-line">{gradingResponse[q.question_text]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExperimentQuiz;