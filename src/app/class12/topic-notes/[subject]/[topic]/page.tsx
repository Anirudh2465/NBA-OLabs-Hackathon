"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  Lightbulb,
  Rocket,
  Clock,
  Download,
  Share2,
  PlayCircle,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { notFound } from "next/navigation";

// Function to generate content using your h5 model and Gemini API
async function generateTopicContent(topicName, topicId, subject) {
  try {
    // First try to get data from your h5 model
    const h5Response = await fetch("/api/h5-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        topicId,
        topicName,
      }),
    });

    // If h5 model doesn't have sufficient data, use Gemini API as backup
    if (!h5Response.ok) {
      const geminiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: "AIzaSyAgElF25dRy_ZQVunVJ3VdjhjGj7773rQY",
          model: "gemini-2.0-flash-thinking-exp-01-21",
          prompt: `Generate comprehensive educational notes for Class 12 NCERT ${subject} topic: ${topicName}. 
          Include key concepts, formulas, diagrams descriptions, numerical examples, common exam questions, and interactive simulation suggestions.
          Format the response as JSON with the following structure:
          {
            "introduction": "Overview of the topic",
            "keyConcepts": [
              {"title": "Concept name", "description": "Detailed explanation"}
            ],
            "formulas": [
              {"equation": "Formula representation", "description": "What the formula means and how to use it"}
            ],
            "explanations": [
              {"title": "Subtopic", "content": "Detailed explanation"}
            ],
            "examples": [
              {"title": "Example title", "problem": "Problem statement", "solution": "Step by step solution"}
            ],
            "commonQuestions": [
              {"question": "Exam question example", "hint": "Hint to solve", "solution": "Complete solution"}
            ],
            "diagrams": [
              {"title": "Diagram title", "description": "Description of what the diagram shows", "imageUrl": null}
            ],
            "simulations": [
              {"title": "Simulation title", "description": "What the simulation demonstrates", "conceptCovered": "Which concept this helps understand", "interactionTip": "How to interact with this simulation to learn effectively"}
            ],
            "studyTip": "A helpful study tip for this topic"
          }`,
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await geminiResponse.json();
      return { content: data.content };
    }

    return await h5Response.json();
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      content: {
        introduction: "Failed to load content. Please try again later.",
        keyConcepts: [],
        formulas: [],
        examples: [],
        commonQuestions: [],
        simulations: [],
      },
    };
  }
}

