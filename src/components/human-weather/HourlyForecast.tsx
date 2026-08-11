"use client";

import { motion } from "framer-motion";
import { EmotionStat, getEmotionById } from "./emotions";

interface HourlyForecastProps {
  hourlyData: { hour: string; stats: EmotionStat[] }[];
}

export default function HourlyForecast({ hourlyData }: HourlyForecastProps) {
  if (hourlyData.length === 0) return null;

  return (
    <div>
      <h3
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "var(--text-dim)" }}
      >
        Emotional Hours
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: "none" }}>
        {hourlyData.map((hour, i) => {
          const dominant = hour.stats[0];
          const emotion = dominant ? getEmotionById(dominant.emotion) : null;
          const isNow = i === 0;

          return (
            <motion.div
              key={hour.hour}
              className="flex flex-col items-center gap-2 flex-shrink-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span
                className="text-[10px] tracking-wide"
                style={{ color: isNow ? "#0d9488" : "var(--text-faint)", fontWeight: isNow ? 500 : 400 }}
              >
                {isNow ? "NOW" : hour.hour}
              </span>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: isNow ? "rgba(13, 148, 136, 0.08)" : "rgba(13, 148, 136, 0.03)",
                  border: `1px solid ${isNow ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.06)"}`,
                }}
              >
                <span className="text-xl">{emotion?.emoji || "🌤️"}</span>
              </div>
              {dominant && (
                <>
                  <span className="text-[10px] font-medium" style={{ color: emotion?.color }}>
                    {dominant.percentage}%
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-faint)" }}>
                    {emotion?.label}
                  </span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
