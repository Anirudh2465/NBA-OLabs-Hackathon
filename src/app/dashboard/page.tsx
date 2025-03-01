"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Beaker,
  Microscope,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState(null);
  const [userName, setUserName] = useState(" User");
  const [notifications, setNotifications] = useState(3);

  const classes = [
    { id: 9, name: "Class 9", color: "from-emerald-500 to-teal-700" },
    { id: 10, name: "Class 10", color: "from-violet-500 to-purple-700" },
    { id: 11, name: "Class 11", color: "from-orange-500 to-red-700" },
    { id: 12, name: "Class 12", color: "from-blue-500 to-indigo-700" },
  ];

  const handleClassClick = (classId: number) => {
    router.push(`/class${classId}`); // Navigate to the class page
  };

  useEffect(() => {
    // Default to Class 9 on initial load
    setSelectedClass(9);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <Brain className="text-blue-400" size={28} />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              NewLabs
            </span>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-6"
          >
            <div className="relative">
              <Bell
                size={20}
                className="text-gray-300 hover:text-white cursor-pointer"
              />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="text-sm">{userName}</span>
            </div>
            <LogOut
              size={20}
              className="text-gray-300 hover:text-white cursor-pointer"
            />
          </motion.div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold">Welcome back, User!</h1>
          <p className="text-gray-400 mt-1">
            Pick up where you left off or explore a new class.
          </p>
        </motion.div>

        {/* Class Selection */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {classes.map((classItem) => (
            <motion.div
              key={classItem.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              onClick={() => handleClassClick(classItem.id)} // Navigate on click
              className={`bg-gray-800 p-5 rounded-xl shadow-lg cursor-pointer relative overflow-hidden transition-all ${
                selectedClass === classItem.id
                  ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500"
                  : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${classItem.color} opacity-30`}
              ></div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold">{classItem.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {classItem.id === selectedClass
                    ? "Currently viewing"
                    : "Click to view"}
                </p>
              </div>

              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                className="absolute bottom-3 right-3 w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-10"
              >
                {classItem.id}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Selected Class Header - Without Subjects */}
        {selectedClass && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold mb-6 flex items-center"
          >
            <span className="mr-2">Class {selectedClass} Dashboard</span>
            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded-full ml-4"></div>
          </motion.h2>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2">Recent Activity</span>
            <div className="h-1 flex-grow bg-gradient-to-r from-purple-500 to-transparent rounded-full ml-4"></div>
          </h2>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">
                    Completed Quiz: Forces and Motion
                  </h3>
                  <p className="text-sm text-gray-400">Physics • 2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Beaker size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">
                    Started Chapter: Periodic Table
                  </h3>
                  <p className="text-sm text-gray-400">Chemistry • Yesterday</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Microscope size={18} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">Ran Simulation: Cell Division</h3>
                  <p className="text-sm text-gray-400">Biology • 2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
