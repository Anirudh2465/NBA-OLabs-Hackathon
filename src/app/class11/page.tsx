"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Beaker,
  Microscope,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function Class11Landing() {
  const [isLoading, setIsLoading] = useState(true);

  const subjects = [
    {
      id: 1,
      name: "Physics",
      icon: <BookOpen size={28} />,
      color: "from-blue-500 to-blue-700",
      description:
        "Explore mechanics, thermodynamics, optics, and modern physics concepts.",
      chapters: 15,
      image: "/api/placeholder/400/300",
    },
    {
      id: 2,
      name: "Chemistry",
      icon: <Beaker size={28} />,
      color: "from-green-500 to-green-700",
      description:
        "Study atomic structure, chemical bonding, organic and inorganic chemistry.",
      chapters: 16,
      image: "/api/placeholder/400/300",
    },
    {
      id: 3,
      name: "Biology",
      icon: <Microscope size={28} />,
      color: "from-purple-500 to-purple-700",
      description:
        "Learn about cell biology, genetics, human physiology, and plant systems.",
      chapters: 22,
      image: "/api/placeholder/400/300",
    },
  ];

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        delay: 0.3,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Back button and header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center mb-8"
        >
          <Link
            href="/dashboard"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
            Class 11
          </h1>
          <p className="text-gray-400 mt-2 text-lg max-w-2xl">
            Explore advanced concepts and build a strong foundation in science
            subjects. Select a subject below to begin your learning journey.
          </p>
        </motion.div>

        {/* Subject Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col"
            >
              <div className={`h-3 bg-gradient-to-r ${subject.color}`}></div>

              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <motion.div
                    variants={iconVariants}
                    className={`p-3 rounded-lg bg-gradient-to-br ${subject.color} bg-opacity-20`}
                  >
                    {subject.icon}
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm font-medium text-gray-400"
                  >
                    {subject.chapters} Chapters
                  </motion.span>
                </div>

                <h2 className="text-2xl font-bold mb-2">{subject.name}</h2>
                <p className="text-gray-400 mb-6">{subject.description}</p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative h-40 rounded-lg overflow-hidden mb-6"
                >
                  <img
                    src={subject.image}
                    alt={subject.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                </motion.div>
              </div>

              <div className="px-6 pb-6 pt-2 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center space-x-2 font-medium shadow-lg`}
                >
                  <span>Explore {subject.name}</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2">Recommended for You</span>
            <div className="h-1 flex-grow bg-gradient-to-r from-orange-500 to-transparent rounded-full ml-4"></div>
          </h2>

          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Based on your recent activity, here are some topics you might be
              interested in:
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "Thermodynamics",
                "Organic Chemistry",
                "Cell Structure",
                "Electromagnetic Waves",
                "Periodic Table",
                "Genetics",
              ].map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="px-4 py-2 bg-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  {topic}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
