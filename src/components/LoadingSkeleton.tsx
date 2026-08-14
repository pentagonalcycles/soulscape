"use client";

import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          style={{
            background: "linear-gradient(90deg, rgba(0, 255, 136, 0.03) 0%, rgba(0, 255, 136, 0.06) 50%, rgba(0, 255, 136, 0.03) 100%)",
            border: "1px solid rgba(0, 255, 136, 0.06)",
            borderRadius: "10px",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-elovayne-nebula/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-elovayne-nebula/20 rounded animate-pulse" />
              <div className="h-2 w-16 bg-elovayne-deep/30 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-elovayne-nebula/10 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-elovayne-nebula/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-16 bg-elovayne-deep/30 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-elovayne-deep/30 rounded-full animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
