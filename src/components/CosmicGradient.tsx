"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const gradientSets = [
  {
    colors: [
      "rgba(100, 50, 200, 0.5)",
      "rgba(30, 120, 200, 0.4)",
      "rgba(20, 180, 160, 0.35)",
      "rgba(200, 60, 100, 0.3)",
      "rgba(220, 180, 40, 0.25)",
      "rgba(255, 100, 180, 0.2)",
      "rgba(60, 200, 255, 0.25)",
    ],
    name: "nebula",
  },
  {
    colors: [
      "rgba(20, 80, 180, 0.45)",
      "rgba(10, 160, 130, 0.35)",
      "rgba(180, 40, 80, 0.3)",
      "rgba(200, 160, 30, 0.25)",
      "rgba(80, 40, 180, 0.35)",
      "rgba(0, 220, 180, 0.2)",
      "rgba(120, 60, 255, 0.2)",
    ],
    name: "ocean",
  },
  {
    colors: [
      "rgba(160, 30, 60, 0.35)",
      "rgba(30, 140, 170, 0.35)",
      "rgba(200, 180, 40, 0.3)",
      "rgba(60, 30, 140, 0.35)",
      "rgba(20, 180, 120, 0.3)",
      "rgba(255, 80, 120, 0.2)",
      "rgba(100, 255, 200, 0.2)",
    ],
    name: "aurora",
  },
  {
    colors: [
      "rgba(30, 100, 180, 0.4)",
      "rgba(180, 50, 90, 0.35)",
      "rgba(20, 180, 140, 0.35)",
      "rgba(180, 160, 40, 0.3)",
      "rgba(100, 40, 160, 0.35)",
      "rgba(60, 180, 255, 0.2)",
      "rgba(255, 120, 60, 0.2)",
    ],
    name: "twilight",
  },
  {
    colors: [
      "rgba(20, 150, 150, 0.35)",
      "rgba(150, 40, 100, 0.35)",
      "rgba(40, 80, 200, 0.35)",
      "rgba(200, 180, 50, 0.25)",
      "rgba(100, 20, 140, 0.35)",
      "rgba(255, 60, 140, 0.2)",
      "rgba(0, 200, 160, 0.25)",
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
