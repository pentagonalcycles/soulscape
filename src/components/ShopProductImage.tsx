"use client";

import { motion } from "framer-motion";

interface ShopProductImageProps {
  category: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const categoryColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  journals: { primary: "#0d9488", secondary: "#06b6d4", accent: "#10b981" },
  wallpapers: { primary: "#6b3fa0", secondary: "#0d9488", accent: "#06b6d4" },
  soundscapes: { primary: "#0d9488", secondary: "#10b981", accent: "#06b6d4" },
  profiles: { primary: "#06b6d4", secondary: "#0d9488", accent: "#10b981" },
  membership: { primary: "#10b981", secondary: "#0d9488", accent: "#06b6d4" },
  gifts: { primary: "#06b6d4", secondary: "#10b981", accent: "#0d9488" },
  support: { primary: "#0d9488", secondary: "#06b6d4", accent: "#10b981" },
};

function JournalVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="j-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="j-cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="70" r="60" fill="url(#j-glow)" />
      <rect x="60" y="35" width="80" height="70" rx="4" fill="url(#j-cover)" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="100" y1="35" x2="100" y2="105" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.3" />
      <rect x="65" y="40" width="30" height="60" rx="2" fill="rgba(232,224,240,0.08)" />
      <rect x="105" y="40" width="30" height="60" rx="2" fill="rgba(232,224,240,0.08)" />
      {[50, 58, 66, 74, 82, 90].map((y) => (
        <line key={y} x1="70" y1={y} x2="90" y2={y} stroke={colors.primary} strokeWidth="0.5" strokeOpacity="0.3" />
      ))}
      {[
        { cx: 45, cy: 30 }, { cx: 155, cy: 25 }, { cx: 40, cy: 110 },
        { cx: 160, cy: 105 }, { cx: 100, cy: 20 }, { cx: 55, cy: 65 }, { cx: 148, cy: 70 },
      ].map((p, i) => (
        <motion.circle
          key={i} cx={p.cx} cy={p.cy} r={1 + (i % 3) * 0.4}
          fill={i % 2 === 0 ? colors.accent : colors.secondary}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function WallpaperVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="wp-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wp-nebula" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="65" r="55" fill="url(#wp-glow)" />
      <rect x="72" y="15" width="56" height="100" rx="8" fill="rgba(5,5,16,0.7)" stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.4" />
      <rect x="76" y="22" width="48" height="82" rx="4" fill="url(#wp-nebula)" />
      {[
        { cx: 85, cy: 35 }, { cx: 100, cy: 28 }, { cx: 112, cy: 42 }, { cx: 90, cy: 55 },
        { cx: 108, cy: 65 }, { cx: 82, cy: 78 }, { cx: 115, cy: 85 }, { cx: 95, cy: 92 },
      ].map((s, i) => (
        <motion.circle
          key={i} cx={s.cx} cy={s.cy} r={0.6 + (i % 3) * 0.3}
          fill={i % 3 === 0 ? colors.accent : i % 3 === 1 ? "#fff" : colors.secondary}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
      <rect x="93" y="17" width="14" height="3" rx="1.5" fill={colors.primary} fillOpacity="0.2" />
    </svg>
  );
}

function SoundscapeVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="70" r="55" fill="url(#ss-glow)" />
      {[35, 45, 55, 65].map((r, i) => (
        <motion.circle
          key={i} cx="100" cy="70" r={r} fill="none"
          stroke={i % 2 === 0 ? colors.primary : colors.secondary}
          strokeWidth="0.8" strokeOpacity={0.3 - i * 0.05}
          strokeDasharray={`${8 + i * 4} ${12 + i * 3}`}
          initial={{ rotate: 0 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 70px" }}
        />
      ))}
      <circle cx="100" cy="70" r="12" fill={colors.primary} fillOpacity="0.15" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="100" cy="70" r="4" fill={colors.accent} fillOpacity="0.5" />
      {[
        { r: 30, speed: 8, size: 2, color: colors.accent },
        { r: 42, speed: 12, size: 1.5, color: colors.secondary },
        { r: 52, speed: 15, size: 1, color: "#fff" },
        { r: 35, speed: 10, size: 1.8, color: colors.primary },
      ].map((p, i) => (
        <motion.circle
          key={`p-${i}`} cx="100" cy="70" r={p.size} fill={p.color} fillOpacity="0.7"
          initial={{ cx: 100 + p.r, cy: 70 }}
          animate={{ cx: [100 + p.r, 100, 100 - p.r, 100, 100 + p.r], cy: [70, 70 - p.r, 70, 70 + p.r, 70] }}
          transition={{ duration: p.speed, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </svg>
  );
}

function ProfileVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="pf-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pf-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="60" r="55" fill="url(#pf-glow)" />
      {/* Profile card */}
      <rect x="50" y="20" width="100" height="100" rx="12" fill="rgba(10,10,46,0.6)" stroke="url(#pf-border)" strokeWidth="1.5" />
      {/* Avatar circle */}
      <circle cx="100" cy="55" r="18" fill="rgba(157,124,216,0.15)" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="100" cy="55" r="6" fill={colors.primary} fillOpacity="0.3" />
      {/* Aura rings */}
      <motion.circle cx="100" cy="55" r="22" fill="none" stroke={colors.primary} strokeWidth="0.5" strokeOpacity="0.3"
        initial={{ scale: 1, opacity: 0.3 }} animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx="100" cy="55" r="26" fill="none" stroke={colors.secondary} strokeWidth="0.5" strokeOpacity="0.2"
        initial={{ scale: 1, opacity: 0.2 }} animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Name line */}
      <rect x="75" y="82" width="50" height="4" rx="2" fill={colors.primary} fillOpacity="0.2" />
      {/* Bio lines */}
      <rect x="65" y="92" width="70" height="2.5" rx="1" fill={colors.primary} fillOpacity="0.1" />
      <rect x="72" y="98" width="56" height="2.5" rx="1" fill={colors.primary} fillOpacity="0.08" />
      {/* Stars */}
      {[
        { cx: 55, cy: 30, r: 1 }, { cx: 145, cy: 28, r: 0.8 }, { cx: 50, cy: 110, r: 1.2 },
        { cx: 150, cy: 108, r: 0.9 },
      ].map((s, i) => (
        <motion.circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={colors.accent} fillOpacity="0.5"
          initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function MembershipVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="mem-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="70" r="60" fill="url(#mem-glow)" />
      {/* Shield / badge shape */}
      <path d="M100 25 L130 40 L130 75 Q130 95 100 110 Q70 95 70 75 L70 40 Z"
        fill="url(#mem-grad)" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.5" />
      {/* Inner star */}
      <motion.polygon
        points="100,42 107,58 125,58 111,68 116,84 100,74 84,84 89,68 75,58 93,58"
        fill={colors.accent} fillOpacity="0.4" stroke={colors.accent} strokeWidth="0.8" strokeOpacity="0.5"
        initial={{ rotate: 0 }} animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 63px" }}
      />
      {/* Sparkles */}
      {[
        { cx: 55, cy: 35 }, { cx: 145, cy: 30 }, { cx: 45, cy: 105 }, { cx: 155, cy: 100 },
        { cx: 100, cy: 15 }, { cx: 100, cy: 125 },
      ].map((p, i) => (
        <motion.g key={i}>
          <motion.circle cx={p.cx} cy={p.cy} r={1 + (i % 2) * 0.5} fill={i % 2 === 0 ? colors.accent : colors.secondary}
            initial={{ opacity: 0.2 }} animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line x1={p.cx - 2.5} y1={p.cy} x2={p.cx + 2.5} y2={p.cy} stroke={i % 2 === 0 ? colors.accent : colors.secondary} strokeWidth="0.4"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line x1={p.cx} y1={p.cy - 2.5} x2={p.cx} y2={p.cy + 2.5} stroke={i % 2 === 0 ? colors.accent : colors.secondary} strokeWidth="0.4"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

function GiftVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gift-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="70" r="55" fill="url(#gift-glow)" />
      {/* Gift box */}
      <rect x="60" y="55" width="80" height="55" rx="4" fill="rgba(157,124,216,0.15)" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.4" />
      {/* Lid */}
      <rect x="55" y="45" width="90" height="15" rx="3" fill="rgba(157,124,216,0.2)" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.4" />
      {/* Ribbon vertical */}
      <rect x="95" y="45" width="10" height="65" fill={colors.accent} fillOpacity="0.2" />
      {/* Ribbon horizontal */}
      <rect x="55" y="48" width="90" height="8" fill={colors.accent} fillOpacity="0.15" />
      {/* Bow */}
      <ellipse cx="92" cy="42" rx="10" ry="6" fill="none" stroke={colors.accent} strokeWidth="1" strokeOpacity="0.5" />
      <ellipse cx="108" cy="42" rx="10" ry="6" fill="none" stroke={colors.accent} strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="100" cy="42" r="3" fill={colors.accent} fillOpacity="0.4" />
      {/* Sparkles */}
      {[
        { cx: 50, cy: 35 }, { cx: 150, cy: 30 }, { cx: 45, cy: 110 }, { cx: 155, cy: 105 },
        { cx: 100, cy: 20 },
      ].map((p, i) => (
        <motion.circle key={i} cx={p.cx} cy={p.cy} r={1 + (i % 2) * 0.5}
          fill={i % 2 === 0 ? colors.accent : colors.secondary} fillOpacity="0.5"
          initial={{ opacity: 0.2, scale: 0.5 }} animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
    </svg>
  );
}

function SupportVisual({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="sup-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="70" r="55" fill="url(#sup-glow)" />
      {/* Heart shape */}
      <motion.path
        d="M100 105 Q60 80 40 60 Q20 40 40 25 Q60 10 80 25 Q90 35 100 50 Q110 35 120 25 Q140 10 160 25 Q180 40 160 60 Q140 80 100 105Z"
        fill={colors.primary} fillOpacity="0.15" stroke={colors.primary} strokeWidth="1.2" strokeOpacity="0.4"
        initial={{ scale: 1 }} animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 60px" }}
      />
      {/* Glow inside heart */}
      <circle cx="100" cy="55" r="15" fill={colors.primary} fillOpacity="0.08" />
      {/* Stars around */}
      {[
        { cx: 50, cy: 35 }, { cx: 150, cy: 30 }, { cx: 45, cy: 105 }, { cx: 155, cy: 100 },
        { cx: 100, cy: 15 }, { cx: 100, cy: 125 }, { cx: 30, cy: 70 }, { cx: 170, cy: 70 },
      ].map((p, i) => (
        <motion.circle key={i} cx={p.cx} cy={p.cy} r={0.8 + (i % 3) * 0.4}
          fill={i % 3 === 0 ? colors.accent : i % 3 === 1 ? colors.secondary : "#fff"} fillOpacity="0.5"
          initial={{ opacity: 0.2 }} animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </svg>
  );
}

const visualMap: Record<string, React.FC<{ colors: { primary: string; secondary: string; accent: string } }>> = {
  journals: JournalVisual,
  wallpapers: WallpaperVisual,
  soundscapes: SoundscapeVisual,
  profiles: ProfileVisual,
  membership: MembershipVisual,
  gifts: GiftVisual,
  support: SupportVisual,
};

const sizeClasses = {
  sm: "w-full aspect-[16/10]",
  md: "w-full aspect-[16/10]",
  lg: "w-full aspect-square max-w-[360px]",
};

export default function ShopProductImage({ category, size = "md", className = "" }: ShopProductImageProps) {
  const colors = categoryColors[category] || categoryColors.journals;
  const Visual = visualMap[category] || JournalVisual;

  return (
    <div className={`shop-product-image-container relative overflow-hidden rounded-xl ${sizeClasses[size]} ${className}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${colors.primary}15 0%, transparent 70%)` }}
      />
      <Visual colors={colors} />
    </div>
  );
}
