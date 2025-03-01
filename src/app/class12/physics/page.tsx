"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ZoomIn, ZoomOut, RotateCw, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as d3 from "d3";

export default function SubjectKnowledgeGraph({ params }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [subjectData, setSubjectData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Get subject from params or URL
  const subjectId = params?.subjectId || "physics";

  // Define subject data
  const subjects = {
    physics: {
      title: "Physics",
      color: "from-blue-500 to-indigo-700",
      buttonColor: "bg-gradient-to-r from-blue-500 to-indigo-700",
      description:
        "Master electromagnetism, modern physics, quantum mechanics, and semiconductors.",
      nodes: [
        {
          id: "1",
          name: "Electric Charges and Fields",
          group: 1,
          connections: ["2", "16", "17", "18", "19"],
        },
        {
          id: "2",
          name: "Electrostatic Potential and Capacitance",
          group: 1,
          connections: ["1", "3", "18", "19", "20"],
        },
        {
          id: "3",
          name: "Current Electricity",
          group: 1,
          connections: ["2", "4", "21", "22", "23", "24"],
        },
        {
          id: "4",
          name: "Moving Charges and Magnetism",
          group: 1,
          connections: ["3", "5", "25", "26"],
        },
        {
          id: "5",
          name: "Magnetism and Matter",
          group: 1,
          connections: ["4", "6"],
        },
        {
          id: "6",
          name: "Electromagnetic Induction",
          group: 1,
          connections: ["4", "5", "7", "27", "28"],
        },
        {
          id: "7",
          name: "Alternating Current",
          group: 1,
          connections: ["6", "8", "29", "30"],
        },
        {
          id: "8",
          name: "Electromagnetic Waves",
          group: 1,
          connections: ["7", "9"],
        },
        {
          id: "9",
          name: "Ray Optics and Optical Instruments",
          group: 2,
          connections: ["8", "10"],
        },
        { id: "10", name: "Wave Optics", group: 2, connections: ["9", "11"] },
        {
          id: "11",
          name: "Dual Nature of Radiation and Matter",
          group: 3,
          connections: ["10", "12", "31", "32"],
        },
        { id: "12", name: "Atoms", group: 3, connections: ["11", "13", "33"] },
        {
          id: "13",
          name: "Nuclei",
          group: 3,
          connections: ["12", "14", "34", "35"],
        },
        {
          id: "14",
          name: "Semiconductor Electronics",
          group: 4,
          connections: ["13", "15", "36"],
        },
        {
          id: "15",
          name: "Communication Systems",
          group: 4,
          connections: ["14"],
        },
        { id: "16", name: "Coulomb's Law", group: 1, connections: ["1"] },
        {
          id: "17",
          name: "Electric Field Lines",
          group: 1,
          connections: ["1"],
        },
        {
          id: "18",
          name: "Electric Dipole",
          group: 1,
          connections: ["1", "2"],
        },
        { id: "19", name: "Gauss's Law", group: 1, connections: ["1", "2"] },
        {
          id: "20",
          name: "Capacitor Combinations",
          group: 1,
          connections: ["2"],
        },
        { id: "21", name: "Ohm's Law", group: 1, connections: ["3"] },
        { id: "22", name: "Kirchhoff's Laws", group: 1, connections: ["3"] },
        { id: "23", name: "Wheatstone Bridge", group: 1, connections: ["3"] },
        { id: "24", name: "Potentiometer", group: 1, connections: ["3"] },
        { id: "25", name: "Biot-Savart Law", group: 1, connections: ["4"] },
        { id: "26", name: "Ampere's Law", group: 1, connections: ["4"] },
        { id: "27", name: "Faraday's Laws", group: 1, connections: ["6"] },
        { id: "28", name: "Lenz's Law", group: 1, connections: ["6"] },
        { id: "29", name: "LC Oscillations", group: 1, connections: ["7"] },
        { id: "30", name: "Transformers", group: 1, connections: ["7"] },
        {
          id: "31",
          name: "Photoelectric Effect",
          group: 3,
          connections: ["11"],
        },
        {
          id: "32",
          name: "de Broglie Wavelength",
          group: 3,
          connections: ["11"],
        },
        { id: "33", name: "Bohr Model", group: 3, connections: ["12"] },
        { id: "34", name: "Nuclear Fusion", group: 3, connections: ["13"] },
        { id: "35", name: "Nuclear Fission", group: 3, connections: ["13"] },
        { id: "36", name: "p-n Junction", group: 4, connections: ["14"] },
      ],
    },
  };

  useEffect(() => {
    // Find the correct subject data based on the URL/params
    const currentSubject = subjects.physics;
    setSubjectData(currentSubject);
    setIsLoading(false);

    // Initialize graph after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (svgRef.current && currentSubject) {
        initializeGraph(currentSubject.nodes);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subjectId]);

  const initializeGraph = (nodes) => {
    // Clear any existing graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Create the SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    // Create a group for the graph elements
    const g = svg.append("g").attr("class", "everything");

    // Create zoom behavior
    const zooming = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    // Apply zoom behavior to the SVG
    svg.call(zooming);

    // Create links from node connections
    const links = [];
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        links.push({
          source: node.id,
          target: targetId,
        });
      });
    });

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2))
      .force("collide", d3.forceCollide().radius(60));

    // Define color scale based on group
    const color = d3
      .scaleOrdinal()
      .domain([1, 2, 3, 4, 5])
      .range(["#4299E1", "#38B2AC", "#805AD5", "#ED8936", "#48BB78"]);

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 2);

    // Create nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event, d) => {
        setSelectedNode(d);
        d3.selectAll(".node circle").attr("stroke-width", (node) =>
          node.id === d.id ? 4 : 1.5
        );
      });

    // Add circles to the nodes
    node
      .append("circle")
      .attr("r", 30)
      .attr("fill", (d) => color(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Add text to the nodes
    node
      .append("text")
      .text((d) => d.name.split(" ")[0]) // Just the first word
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .style("pointer-events", "none");

    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Function to handle drag start
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    // Function to handle dragging
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    // Function to handle drag end
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Initial centering zoom
    svg.call(
      zooming.transform,
      d3.zoomIdentity
        .translate(containerWidth / 4, containerHeight / 6)
        .scale(0.8)
    );
  };

  const handleZoomIn = () => {
    d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 0.7);
  };

  const handleReset = () => {
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    d3.select(svgRef.current)
      .transition()
      .call(
        d3.zoom().transform,
        d3.zoomIdentity
          .translate(containerWidth / 4, containerHeight / 6)
          .scale(0.8)
      );
  };

  // Navigate to topic notes page
  const navigateToTopicNotes = (topic) => {
    // Create a URL-friendly slug from the topic name
    const topicSlug = topic.name.toLowerCase().replace(/\s+/g, "-");
    router.push(`/class12/topic-notes/${subjectId}/${topicSlug}`);
  };

  // Group the nodes by their group property
  const groupedNodes = subjectData?.nodes?.reduce((acc, node) => {
    if (!acc[node.group]) {
      acc[node.group] = [];
    }
    acc[node.group].push(node);
    return acc;
  }, {});

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const nodeInfoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
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
      <div className="max-w-7xl mx-auto px-4 py-6 h-screen flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/class12"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Class 12</span>
          </Link>

          {/* Controls for the graph */}
          <div className="flex space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              title="Reset View"
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>

        {/* Subject Title */}
        <div className="mb-4">
          <h1
            className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${subjectData?.color}`}
          >
            {subjectData?.title} Knowledge Graph
          </h1>
          <p className="text-gray-400 mt-1">
            Explore the connections between all{" "}
            {subjectData?.title.toLowerCase()} topics in NCERT Class 12
          </p>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 gap-4 h-full">
          {/* Graph display section */}
          <div
            ref={containerRef}
            className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700"
          >
            <svg ref={svgRef} className="w-full h-full"></svg>

            {/* Zoom indicator */}
            <div className="absolute bottom-3 right-3 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-xs">
              Zoom: {Math.round(zoom * 100)}%
            </div>

            {/* Helper text */}
            <div className="absolute top-3 left-3 bg-gray-900 bg-opacity-70 px-3 py-2 rounded flex items-center">
              <Info size={16} className="mr-2 text-blue-400" />
              <span className="text-sm">
                Click on a node to see details. Drag nodes to rearrange.
              </span>
            </div>
          </div>

          {/* Right sidebar with node details */}
          <div className="w-80 bg-gray-800 rounded-xl p-4 overflow-y-auto">
            {selectedNode ? (
              <motion.div
                variants={nodeInfoVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-xl font-bold mb-2">{selectedNode.name}</h2>
                <div
                  className={`h-1 w-16 ${subjectData?.buttonColor} rounded mb-4`}
                ></div>

                <div className="bg-gray-700 p-3 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-300 mb-1">
                    Key Concepts:
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="opacity-90">
                        Example concept for {selectedNode.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-300 mb-2">
                    Connected Topics:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.connections.map((connId) => {
                      const connectedNode = subjectData.nodes.find(
                        (n) => n.id === connId
                      );
                      return connectedNode ? (
                        <div
                          key={connId}
                          className="px-2 py-1 bg-gray-700 rounded-lg text-xs cursor-pointer hover:bg-gray-600"
                          onClick={() => {
                            setSelectedNode(connectedNode);
                            d3.selectAll(".node circle").attr(
                              "stroke-width",
                              (node) => (node.id === connectedNode.id ? 4 : 1.5)
                            );
                          }}
                        >
                          {connectedNode.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <button
                  onClick={() => navigateToTopicNotes(selectedNode)}
                  className={`w-full py-2 px-4 rounded-lg ${subjectData?.buttonColor} text-white font-medium transition-transform hover:scale-105 active:scale-95`}
                >
                  Generate In-Depth Notes
                </button>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                  <Info size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Topic Details</h3>
                <p className="text-gray-400 text-sm">
                  Select any node from the knowledge graph to view detailed
                  information about that topic.
                </p>
              </div>
            )}

            {/* Topic Categories */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-md font-medium mb-3">Topic Categories:</h3>
              <div className="space-y-2">
                {Object.entries(groupedNodes || {}).map(([group, nodes]) => (
                  <div key={group} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: [
                          "#4299E1",
                          "#38B2AC",
                          "#805AD5",
                          "#ED8936",
                          "#48BB78",
                        ][parseInt(group) - 1],
                      }}
                    ></div>
                    <span className="text-gray-300">
                      {group === "1" && "Electromagnetism"}
                      {group === "2" && "Optics"}
                      {group === "3" && "Quantum Physics"}
                      {group === "4" && "Electronics"}
                      {group === "5" && "Mechanics"}
                    </span>
                    <span className="text-gray-500 ml-1">({nodes.length})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
