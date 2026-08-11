"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import {
  EmotionCheckin,
  EmotionId,
  EmotionStat,
  calculateStats,
  calculateMetrics,
} from "./emotions";
import AtmosphereBackground from "./AtmosphereBackground";
import LocationTabs, { LocationMode } from "./LocationTabs";
import WeatherHero from "./WeatherHero";
import EmotionBreakdown from "./EmotionBreakdown";
import EmotionReporter from "./EmotionReporter";
import HourlyForecast from "./HourlyForecast";
import WeeklyForecast from "./WeeklyForecast";
import WeatherMetrics from "./WeatherMetrics";

const MIN_PARTICIPATION = 5;

export default function HumanWeather() {
  const { userId } = useAuth();
  const [locationMode, setLocationMode] = useState<LocationMode>("world");
  const [checkins, setCheckins] = useState<EmotionCheckin[]>([]);
  const [myCheckins, setMyCheckins] = useState<EmotionCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentCheckin, setRecentCheckin] = useState(false);
  const [countryName, setCountryName] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    const client = supabase();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    let query = client
      .from("emotion_checkins")
      .select("*")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });

    if (locationMode === "country" && countryCode) {
      query = query.eq("country_code", countryCode);
    }

    const { data } = await query;
    setCheckins(data || []);

    if (userId) {
      const { data: myData } = await client
        .from("emotion_checkins")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      setMyCheckins(myData || []);

      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const { data: recent } = await client
        .from("emotion_checkins")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", oneHourAgo)
        .limit(1);
      setRecentCheckin(!!recent && recent.length > 0);
    }

    setLoading(false);
  }, [locationMode, countryCode, userId]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code) {
          setCountryCode(data.country_code);
          setCountryName(data.country_name || "");
        }
      } catch {
        // silently fail
      }
    }
    detectCountry();
  }, []);

  async function handleSubmit(emotion: EmotionId) {
    const client = supabase();
    const { data: { session } } = await client.auth.getSession();

    const checkinData: Record<string, unknown> = {
      emotion,
      country_code: countryCode || null,
      region: null,
    };

    if (session?.user) {
      checkinData.user_id = session.user.id;
    }

    await client.from("emotion_checkins").insert(checkinData);

    if (session?.user) {
      await client.from("emotion_rate_limits").upsert(
        { user_id: session.user.id, last_checkin_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }

    setRecentCheckin(true);
    await fetchCheckins();
  }

  const stats = calculateStats(checkins);
  const myStats = calculateStats(myCheckins);
  const metrics = calculateMetrics(stats);
  const hasEnoughData = checkins.length >= MIN_PARTICIPATION;

  const hourlyData = buildHourlyData(checkins);
  const weeklyData = buildWeeklyData(locationMode === "mine" ? myCheckins : checkins);

  const locationLabel = getLocationLabel(locationMode, countryName);

  return (
    <>
      <AtmosphereBackground stats={locationMode === "mine" ? myStats : stats} />

      <div className="relative z-10 min-h-screen pb-24">
        {/* Header */}
        <div className="pt-24 sm:pt-32 px-4 sm:px-6">
          <div className="max-w-lg mx-auto text-center mb-8">
            <motion.h1
              className="text-3xl sm:text-4xl mb-2"
              style={{
                fontWeight: 200,
                letterSpacing: "0.04em",
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Human Weather
            </motion.h1>
            <motion.p
              className="text-sm"
              style={{ color: "var(--text-muted)", fontWeight: 300, fontStyle: "italic" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              The weather inside us.
            </motion.p>
          </div>

          <div className="max-w-lg mx-auto">
            {/* Location tabs */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LocationTabs
                active={locationMode}
                onChange={setLocationMode}
                countryName={countryName}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-4xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🌤️
                  </motion.div>
                  <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                    Reading the atmosphere...
                  </p>
                </motion.div>
              ) : locationMode === "mine" ? (
                <motion.div
                  key="mine"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WeatherHero stats={myStats} locationLabel="My Weather" />
                  {myStats.length > 0 ? (
                    <>
                      <div className="mb-8">
                        <EmotionBreakdown stats={myStats} />
                      </div>
                      <HourlyForecast hourlyData={buildHourlyData(myCheckins)} />
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        You haven&apos;t reported your weather yet.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : !hasEnoughData ? (
                <motion.div
                  key="empty"
                  className="text-center py-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="text-5xl mb-6">🌤️</div>
                  <h2
                    className="text-xl mb-3"
                    style={{ fontWeight: 300, color: "var(--text-secondary)" }}
                  >
                    Not enough human weather data yet.
                  </h2>
                  <p className="text-sm mb-8" style={{ color: "var(--text-dim)" }}>
                    Be the first to report how you feel.
                  </p>
                  <EmotionReporter onSubmit={handleSubmit} recentCheckin={recentCheckin} />
                </motion.div>
              ) : (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WeatherHero stats={stats} locationLabel={locationLabel} />

                  <EmotionReporter onSubmit={handleSubmit} recentCheckin={recentCheckin} />

                  {/* Breakdown */}
                  <motion.div
                    className="mb-10 p-5 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(13, 148, 136, 0.06)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <EmotionBreakdown stats={stats} />
                    <p className="text-[10px] mt-3 text-center" style={{ color: "var(--text-faint)" }}>
                      Based on {checkins.length} check-in{checkins.length !== 1 ? "s" : ""} in the last 24 hours
                    </p>
                  </motion.div>

                  {/* Hourly */}
                  <motion.div
                    className="mb-10 p-5 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(13, 148, 136, 0.06)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <HourlyForecast hourlyData={hourlyData} />
                  </motion.div>

                  {/* Weekly */}
                  <motion.div
                    className="mb-10 p-5 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(13, 148, 136, 0.06)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <WeeklyForecast weeklyData={weeklyData} />
                  </motion.div>

                  {/* Metrics */}
                  <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <WeatherMetrics {...metrics} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

function getLocationLabel(mode: LocationMode, countryName: string): string {
  switch (mode) {
    case "world": return "🌍 World";
    case "country": return `🌐 ${countryName || "Country"}`;
    case "nearby": return "📍 Nearby";
    case "mine": return "🫀 My Weather";
  }
}

function buildHourlyData(checkins: EmotionCheckin[]): { hour: string; stats: EmotionStat[] }[] {
  const now = new Date();
  const hours: { hour: string; stats: EmotionStat[] }[] = [];

  for (let i = 0; i < 8; i++) {
    const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourStart = new Date(hourDate);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const hourCheckins = checkins.filter(c => {
      const t = new Date(c.created_at);
      return t >= hourStart && t < hourEnd;
    });

    const label = i === 0 ? "NOW" : hourDate.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    hours.push({ hour: label, stats: calculateStats(hourCheckins) });
  }

  return hours;
}

function buildWeeklyData(checkins: EmotionCheckin[]): { day: string; stats: EmotionStat[] }[] {
  const now = new Date();
  const days: { day: string; stats: EmotionStat[] }[] = [];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - i);
    dayDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(dayDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayCheckins = checkins.filter(c => {
      const t = new Date(c.created_at);
      return t >= dayDate && t < nextDay;
    });

    days.push({
      day: dayNames[dayDate.getDay()],
      stats: calculateStats(dayCheckins),
    });
  }

  return days;
}
