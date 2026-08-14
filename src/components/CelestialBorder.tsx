"use client";

import { useEffect, useState, useMemo } from "react";

export default function CelestialBorder() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        animationDelay: `${(i * 1.7) % 5}s`,
        animationDuration: `${2 + (i * 0.8) % 3}s`,
        width: `${1 + (i % 3)}px`,
        height: `${1 + (i % 3)}px`,
        opacity: 0.3 + (i % 5) * 0.08,
      })),
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${10 + (i * 47 + 23) % 80}%`,
        top: `${10 + (i * 61 + 11) % 80}%`,
        animationDelay: `${(i * 2.3) % 8}s`,
        animationDuration: `${6 + (i * 1.1) % 6}s`,
        width: `${2 + (i % 4)}px`,
        height: `${2 + (i % 4)}px`,
      })),
    []
  );

  if (!mounted) return null;

  return (
    <div className="celestial-border" aria-hidden="true">
      {/* Top left crescent moon */}
      <div className="celestial-border__moon celestial-border__moon--tl">
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M60 40c0-16.569-13.431-30-30-30 22.091 0 40 17.909 40 40s-17.909 40-40 40c16.569 0 30-13.431 30-30z"
            fill="url(#moonGradTL)"
            opacity="0.9"
          />
          <defs>
            <radialGradient id="moonGradTL" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="60%" stopColor="#00cc6a" />
              <stop offset="100%" stopColor="#1a5c2e" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Top right crescent moon */}
      <div className="celestial-border__moon celestial-border__moon--tr">
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M20 40c0-16.569 13.431-30 30-30-22.091 0-40 17.909-40 40s17.909 40 40 40c-16.569 0-30-13.431-30-30z"
            fill="url(#moonGradTR)"
            opacity="0.9"
          />
          <defs>
            <radialGradient id="moonGradTR" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="60%" stopColor="#00cc6a" />
              <stop offset="100%" stopColor="#1a5c2e" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Top centre crystal */}
      <div className="celestial-border__crystal-top">
        <svg viewBox="0 0 120 100" fill="none">
          <polygon
            points="60,5 75,35 60,55 45,35"
            fill="url(#crystalTop)"
            opacity="0.85"
          />
          <polygon points="60,5 75,35 60,25" fill="rgba(255,255,255,0.3)" />
          <line
            x1="60"
            y1="55"
            x2="60"
            y2="85"
            stroke="url(#crystalStem)"
            strokeWidth="2"
            opacity="0.6"
          />
          <circle cx="60" cy="90" r="4" fill="#00ff88" opacity="0.7" />
          <polygon
            points="25,30 35,50 25,60 15,50"
            fill="url(#crystalSideL)"
            opacity="0.5"
          />
          <polygon
            points="95,30 105,50 95,60 85,50"
            fill="url(#crystalSideR)"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="crystalTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#74de9a" />
              <stop offset="50%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#00cc6a" />
            </linearGradient>
            <linearGradient id="crystalStem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="crystalSideL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#74de9a" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
            <linearGradient id="crystalSideR" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#00cc6a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom centre lotus */}
      <div className="celestial-border__lotus">
        <svg viewBox="0 0 160 120" fill="none">
          <ellipse
            cx="80"
            cy="60"
            rx="15"
            ry="35"
            fill="url(#lotusCenter)"
            opacity="0.8"
          />
          <ellipse
            cx="80"
            cy="60"
            rx="14"
            ry="30"
            fill="url(#lotusL1)"
            opacity="0.7"
            transform="rotate(-30,80,60)"
          />
          <ellipse
            cx="80"
            cy="60"
            rx="12"
            ry="25"
            fill="url(#lotusL2)"
            opacity="0.6"
            transform="rotate(-55,80,60)"
          />
          <ellipse
            cx="80"
            cy="60"
            rx="14"
            ry="30"
            fill="url(#lotusR1)"
            opacity="0.7"
            transform="rotate(30,80,60)"
          />
          <ellipse
            cx="80"
            cy="60"
            rx="12"
            ry="25"
            fill="url(#lotusR2)"
            opacity="0.6"
            transform="rotate(55,80,60)"
          />
          <ellipse
            cx="80"
            cy="60"
            rx="10"
            ry="22"
            fill="url(#lotusOuterL)"
            opacity="0.45"
            transform="rotate(-75,80,60)"
          />
          <ellipse
            cx="80"
            cy="60"
            rx="10"
            ry="22"
            fill="url(#lotusOuterR)"
            opacity="0.45"
            transform="rotate(75,80,60)"
          />
          <circle cx="80" cy="58" r="8" fill="#00ff88" opacity="0.6" />
          <circle cx="80" cy="58" r="4" fill="#ffffff" opacity="0.4" />
          <defs>
            <linearGradient id="lotusCenter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#74de9a" />
            </linearGradient>
            <linearGradient id="lotusL1" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00cc6a" />
              <stop offset="100%" stopColor="#74de9a" />
            </linearGradient>
            <linearGradient id="lotusL2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#57ff14" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
            <linearGradient id="lotusR1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#00cc6a" />
            </linearGradient>
            <linearGradient id="lotusR2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#74de9a" />
              <stop offset="100%" stopColor="#1a5c2e" />
            </linearGradient>
            <linearGradient id="lotusOuterL" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <linearGradient id="lotusOuterR" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#57ff14" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Left side filigree vines */}
      <div className="celestial-border__filigree celestial-border__filigree--left">
        <svg viewBox="0 0 60 800" fill="none" preserveAspectRatio="none">
          <path
            d="M30,0 Q45,100 20,200 Q-5,300 35,400 Q55,450 25,550 Q5,650 40,750 Q50,780 30,800"
            stroke="url(#vineL)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M25,50 Q40,120 15,180 Q0,220 30,300 Q50,350 20,450 Q10,520 35,600 Q45,660 25,720"
            stroke="url(#vineL2)"
            strokeWidth="1"
            fill="none"
            opacity="0.35"
          />
          <polygon points="30,150 37,170 30,180 23,170" fill="#00ff88" opacity="0.5" />
          <polygon points="20,350 27,365 20,375 13,365" fill="#00cc6a" opacity="0.5" />
          <polygon points="35,550 42,565 35,575 28,565" fill="#57ff14" opacity="0.5" />
          <circle cx="15" cy="100" r="1.5" fill="#00ff88" opacity="0.6" />
          <circle cx="40" cy="250" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="10" cy="450" r="1.5" fill="#74de9a" opacity="0.5" />
          <circle cx="45" cy="650" r="1" fill="#00cc6a" opacity="0.6" />
          <defs>
            <linearGradient id="vineL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="50%" stopColor="#00cc6a" />
              <stop offset="100%" stopColor="#57ff14" />
            </linearGradient>
            <linearGradient id="vineL2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#74de9a" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Right side filigree vines */}
      <div className="celestial-border__filigree celestial-border__filigree--right">
        <svg viewBox="0 0 60 800" fill="none" preserveAspectRatio="none">
          <path
            d="M30,0 Q15,100 40,200 Q65,300 25,400 Q5,450 35,550 Q55,650 20,750 Q10,780 30,800"
            stroke="url(#vineR)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M35,50 Q20,120 45,180 Q60,220 30,300 Q10,350 40,450 Q50,520 25,600 Q15,660 35,720"
            stroke="url(#vineR2)"
            strokeWidth="1"
            fill="none"
            opacity="0.35"
          />
          <polygon points="30,150 37,170 30,180 23,170" fill="#00ff88" opacity="0.5" />
          <polygon points="40,350 47,365 40,375 33,365" fill="#74de9a" opacity="0.5" />
          <polygon points="25,550 32,565 25,575 18,565" fill="#00cc6a" opacity="0.5" />
          <circle cx="45" cy="100" r="1.5" fill="#00ff88" opacity="0.6" />
          <circle cx="20" cy="250" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="50" cy="450" r="1.5" fill="#57ff14" opacity="0.5" />
          <circle cx="15" cy="650" r="1" fill="#00cc6a" opacity="0.6" />
          <defs>
            <linearGradient id="vineR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="50%" stopColor="#74de9a" />
              <stop offset="100%" stopColor="#57ff14" />
            </linearGradient>
            <linearGradient id="vineR2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#00cc6a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Edge gradients */}
      <div className="celestial-border__edge celestial-border__edge--top" />
      <div className="celestial-border__edge celestial-border__edge--bottom" />
      <div className="celestial-border__edge celestial-border__edge--left" />
      <div className="celestial-border__edge celestial-border__edge--right" />

      {/* Corner jewels */}
      <div className="celestial-border__jewel celestial-border__jewel--tl" />
      <div className="celestial-border__jewel celestial-border__jewel--tr" />
      <div className="celestial-border__jewel celestial-border__jewel--bl" />
      <div className="celestial-border__jewel celestial-border__jewel--br" />

      {/* Scattered stars */}
      <div className="celestial-border__stars">
        {stars.map((star) => (
          <div
            key={star.id}
            className="celestial-border__star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
              width: star.width,
              height: star.height,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="celestial-border__particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="celestial-border__particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
              width: p.width,
              height: p.height,
            }}
          />
        ))}
      </div>
    </div>
  );
}
