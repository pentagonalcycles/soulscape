"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const gradientSets = [
  {
    colors: [
      "rgba(100, 50, 200, 0.4)",
      "rgba(30, 120, 200, 0.35)",
      "rgba(20, 180, 160, 0.3)",
      "rgba(200, 60, 100, 0.25)",
      "rgba(220, 180, 40, 0.2)",
    ],
    name: "nebula",
  },
  {
    colors: [
      "rgba(20, 80, 180, 0.35)",
      "rgba(10, 160, 130, 0.3)",
      "rgba(180, 40, 80, 0.25)",
      "rgba(200, 160, 30, 0.2)",
      "rgba(80, 40, 180, 0.3)",
    ],
    name: "ocean",
  },
  {
    colors: [
      "rgba(160, 30, 60, 0.3)",
      "rgba(30, 140, 170, 0.3)",
      "rgba(200, 180, 40, 0.25)",
      "rgba(60, 30, 140, 0.3)",
      "rgba(20, 180, 120, 0.25)",
    ],
    name: "aurora",
  },
  {
    colors: [
      "rgba(30, 100, 180, 0.35)",
      "rgba(180, 50, 90, 0.3)",
      "rgba(20, 180, 140, 0.3)",
      "rgba(180, 160, 40, 0.25)",
      "rgba(100, 40, 160, 0.3)",
    ],
    name: "twilight",
  },
  {
    colors: [
      "rgba(20, 150, 150, 0.3)",
      "rgba(150, 40, 100, 0.3)",
      "rgba(40, 80, 200, 0.3)",
      "rgba(200, 180, 50, 0.2)",
      "rgba(100, 20, 140, 0.3)",
    ],
    name: "deep",
  },
]

const blobs = [
  { x: "15%", y: "20%", size: 400, speed: 45, blur: 120, delay: 0 },
  { x: "70%", y: "15%", size: 350, speed: 55, blur: 110, delay: 2 },
  { x: "40%", y: "60%", size: 380, speed: 50, blur: 130, delay: 4 },
  { x: "80%", y: "70%", size: 320, speed: 60, blur: 100, delay: 1 },
  { x: "25%", y: "80%", size: 360, speed: 48, blur: 115, delay: 3 },
]

export default function CosmicGradient() {
  const [activeSet, setActiveSet] = useState(gradientSets[0])

  useEffect(() => {
    setActiveSet(gradientSets[Math.floor(Math.random() * gradientSets.length)])
  }, [])

  const scale = 0.8

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
            background: `radial-gradient(circle, ${activeSet.colors[i]} 0%, transparent 70%)`,
            filter: `blur(${blob.blur}px)`,
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 20, -40, 0],
            scale: [1, 1.15, 0.9, 1.1, 1],
          }}
          transition={{
            duration: blob.speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  )
}
