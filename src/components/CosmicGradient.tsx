"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const gradientSets = [
  {
    colors: [
      "rgba(0, 255, 136, 0.4)",
      "rgba(0, 204, 106, 0.35)",
      "rgba(57, 255, 20, 0.3)",
      "rgba(74, 222, 128, 0.25)",
      "rgba(0, 180, 100, 0.3)",
      "rgba(52, 211, 153, 0.2)",
      "rgba(26, 92, 46, 0.25)",
    ],
    name: "forest",
  },
  {
    colors: [
      "rgba(0, 255, 136, 0.35)",
      "rgba(57, 255, 20, 0.3)",
      "rgba(0, 204, 106, 0.3)",
      "rgba(74, 222, 128, 0.2)",
      "rgba(0, 180, 100, 0.25)",
      "rgba(52, 211, 153, 0.2)",
      "rgba(26, 92, 46, 0.2)",
    ],
    name: "swamp",
  },
  {
    colors: [
      "rgba(57, 255, 20, 0.35)",
      "rgba(0, 255, 136, 0.3)",
      "rgba(74, 222, 128, 0.25)",
      "rgba(0, 204, 106, 0.3)",
      "rgba(52, 211, 153, 0.2)",
      "rgba(0, 180, 100, 0.2)",
      "rgba(26, 92, 46, 0.25)",
    ],
    name: "aurora",
  },
  {
    colors: [
      "rgba(0, 204, 106, 0.35)",
      "rgba(74, 222, 128, 0.3)",
      "rgba(0, 255, 136, 0.3)",
      "rgba(57, 255, 20, 0.25)",
      "rgba(26, 92, 46, 0.3)",
      "rgba(52, 211, 153, 0.2)",
      "rgba(0, 180, 100, 0.2)",
    ],
    name: "moss",
  },
  {
    colors: [
      "rgba(52, 211, 153, 0.35)",
      "rgba(0, 180, 100, 0.3)",
      "rgba(74, 222, 128, 0.3)",
      "rgba(0, 255, 136, 0.2)",
      "rgba(26, 92, 46, 0.3)",
      "rgba(57, 255, 20, 0.2)",
      "rgba(0, 204, 106, 0.25)",
    ],
    name: "deep",
  },
]

const blobs = [
  { x: "10%", y: "15%", size: 450, speed: 42, blur: 130, delay: 0 },
  { x: "65%", y: "10%", size: 400, speed: 52, blur: 120, delay: 2 },
  { x: "35%", y: "55%", size: 420, speed: 48, blur: 140, delay: 4 },
  { x: "80%", y: "65%", size: 380, speed: 58, blur: 110, delay: 1 },
  { x: "20%", y: "75%", size: 400, speed: 45, blur: 125, delay: 3 },
  { x: "50%", y: "30%", size: 350, speed: 55, blur: 150, delay: 5 },
  { x: "75%", y: "40%", size: 300, speed: 62, blur: 100, delay: 6 },
]

export default function CosmicGradient() {
  const [activeSet, setActiveSet] = useState(gradientSets[0])

  useEffect(() => {
    setActiveSet(gradientSets[Math.floor(Math.random() * gradientSets.length)])
  }, [])

  const scale = 0.85

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size * scale,
            height: blob.size * scale,
            background: `radial-gradient(circle, ${activeSet.colors[i % activeSet.colors.length]} 0%, transparent 65%)`,
            filter: `blur(${blob.blur}px)`,
          }}
          animate={{
            x: [0, 50 * (i % 2 === 0 ? 1 : -1), -40 * (i % 3 === 0 ? 1 : -1), 30, 0],
            y: [0, -40 * (i % 2 === 0 ? 1 : -1), 50 * (i % 3 === 0 ? 1 : -1), -35, 0],
            scale: [1, 1.2, 0.85, 1.15, 1],
          }}
          transition={{
            duration: blob.speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}

      {/* Sweeping aurora band */}
      <motion.div
        className="absolute w-[200%] h-[200px]"
        style={{
          top: "20%",
          left: "-50%",
          background: `linear-gradient(90deg, transparent 5%, ${activeSet.colors[0]} 25%, ${activeSet.colors[2]} 50%, ${activeSet.colors[1]} 75%, transparent 95%)`,
          filter: "blur(80px)",
          opacity: 0.15,
          transformOrigin: "center",
        }}
        animate={{
          x: ["-20%", "20%"],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Second aurora band */}
      <motion.div
        className="absolute w-[200%] h-[150px]"
        style={{
          bottom: "25%",
          left: "-50%",
          background: `linear-gradient(90deg, transparent 5%, ${activeSet.colors[3]} 30%, ${activeSet.colors[4]} 55%, ${activeSet.colors[5 % activeSet.colors.length]} 80%, transparent 95%)`,
          filter: "blur(70px)",
          opacity: 0.12,
          transformOrigin: "center",
        }}
        animate={{
          x: ["20%", "-20%"],
          rotate: [3, -3, 3],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8,
        }}
      />
    </div>
  )
}
