"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { NERA_TYPES, NERA_EMOTIONS } from "@/lib/nera/constants";
import type { Nera, NeraType, NeraEmotion } from "@/lib/nera/types";

interface NeraCreatorProps {
  onSubmit: (nera: Nera) => void;
  onCancel: () => void;
}

export default function NeraCreator({ onSubmit, onCancel }: NeraCreatorProps) {
  const { userId } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [neraType, setNeraType] = useState<NeraType>("quiet_coffee");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emotionTags, setEmotionTags] = useState<NeraEmotion[]>([]);
  const [locationName, setLocationName] = useState("");
  const [city, setCity] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [isOnline, setIsOnline] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  function toggleEmotion(e: NeraEmotion) {
    setEmotionTags((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocating(false); },
      () => { setLocating(false); }
    );
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return title.trim().length >= 3;
      case 1: return dateTime !== "" && (isOnline || city.trim().length >= 2);
      case 2: return true;
      default: return false;
    }
  }

  async function handleSubmit() {
    if (!userId || submitting) return;
    setSubmitting(true);
    const client = supabase();

    const neraData = {
      host_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      nera_type: neraType,
      emotion_tags: emotionTags,
      location_name: locationName.trim() || null,
      city: isOnline ? null : city.trim() || null,
      approximate_location: locationName.trim() || null,
      is_online: isOnline,
      is_public: isPublic,
      date_time: new Date(dateTime).toISOString(),
      max_participants: maxParticipants,
      current_participants: 1,
      lat: lat,
      lng: lng,
    };

    const { data, error } = await client.from("neras").insert(neraData).select().single();
    if (!error && data) {
      await client.from("nera_attendees").insert({ nera_id: data.id, user_id: userId, status: "joined" });
      onSubmit(data);
    }
    setSubmitting(false);
  }

  const steps = [
    { label: "What", icon: "01" },
    { label: "When & Where", icon: "02" },
    { label: "Details", icon: "03" },
  ];

  const inputStyle: React.CSSProperties = {
    background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
    border: "1px solid rgba(13, 148, 136, 0.1)",
    color: "var(--text-primary, #0f172a)",
    outline: "none",
    fontSize: "14px",
    borderRadius: "14px",
    backdropFilter: "blur(8px)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        <motion.div
          className="max-w-lg mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Back */}
          <motion.button
            onClick={onCancel}
            className="mb-8 inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--text-dim, #94a3b8)" }}
            whileHover={{ color: "#0d9488" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </motion.button>

          {/* Header */}
          <h2
            className="text-2xl sm:text-3xl mb-2"
            style={{ fontWeight: 300, color: "var(--text-primary, #0f172a)", fontFamily: "var(--font-heading)" }}
          >
            Start a Nera
          </h2>
          <p className="text-[13px] mb-8" style={{ color: "var(--text-muted, #64748b)" }}>
            Create a space for connection.
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex-1 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all"
                    style={{
                      background: i <= step ? "rgba(13, 148, 136, 0.1)" : "rgba(13, 148, 136, 0.03)",
                      color: i <= step ? "#0d9488" : "var(--text-dim, #94a3b8)",
                      border: `1px solid ${i <= step ? "rgba(13, 148, 136, 0.2)" : "rgba(13, 148, 136, 0.06)"}`,
                    }}
                  >
                    {i < step ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : s.icon}
                  </div>
                  <span className="text-[12px] font-medium hidden sm:block" style={{ color: i <= step ? "var(--text-primary, #0f172a)" : "var(--text-dim, #94a3b8)" }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: i < step ? "rgba(13, 148, 136, 0.2)" : "rgba(13, 148, 136, 0.06)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: What */}
          {step === 0 && (
            <motion.div className="space-y-5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div>
                <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {NERA_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNeraType(t.id)}
                      className="py-3 rounded-2xl text-[11px] flex flex-col items-center gap-1.5 transition-all"
                      style={{
                        background: neraType === t.id ? `${t.color}0D` : "var(--card-bg, rgba(13, 148, 136, 0.03))",
                        border: `1px solid ${neraType === t.id ? `${t.color}25` : "rgba(13, 148, 136, 0.06)"}`,
                        color: neraType === t.id ? t.color : "var(--text-muted, #64748b)",
                      }}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span className="leading-tight text-center px-1">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quiet coffee in the park"
                  maxLength={100}
                  className="w-full px-4 py-3.5"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(13, 148, 136, 0.08)"; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you looking for?"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3.5 resize-none"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(13, 148, 136, 0.08)"; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {NERA_EMOTIONS.map((e) => {
                    const selected = emotionTags.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        onClick={() => toggleEmotion(e.id)}
                        className="px-3.5 py-2 rounded-full text-[11px] font-medium transition-all"
                        style={{
                          background: selected ? `${e.color}10` : "var(--card-bg, rgba(13, 148, 136, 0.03))",
                          border: `1px solid ${selected ? `${e.color}22` : "rgba(13, 148, 136, 0.06)"}`,
                          color: selected ? e.color : "var(--text-muted, #64748b)",
                        }}
                      >
                        {e.icon} {e.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: When & Where */}
          {step === 1 && (
            <motion.div className="space-y-5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div>
                <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>Date & Time</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-4 py-3.5"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(13, 148, 136, 0.08)"; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              {/* Online toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "var(--card-bg, rgba(13, 148, 136, 0.03))", border: "1px solid rgba(13, 148, 136, 0.06)" }}
              >
                <div>
                  <div className="text-[13px] font-medium" style={{ color: "var(--text-primary, #0f172a)" }}>Online only</div>
                  <div className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>No physical location needed</div>
                </div>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className="relative w-12 h-7 rounded-full transition-all"
                  style={{ background: isOnline ? "#0d9488" : "rgba(13, 148, 136, 0.15)" }}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", transform: isOnline ? "translateX(24px)" : "translateX(4px)" }}
                  />
                </button>
              </div>

              {!isOnline && (
                <>
                  <div>
                    <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. London, New York"
                      className="w-full px-4 py-3.5"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(13, 148, 136, 0.08)"; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>Location name (optional)</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Central Park, The Coffee House"
                      className="w-full px-4 py-3.5"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(13, 148, 136, 0.08)"; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--text-dim, #94a3b8)" }}>
                      Never share your exact home address. Use a public meeting spot.
                    </p>
                  </div>

                  {/* Pin location */}
                  <div
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: "var(--card-bg, rgba(13, 148, 136, 0.03))", border: "1px solid rgba(13, 148, 136, 0.06)" }}
                  >
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: "var(--text-primary, #0f172a)" }}>
                        {lat != null ? "Location pinned" : "Pin location on map"}
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                        {lat != null ? `${lat.toFixed(4)}, ${lng!.toFixed(4)}` : "So others can find you on the map"}
                      </div>
                    </div>
                    <button
                      onClick={useMyLocation}
                      disabled={locating}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all"
                      style={{
                        background: lat != null ? "rgba(13, 148, 136, 0.08)" : "rgba(13, 148, 136, 0.04)",
                        border: `1px solid ${lat != null ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.08)"}`,
                        color: lat != null ? "#0d9488" : "var(--text-muted, #64748b)",
                      }}
                    >
                      {locating ? "Locating..." : lat != null ? "Update" : "Use my location"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div className="space-y-5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div>
                <label className="text-[12px] font-medium mb-2 block" style={{ color: "var(--text-muted, #64748b)" }}>Max people</label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#0d9488" }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>2</span>
                  <span className="text-[13px] font-medium" style={{ color: "#0d9488" }}>{maxParticipants} people</span>
                  <span className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>20</span>
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "var(--card-bg, rgba(13, 148, 136, 0.03))", border: "1px solid rgba(13, 148, 136, 0.06)" }}
              >
                <div>
                  <div className="text-[13px] font-medium" style={{ color: "var(--text-primary, #0f172a)" }}>Public Nera</div>
                  <div className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                    {isPublic ? "Anyone can see and join" : "Request to join only"}
                  </div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className="relative w-12 h-7 rounded-full transition-all"
                  style={{ background: isPublic ? "#0d9488" : "rgba(13, 148, 136, 0.15)" }}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", transform: isPublic ? "translateX(24px)" : "translateX(4px)" }}
                  />
                </button>
              </div>

              {/* Summary */}
              <div className="p-5 rounded-2xl" style={{ background: "rgba(13, 148, 136, 0.03)", border: "1px solid rgba(13, 148, 136, 0.08)" }}>
                <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgba(13, 148, 136, 0.5)" }}>Summary</p>
                <p className="text-[15px] font-medium mb-1" style={{ color: "var(--text-primary, #0f172a)", fontFamily: "var(--font-heading)" }}>{title}</p>
                <p className="text-[12px]" style={{ color: "var(--text-muted, #64748b)" }}>
                  {NERA_TYPES.find((t) => t.id === neraType)?.icon}{" "}
                  {isOnline ? "Online" : city || "Location TBD"}
                  {locationName ? ` at ${locationName}` : ""} &middot; Up to {maxParticipants} people
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3.5 rounded-2xl text-[13px] font-medium"
                style={{ background: "var(--card-bg, rgba(13, 148, 136, 0.03))", border: "1px solid rgba(13, 148, 136, 0.08)", color: "var(--text-muted, #64748b)" }}
              >
                Back
              </button>
            )}
            <button
              onClick={step < 2 ? () => setStep(step + 1) : handleSubmit}
              disabled={!canProceed() || submitting}
              className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium transition-all"
              style={{
                background: canProceed() ? "linear-gradient(135deg, #0d9488, #0891b2)" : "rgba(13, 148, 136, 0.04)",
                border: `1px solid ${canProceed() ? "rgba(13, 148, 136, 0.2)" : "rgba(13, 148, 136, 0.06)"}`,
                color: canProceed() ? "#ffffff" : "var(--text-dim, #94a3b8)",
                boxShadow: canProceed() ? "0 4px 16px rgba(13, 148, 136, 0.2)" : "none",
              }}
            >
              {submitting ? "Creating..." : step < 2 ? "Continue" : "Create Nera"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
