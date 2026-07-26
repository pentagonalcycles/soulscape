"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GlowingPortal() {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push("/sanctuary");
    }, 1500);
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Portal ring */}
      <motion.button
        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full cursor-pointer border-0 bg-transparent"
        style={{
          boxShadow: isHovered
            ? "0 0 100px rgba(157, 124, 216, 0.7), 0 0 200px rgba(107, 63, 160, 0.5), 0 0 300px rgba(232, 121, 168, 0.3), inset 0 0 60px rgba(157, 124, 216, 0.3)"
            : "0 0 60px rgba(157, 124, 216, 0.4), 0 0 120px rgba(107, 63, 160, 0.3), inset 0 0 40px rgba(157, 124, 216, 0.2)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEnter}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: isHovered
            ? "0 0 100px rgba(157, 124, 216, 0.7), 0 0 200px rgba(107, 63, 160, 0.5), 0 0 300px rgba(232, 121, 168, 0.3), inset 0 0 60px rgba(157, 124, 216, 0.3)"
            : [
                "0 0 60px rgba(157, 124, 216, 0.4), 0 0 120px rgba(107, 63, 160, 0.3), inset 0 0 40px rgba(157, 124, 216, 0.2)",
                "0 0 80px rgba(157, 124, 216, 0.6), 0 0 160px rgba(107, 63, 160, 0.4), inset 0 0 50px rgba(157, 124, 216, 0.3)",
                "0 0 60px rgba(157, 124, 216, 0.4), 0 0 120px rgba(107, 63, 160, 0.3), inset 0 0 40px rgba(157, 124, 216, 0.2)",
              ],
        }}
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(157, 124, 216, 0.3) 0%, rgba(107, 63, 160, 0.1) 50%, transparent 70%)",
          }}
        />

        {/* Portal text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-elovayne-light font-heading text-lg md:text-xl tracking-widest uppercase glow-text"
            animate={{
              textShadow: [
                "0 0 10px rgba(157, 124, 216, 0.4), 0 0 30px rgba(107, 63, 160, 0.2)",
                "0 0 20px rgba(157, 124, 216, 0.7), 0 0 40px rgba(107, 63, 160, 0.4)",
                "0 0 10px rgba(157, 124, 216, 0.4), 0 0 30px rgba(107, 63, 160, 0.2)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Enter
          </motion.span>
        </div>
      </motion.button>

      {/* Exit animation overlay */}
      {isExiting && (
        <motion.div
          className="fixed inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ background: 'linear-gradient(135deg, #120a2e 0%, #0f1545 25%, #0a1a3a 50%, #0d2030 75%, #050510 100%)', zIndex: 100 }}
        />
      )}
    </motion.div>
  );
}
