"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the JavaScript components (since Next.js requires this for `.jsx` imports)
const ExperimentForm = dynamic(() => import("./ExperimentForm"), {
  ssr: false,
});
const ExperimentStatus = dynamic(() => import("./ExperimentStatus"), {
  ssr: false,
});

const ExperimentPage: React.FC = () => {
  const [experiment, setExperiment] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Experiment Simulation</h1>
      <ExperimentForm setExperiment={setExperiment} />
      {experiment && <ExperimentStatus />}
    </div>
  );
};

export default ExperimentPage;
