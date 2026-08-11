"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Lantern {
  id: string;
  message: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  glow: number;
  phase: number;
  isNew?: boolean;
}

const LANTERN_COLORS = [
  "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
  "#06b6d4", "#10b981", "#f97316", "#e11d48",
];

export default function WishLanternsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lanternsRef = useRef<Lantern[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number; twinkle: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const selectedRef = useRef<Lantern | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState(LANTERN_COLORS[0]);
  const [selectedLantern, setSelectedLantern] = useState<Lantern | null>(null);
  const [lanternCount, setLanternCount] = useState(0);
  const [sending, setSending] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const client = supabase();
      const { data: { session } } = await client.auth.getSession();
      let uid = session?.user.id;
      if (!uid) {
        const { data: authData } = await client.auth.signInAnonymously();
        uid = authData.user?.id;
      }
      if (uid) setUserId(uid);

      // Load existing lanterns
      const { data } = await client
        .from("wish_lanterns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        const canvas = canvasRef.current;
        const w = canvas?.width || window.innerWidth;
        const h = canvas?.height || window.innerHeight;

        const loaded: Lantern[] = data.map((l: { id: string; message: string; color: string }) => ({
          id: l.id,
          message: l.message,
          color: l.color,
          x: 100 + Math.random() * (w - 200),
          y: 100 + Math.random() * (h - 200),
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.3,
          size: 18 + Math.random() * 12,
          glow: 0.6 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
        }));
        lanternsRef.current = loaded;
        setLanternCount(loaded.length);
      }
    };
    init();
  }, []);

  // Subscribe to new lanterns
  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel("wish-lanterns")
      .on("broadcast", { event: "new_lantern" }, ({ payload }) => {
        const data = payload as { id: string; message: string; color: string };
        const canvas = canvasRef.current;
        const w = canvas?.width || window.innerWidth;
        const h = canvas?.height || window.innerHeight;

        const newLantern: Lantern = {
          id: data.id,
          message: data.message,
          color: data.color,
          x: 100 + Math.random() * (w - 200),
          y: h - 50,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.3 - Math.random() * 0.3,
          size: 20 + Math.random() * 10,
          glow: 0.8,
          phase: Math.random() * Math.PI * 2,
          isNew: true,
        };
        lanternsRef.current.push(newLantern);
        setLanternCount((c) => c + 1);
      })
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const stars: { x: number; y: number; size: number; alpha: number; twinkle: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.6,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const time = Date.now() / 1000;

      // Night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#050510");
      skyGrad.addColorStop(0.4, "#0a0a2e");
      skyGrad.addColorStop(0.7, "#1a0a2e");
      skyGrad.addColorStop(1, "#2a1a3e");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      stars.forEach((star) => {
        star.twinkle += 0.02;
        const twinkleAlpha = star.alpha * (0.5 + 0.5 * Math.sin(star.twinkle));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleAlpha})`;
        ctx.fill();
      });

      // Draw lanterns
      const lanterns = lanternsRef.current;
      lanterns.forEach((lantern) => {
        // Update position
        lantern.phase += 0.02;
        lantern.x += lantern.vx + Math.sin(lantern.phase) * 0.3;
        lantern.y += lantern.vy;

        // Wrap around
        if (lantern.y < -50) {
          lantern.y = h + 50;
          lantern.x = 100 + Math.random() * (w - 200);
        }
        if (lantern.x < -50) lantern.x = w + 50;
        if (lantern.x > w + 50) lantern.x = -50;

        // Fade in new lanterns
        if (lantern.isNew && lantern.glow < 0.8) {
          lantern.glow += 0.01;
        }

        const { x, y, size, glow, color } = lantern;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        glowGrad.addColorStop(0, `${color}${Math.round(glow * 60).toString(16).padStart(2, "0")}`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        ctx.save();
        ctx.translate(x, y);

        // Lantern shape (rounded rectangle with top and bottom)
        const lw = size * 0.8;
        const lh = size * 1.2;

        // Main body glow
        const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, lh);
        bodyGrad.addColorStop(0, `${color}cc`);
        bodyGrad.addColorStop(0.7, `${color}88`);
        bodyGrad.addColorStop(1, `${color}44`);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, lw * 0.5);
        coreGrad.addColorStop(0, "#ffffff90");
        coreGrad.addColorStop(1, "transparent");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, lw * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Flame inside
        ctx.fillStyle = "#ffffff60";
        ctx.beginPath();
        const flameH = lh * 0.3 * (0.8 + 0.2 * Math.sin(time * 3 + lantern.phase));
        ctx.ellipse(0, -lh * 0.1, lw * 0.2, flameH, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Check if mouse is hovering
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
        if (dist < size * 2) {
          ctx.strokeStyle = `${color}60`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Floating embers
      for (let i = 0; i < 5; i++) {
        const ex = Math.random() * w;
        const ey = h - Math.random() * h * 0.3;
        const ea = 0.1 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(245, 158, 11, ${ea})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Touch tracking
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  // Click/tap lantern to read
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const mx = e.clientX;
    const my = e.clientY;

    for (const lantern of lanternsRef.current) {
      const dist = Math.sqrt((mx - lantern.x) ** 2 + (my - lantern.y) ** 2);
      if (dist < lantern.size * 2) {
        setSelectedLantern(lantern);
        selectedRef.current = lantern;
        return;
      }
    }
    setSelectedLantern(null);
    selectedRef.current = null;
  }, []);

  // Touch tap to read lantern
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const mx = e.changedTouches[0].clientX;
      const my = e.changedTouches[0].clientY;

      for (const lantern of lanternsRef.current) {
        const dist = Math.sqrt((mx - lantern.x) ** 2 + (my - lantern.y) ** 2);
        if (dist < lantern.size * 2.5) {
          setSelectedLantern(lantern);
          selectedRef.current = lantern;
          return;
        }
      }
      setSelectedLantern(null);
      selectedRef.current = null;
    }
  }, []);

  // Release a lantern
  async function releaseLantern() {
    if (!message.trim() || !userId || sending) return;
    setSending(true);

    const client = supabase();
    const { data, error } = await client
      .from("wish_lanterns")
      .insert({
        user_id: userId,
        message: message.trim(),
        color: selectedColor,
      })
      .select()
      .single();

    if (data && !error) {
      // Broadcast to others
      const channel = supabase().channel("wish-lanterns");
      channel.send({
        type: "broadcast",
        event: "new_lantern",
        payload: { id: data.id, message: data.message, color: data.color },
      });

      // Add locally
      const canvas = canvasRef.current;
      const w = canvas?.width || window.innerWidth;
      const h = canvas?.height || window.innerHeight;

      const newLantern: Lantern = {
        id: data.id,
        message: data.message,
        color: data.color,
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h - 50,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.3 - Math.random() * 0.3,
        size: 22,
        glow: 0.9,
        phase: 0,
        isNew: true,
      };
      lanternsRef.current.push(newLantern);
      setLanternCount((c) => c + 1);

      setMessage("");
      setShowWrite(false);
    }
    setSending(false);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ cursor: "crosshair" }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Header */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1
          className="text-3xl sm:text-4xl font-light tracking-wide mb-1"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Wish Lanterns
        </h1>
        <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
          {lanternCount} lanterns floating · Click one to read its wish
        </p>
      </motion.div>

      {/* Release button */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          onClick={() => setShowWrite(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-full text-sm cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ec4899)",
            color: "white",
            boxShadow: "0 0 30px rgba(245, 158, 11, 0.3)",
            border: "none",
          }}
        >
          Release a Lantern
        </motion.button>
      </motion.div>

      {/* Write modal */}
      <AnimatePresence>
        {showWrite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5, 5, 16, 0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowWrite(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 rounded-2xl w-full max-w-md text-center"
              style={{
                background: "linear-gradient(180deg, rgba(20, 10, 40, 0.95), rgba(10, 5, 25, 0.98))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                boxShadow: "0 0 60px rgba(245, 158, 11, 0.1)",
              }}
            >
              <div className="text-4xl mb-4">🏮</div>
              <h2 className="text-lg font-light mb-2" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Write Your Wish
              </h2>
              <p className="text-xs mb-6" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                What do you hope for? What do you wish for someone else?
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I wish..."
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
                autoFocus
              />

              <p className="text-[10px] mb-3" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
                Choose a color
              </p>
              <div className="flex gap-2 justify-center mb-6">
                {LANTERN_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className="w-7 h-7 rounded-full cursor-pointer transition-transform"
                    style={{
                      background: c,
                      boxShadow: selectedColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : `${c}40 0 0 10px`,
                      transform: selectedColor === c ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWrite(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={releaseLantern}
                  disabled={!message.trim() || sending}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                    border: "none",
                    color: "white",
                    boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  {sending ? "Releasing..." : "Release"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read lantern modal */}
      <AnimatePresence>
        {selectedLantern && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5, 5, 16, 0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setSelectedLantern(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 rounded-2xl w-full max-w-sm text-center"
              style={{
                background: `radial-gradient(ellipse at center, ${selectedLantern.color}15 0%, rgba(10, 5, 25, 0.95) 70%)`,
                border: `1px solid ${selectedLantern.color}40`,
                boxShadow: `0 0 80px ${selectedLantern.color}20`,
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${selectedLantern.color}40, transparent)`,
                  boxShadow: `0 0 40px ${selectedLantern.color}30`,
                }}
              >
                <span className="text-2xl">🏮</span>
              </div>
              <p className="text-base leading-relaxed mb-4" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                &ldquo;{selectedLantern.message}&rdquo;
              </p>
              <p className="text-[10px]" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
                Click anywhere to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
