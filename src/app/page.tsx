"use client"; // 👈 Required for hooks like useRouter()
import { useRouter } from "next/navigation"; // ✅ Use `next/navigation` instead of `next/router`
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleGenerate = () => {
    if (topic.trim() !== "") {
      router.push(`/simulation?topic=${encodeURIComponent(topic)}`);
    }
  };

  // Staggered animation for children elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 50 + 10}px`,
              height: `${Math.random() * 50 + 10}px`,
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: [0, 1, 1.2, 1],
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              scale: { duration: 2, delay: i * 0.1 },
              y: {
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: "reverse",
              },
              x: {
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          />
        ))}
      </div>

      {/* Star field effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Hero Section */}
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <motion.div
                className="inline-block mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 1.5,
                }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-12 h-12"
                    animate={{
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </motion.svg>
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500"
                variants={itemVariants}
              >
                Welcome to{" "}
                <motion.span
                  className="font-extrabold inline-block"
                  animate={{
                    color: ["#60a5fa", "#818cf8", "#a78bfa", "#60a5fa"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                  }}
                >
                  NewLabs
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
                variants={itemVariants}
              >
                Discover the power of AI-driven simulations in Physics,
                Chemistry, and Biology that bring complex concepts to life.
              </motion.p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              className="w-full max-w-lg mb-16"
              variants={itemVariants}
            >
              <motion.div
                className="relative"
                initial={{ width: "80%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8, type: "spring" }}
              >
                <input
                  type="text"
                  placeholder="Enter a topic (e.g., Newton's Laws)"
                  className="w-full px-6 py-4 rounded-full bg-gray-800/70 backdrop-blur-sm text-white text-lg border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg shadow-blue-500/20"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                />
                <motion.button
                  onClick={handleGenerate}
                  className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    initial={{ y: 0 }}
                    whileHover={{ y: -30 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="block"
                  >
                    Explore
                  </motion.span>
                  <motion.span
                    initial={{ y: 30 }}
                    whileHover={{ y: -30 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    🚀
                  </motion.span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-16"
              variants={itemVariants}
            >
              <FeatureCard
                icon="📚"
                title="Interactive Learning"
                description="Immerse yourself in AI-generated experiments that adapt to your learning style."
                delay={0.2}
              />
              <FeatureCard
                icon="🗣"
                title="Multilingual Chatbot"
                description="Learn complex concepts in your native language with our advanced AI assistant."
                delay={0.4}
              />
              <FeatureCard
                icon="📊"
                title="Progress Tracking"
                description="Visualize your learning journey with detailed analytics and personalized insights."
                delay={0.6}
              />
            </motion.div>

            {/* Login / Signup */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => router.push("/auth/login")}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/20 to-indigo-400/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                Login
              </motion.button>
              <motion.button
                onClick={() => router.push("/auth/signup")}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-400/20 to-blue-400/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                Sign Up
              </motion.button>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              className="absolute top-10 right-10 w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-white/10"
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-teal-500/10 backdrop-blur-sm border border-white/10"
              animate={{
                rotate: [0, -10, 10, 0],
                x: [0, 10, -10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      className="bg-gray-800/40 backdrop-blur-sm border border-blue-500/20 p-6 rounded-xl shadow-lg transition-all duration-300 group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="text-3xl mb-4"
        whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>

      <motion.h3
        className="text-xl font-bold text-blue-400 mb-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>

      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