export default function TopicNotesPage({ params }: { params: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [revealedHints, setRevealedHints] = useState({});
  const [revealedSolutions, setRevealedSolutions] = useState({});
  const [bookmarked, setBookmarked] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [expandedConcepts, setExpandedConcepts] = useState({});
  const [status, setStatus] = useState(null);

  // Extract parameters from URL
  const unwrappedParams = React.use(params);
  const { subject, topic } = unwrappedParams;

  // Format topic name for display
  const topicName = topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);

      // Generate topic content using your models
      const generatedContent = await generateTopicContent(topicName, subject);

      // Add additional questions if fewer than 5 questions exist
      if (generatedContent.content?.commonQuestions?.length < 5) {
        const additionalQuestions = [
          {
            question:
              "Explain the significance of this topic in real-world applications.",
            hint: "Consider how this concept is applied in technology, engineering, or everyday phenomena.",
            solution:
              "This topic has significant real-world applications in fields such as telecommunications, energy production, medical diagnostics, and materials science. Technologies like MRI machines, solar panels, and fiber optic communications all rely on these principles.",
          },
          {
            question:
              "Derive the key formula related to this topic and explain the meaning of each term.",
            hint: "Start with the basic principles and use appropriate mathematical steps to reach the formula.",
            solution:
              "Starting from the fundamental principles, we can derive the formula by considering the boundary conditions and applying the appropriate mathematical transformations. Each term in the equation represents a physical quantity that contributes to the overall phenomenon.",
          },
          {
            question:
              "Compare and contrast this topic with a related concept you've studied previously.",
            hint: "Consider similarities in mathematical formulation, underlying principles, and key differences.",
            solution:
              "While both concepts deal with similar physical phenomena, they differ in scale, applicable conditions, and mathematical complexity. The previous concept was limited to idealized scenarios, whereas this topic addresses more realistic situations with fewer assumptions.",
          },
          {
            question:
              "How would you design an experiment to verify the principles discussed in this topic?",
            hint: "Consider necessary equipment, control variables, and measurable outcomes.",
            solution:
              "An effective experimental setup would include precise measurement instruments, controlled environmental conditions, and a method to isolate the phenomenon being studied. Key measurements would include initial conditions, rate of change, and final state values.",
          },
        ];

        const currentQuestions =
          generatedContent.content?.commonQuestions || [];
        const neededQuestions = 5 - currentQuestions.length;

        if (neededQuestions > 0) {
          generatedContent.content.commonQuestions = [
            ...currentQuestions,
            ...additionalQuestions.slice(0, neededQuestions),
          ];
        }
      }

      setContent(generatedContent.content);
      setIsLoading(false);
    }

    loadContent();
  }, [topicName, subject]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            clearInterval(interval);
            setTimerActive(false);
            showNotificationMessage(
              "Study time complete! Take a break.",
              "success"
            );
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerMinutes]);

  const handleStartTimer = () => {
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  const toggleHint = (index) => {
    setRevealedHints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSolution = (index) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const SimulationButton = ({ simulation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const launchSimulation = async () => {
      try {
        setIsLoading(true);
        setStatus(null);

        // Determine which command to run based on the subject
        let command;
        if (simulation.subject?.toLowerCase() === "physics") {
          command = "uvicorn physim:app --reload";
        } else if (simulation.subject?.toLowerCase() === "chemistry") {
          command = "uvicorn chemsim:app --reload";
        } else {
          command = "npm start ExperimentStatus"; // Default fallback
        }

        // Call API to execute the command
        const response = await axios.post("/api/run-command", {
          command,
          simulationDetails: {
            experiment_name: simulation.title,
            experiment_description: simulation.description,
            complexity_level: "Intermediate",
            target_age_group: "High School",
          },
        });

        setStatus({
          success: true,
          message: `Successfully launched ${simulation.subject} simulation`,
          data: response.data,
        });
      } catch (error) {
        console.error("Error launching simulation:", error);
        setStatus({
          success: false,
          message: "Failed to launch simulation",
          error: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
  };
  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    showNotificationMessage(
      bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      "success"
    );
  };

  const toggleConceptExpand = (index) => {
    setExpandedConcepts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const downloadNotes = () => {
    showNotificationMessage("Notes downloading...", "success");
    // Actual download functionality would go here
  };

  const shareNotes = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotificationMessage("Link copied to clipboard", "success");
    closeShareModal();
  };

  const showNotificationMessage = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  async function launchSimulation(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    simulation: any
  ): Promise<void> {
    try {
      setIsLoading(true);
      setStatus(null);

      // Send simulation data to the API
      const response = await axios.post("/api/run-command", {
        simulationDetails: {
          subject: simulation.subject || "default",
          title: simulation.title,
          description: simulation.description,
          complexity_level: "Intermediate",
          target_age_group: "High School",
        },
      });

      setStatus({
        success: true,
        message: `Successfully launched ${simulation.title} simulation`,
        data: response.data,
      });
    } catch (error) {
      console.error("Error launching simulation:", error);
      setStatus({
        success: false,
        message:
          "Failed to launch simulation: " +
          (error.response?.data?.error || error.message),
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.5 },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: 10,
      transition: { duration: 0.3 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300"
        >
          Generating in-depth notes for {topicName}...
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-900 text-white"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/class12/${subject}`}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Knowledge Graph</span>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors ${
                bookmarked ? "text-yellow-400" : "text-gray-400"
              }`}
              title={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
            >
              <Bookmark size={18} />
            </button>
            <button
              onClick={downloadNotes}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-blue-400"
              title="Download Notes"
            >
              <Download size={18} />
            </button>
            <button
              onClick={shareNotes}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-blue-400"
              title="Share Notes"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Topic Title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-700">
            {topicName}
          </h1>
          <p className="text-gray-400 mt-1">
            Class 12 {subject.charAt(0).toUpperCase() + subject.slice(1)} •
            Comprehensive Notes
          </p>
        </motion.div>

        {/* Content tabs */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex space-x-4">
            <motion.button
              onClick={() => setActiveTab("notes")}
              className={`pb-3 px-1 flex items-center ${
                activeTab === "notes"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <BookOpen size={18} className="mr-2" />
              <span>Notes</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("concepts")}
              className={`pb-3 px-1 flex items-center ${
                activeTab === "concepts"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Lightbulb size={18} className="mr-2" />
              <span>Key Concepts</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("practice")}
              className={`pb-3 px-1 flex items-center ${
                activeTab === "practice"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Rocket size={18} className="mr-2" />
              <span>Practice</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("simulations")}
              className={`pb-3 px-1 flex items-center ${
                activeTab === "simulations"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <PlayCircle size={18} className="mr-2" />
              <span>Simulations</span>
            </motion.button>
          </div>
        </div>

        {/* Main content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {activeTab === "notes" && (
              <div className="space-y-6">
                {/* Introduction */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold mb-4">Introduction</h2>
                  <div className="prose prose-invert max-w-none">
                    <p>
                      {content?.introduction ||
                        "Introduction content not available."}
                    </p>
                  </div>
                </motion.div>

                {/* Formulas */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-4">Important Formulas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content?.formulas?.map((formula, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700 p-3 rounded-lg"
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(55, 65, 81, 1)",
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="font-mono text-blue-300">
                          {formula.equation}
                        </div>
                        <div className="text-sm text-gray-300 mt-2">
                          {formula.description}
                        </div>
                      </motion.div>
                    )) || <p>No formulas available.</p>}
                  </div>
                </motion.div>

                {/* Detailed explanations */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-4">
                    Detailed Explanations
                  </h2>
                  <div className="space-y-4 prose prose-invert max-w-none">
                    {content?.explanations?.map((explanation, index) => (
                      <motion.div
                        key={index}
                        className="pb-4 border-b border-gray-700 last:border-0"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <h3 className="text-lg font-semibold text-blue-400">
                          {explanation.title}
                        </h3>
                        <p>{explanation.content}</p>
                      </motion.div>
                    )) || <p>No detailed explanations available.</p>}
                  </div>
                </motion.div>

                {/* Solved examples */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-bold mb-4">Solved Examples</h2>
                  <div className="space-y-6">
                    {content?.examples?.map((example, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700 p-4 rounded-lg"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="font-medium mb-2">
                          Example {index + 1}: {example.title}
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg mb-3">
                          <p>{example.problem}</p>
                        </div>
                        <div className="pl-3 border-l-2 border-blue-500">
                          <div className="font-medium text-blue-400 mb-1">
                            Solution:
                          </div>
                          <p>{example.solution}</p>
                        </div>
                      </motion.div>
                    )) || <p>No examples available.</p>}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "concepts" && (
              <div className="space-y-6">
                {/* Key concepts */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
                  <div className="space-y-4">
                    {content?.keyConcepts?.map((concept, index) => (
                      <motion.div
                        key={index}
                        className={`bg-gray-700 p-4 rounded-lg overflow-hidden`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ backgroundColor: "rgba(55, 65, 81, 1)" }}
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleConceptExpand(index)}
                        >
                          <h3 className="text-lg font-medium text-blue-400">
                            {concept.title}
                          </h3>
                          <motion.div
                            animate={{
                              rotate: expandedConcepts[index] ? 180 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={18} />
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {expandedConcepts[index] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-2"
                            >
                              <p>{concept.description}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )) || <p>No key concepts available.</p>}
                  </div>
                </motion.div>

                {/* Visual representations */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-4">
                    Visual Representations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content?.diagrams?.map((diagram, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700 p-4 rounded-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.03 }}
                      >
                        <div className="aspect-w-16 aspect-h-9 bg-gray-800 flex items-center justify-center mb-3 rounded-lg">
                          {diagram.imageUrl ? (
                            <img
                              src={diagram.imageUrl}
                              alt={diagram.title}
                              className="object-contain max-h-full rounded-lg"
                            />
                          ) : (
                            <div className="text-gray-500 text-center p-4">
                              [Diagram: {diagram.title}]
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-blue-400">
                          {diagram.title}
                        </h3>
                        <p className="text-sm mt-1">{diagram.description}</p>
                      </motion.div>
                    )) || <p>No visual representations available.</p>}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "practice" && (
              <div className="space-y-6">
                {/* Practice problems */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold mb-4">Practice Problems</h2>
                  <div className="space-y-4">
                    {content?.commonQuestions?.map((question, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700 p-4 rounded-lg"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="flex items-start">
                          <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                            <span>{index + 1}</span>
                          </div>
                          <div className="w-full">
                            <p className="font-medium">{question.question}</p>
                            <div className="mt-3 space-y-2">
                              <div>
                                <button
                                  onClick={() => toggleHint(index)}
                                  className="w-full text-left bg-gray-800 p-3 rounded-lg hover:bg-gray-600 transition-colors flex justify-between items-center"
                                >
                                  <span>
                                    <span className="text-blue-400 mr-2">
                                      Hint:
                                    </span>
                                    {revealedHints[index]
                                      ? "Hide"
                                      : "Click to reveal"}
                                  </span>
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${
                                      revealedHints[index] ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                                <AnimatePresence>
                                  {revealedHints[index] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="bg-gray-700 p-3 mt-1 rounded-lg text-gray-300"
                                    >
                                      {question.hint}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div>
                                <button
                                  onClick={() => toggleSolution(index)}
                                  className="w-full text-left bg-gray-800 p-3 rounded-lg hover:bg-gray-600 transition-colors flex justify-between items-center"
                                >
                                  <span>
                                    <span className="text-blue-400 mr-2">
                                      Solution:
                                    </span>
                                    {revealedSolutions[index]
                                      ? "Hide"
                                      : "Click to reveal"}
                                  </span>
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${
                                      revealedSolutions[index]
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                                <AnimatePresence>
                                  {revealedSolutions[index] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="bg-gray-700 p-3 mt-1 rounded-lg text-gray-300"
                                    >
                                      {question.solution}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )) || <p>No practice problems available.</p>}
                  </div>
                </motion.div>
                {/* Study timer */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-4">Study Timer</h2>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-mono mb-4">
                      {String(timerMinutes).padStart(2, "0")}:
                      {String(timerSeconds).padStart(2, "0")}
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleStartTimer}
                        className={`px-4 py-2 rounded-lg ${
                          timerActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } transition-colors`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {timerActive ? "Pause" : "Start"} Timer
                      </motion.button>
                      <motion.button
                        onClick={handleResetTimer}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reset
                      </motion.button>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      Use the Pomodoro technique: 25 minutes of focused study,
                      then take a 5-minute break.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "simulations" && (
              <div className="space-y-6">
                {/* Interactive simulations */}
                <motion.div
                  className="bg-gray-800 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold mb-4">
                    Interactive Simulations
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {content?.simulations?.map((simulation, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700 p-4 rounded-lg relative overflow-hidden"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-xs text-white px-2 py-1">
                          Interactive
                        </div>
                        <h3 className="font-medium text-lg text-blue-400 mt-2">
                          {simulation.title}
                        </h3>
                        <p className="mt-2">{simulation.description}</p>
                        <div className="mt-4 flex items-center bg-gray-800 p-3 rounded-lg">
                          <Lightbulb
                            size={18}
                            className="text-yellow-500 mr-2 flex-shrink-0"
                          />
                          <p className="text-sm">
                            <span className="text-yellow-500 font-medium">
                              Concept covered:
                            </span>{" "}
                            {simulation.conceptCovered}
                          </p>
                        </div>
                        <motion.button
                          className={`w-full mt-4 ${
                            isLoading
                              ? "bg-gray-600"
                              : "bg-blue-600 hover:bg-blue-700"
                          } p-3 rounded-lg flex items-center justify-center font-medium`}
                          whileHover={{ scale: isLoading ? 1 : 1.02 }}
                          whileTap={{ scale: isLoading ? 1 : 0.98 }}
                          onClick={(e) => launchSimulation(e, simulation)} // Pass the simulation data
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Launching...
                            </>
                          ) : (
                            <>
                              <PlayCircle size={18} className="mr-2" />
                              Launch Simulation
                            </>
                          )}
                        </motion.button>
                        <p className="text-sm text-gray-400 mt-2">
                          <span className="text-gray-300">Tip:</span>{" "}
                          {simulation.interactionTip}
                        </p>
                      </motion.div>
                    )) || (
                      <div className="bg-gray-700 p-6 rounded-lg text-center">
                        <AlertTriangle
                          size={32}
                          className="mx-auto text-yellow-500 mb-3"
                        />
                        <p>No simulations available for this topic.</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Interactive simulations are being developed for this
                          topic. Check back later.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Study tip */}
        {content?.studyTip && (
          <motion.div
            className="mt-8 bg-gradient-to-r from-blue-900 to-indigo-900 p-4 rounded-lg flex items-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-blue-500 p-2 rounded-full mr-3 flex-shrink-0">
              <Lightbulb size={18} />
            </div>
            <div>
              <div className="font-medium">Study Tip</div>
              <p className="text-gray-300 text-sm mt-1">{content.studyTip}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeShareModal}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Share Notes</h2>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Share URL</p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={
                        typeof window !== "undefined"
                          ? window.location.href
                          : ""
                      }
                      readOnly
                      className="bg-gray-700 p-2 rounded-lg flex-1 text-gray-300"
                    />
                    <motion.button
                      onClick={copyLink}
                      className="ml-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check size={18} />
                    </motion.button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Share via</p>
                  <div className="flex justify-around">
                    <motion.button
                      className="p-2 bg-blue-800 rounded-full hover:bg-blue-700"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-2 bg-blue-900 rounded-full hover:bg-blue-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-2 bg-green-700 rounded-full hover:bg-green-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-2 bg-blue-600 rounded-full hover:bg-blue-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${
              notificationType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {notificationType === "success" ? (
              <CheckCircle size={20} className="mr-2" />
            ) : (
              <AlertTriangle size={20} className="mr-2" />
            )}
            <p>{notificationMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
