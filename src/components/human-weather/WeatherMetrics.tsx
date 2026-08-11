"use client";

import { motion } from "framer-motion";

interface WeatherMetricsProps {
  pressure: number;
  warmth: number;
  energy: number;
  visibility: number;
}

export default function WeatherMetrics({ pressure, warmth, energy, visibility }: WeatherMetricsProps) {
  const metrics = [
    {
      label: "Emotional Pressure",
      description: "Anxiety + Overwhelm",
      value: pressure,
      color: "#8b5cf6",
      icon: "🌡️",
    },
    {
      label: "Warmth",
      description: "Loved + Hopeful",
      value: warmth,
      color: "#ec4899",
      icon: "🔥",
    },
    {
      label: "Energy",
      description: "Excited + Energised",
      value: energy,
      color: "#f59e0b",
      icon: "⚡",
    },
    {
      label: "Visibility",
      description: "Lost + Numb",
      value: visibility,
      color: "#64748b",
      icon: "👁️",
    },
  ];

  return (
    <div>
      <h3
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "var(--text-dim)" }}
      >
        Elovayne Indicators
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            className="p-4 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(13, 148, 136, 0.06)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">{metric.icon}</span>
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                {metric.label}
              </span>
            </div>
            <div className="text-2xl font-light mb-1" style={{ color: metric.color }}>
              {metric.value}%
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
              {metric.description}
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(13, 148, 136, 0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: metric.color }}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] mt-3 text-center" style={{ color: "var(--text-faint)" }}>
        These are Elovayne emotional indicators, not medical measurements.
      </p>
    </div>
  );
}
