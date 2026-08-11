"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { INTERESTS, GENDERS, INTERESTED_IN, DATING_INTENTIONS } from "@/lib/unseen/constants";
import type { UnseenQuestion } from "@/lib/unseen/types";

interface UnseenProfileCreatorProps {
  onComplete: () => void;
  onBack: () => void;
}

type Step = "basics" | "interests" | "questions" | "photos" | "bio";

export default function UnseenProfileCreator({ onComplete, onBack }: UnseenProfileCreatorProps) {
  const { userId } = useAuth();
  const [step, setStep] = useState<Step>("basics");
  const [saving, setSaving] = useState(false);

  // Profile data
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [interestedIn, setInterestedIn] = useState("");
  const [location, setLocation] = useState("");
  const [intention, setIntention] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [questions, setQuestions] = useState<UnseenQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      const client = supabase();
      const { data } = await client
        .from("unseen_questions")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) setQuestions(data);
    }
    loadQuestions();
  }, []);

  const steps: { key: Step; label: string }[] = [
    { key: "basics", label: "About You" },
    { key: "interests", label: "Interests" },
    { key: "questions", label: "Personality" },
    { key: "photos", label: "Photos" },
    { key: "bio", label: "Bio" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  }

  function canProceed(): boolean {
    switch (step) {
      case "basics":
        return !!(displayName && age && parseInt(age) >= 18 && gender && interestedIn && intention);
      case "interests":
        return selectedInterests.length >= 3;
      case "questions":
        return Object.keys(answers).length >= 3;
      case "photos":
        return photos.length >= 1;
      case "bio":
        return true; // bio is optional
    }
  }

  function handleNext() {
    if (!canProceed()) return;
    const order: Step[] = ["basics", "interests", "questions", "photos", "bio"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) {
      setStep(order[idx + 1]);
    }
  }

  async function handleComplete() {
    if (!userId || saving) return;
    setSaving(true);

    const client = supabase();

    // Create profile
    const { error: profileError } = await client.from("unseen_profiles").insert({
      user_id: userId,
      display_name: displayName,
      age: parseInt(age),
      gender,
      interested_in: interestedIn,
      broad_location: location || null,
      dating_intention: intention,
      bio: bio || null,
      is_verified_18: true,
      is_active: true,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      setSaving(false);
      return;
    }

    // Save interests
    if (selectedInterests.length > 0) {
      await client.from("unseen_interests").insert(
        selectedInterests.map(interest => ({ user_id: userId, interest }))
      );
    }

    // Save answers
    const answerEntries = Object.entries(answers).filter(([_, text]) => text.trim());
    if (answerEntries.length > 0) {
      await client.from("unseen_answers").insert(
        answerEntries.map(([questionId, text]) => ({
          user_id: userId,
          question_id: questionId,
          answer_text: text.trim(),
        }))
      );
    }

    // Upload photos
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from("unseen-photos")
        .upload(fileName, file, { cacheControl: "3600" });

      if (!uploadError) {
        await client.from("unseen_photos").insert({
          user_id: userId,
          storage_path: fileName,
          is_primary: i === 0,
          display_order: i,
        });
      }
    }

    // Create default preferences
    await client.from("unseen_preferences").upsert({
      user_id: userId,
      age_min: 18,
      age_max: 99,
      distance_preference: "anywhere",
      show_me: "everyone",
    }, { onConflict: "user_id" });

    setSaving(false);
    onComplete();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="mb-6 text-xs tracking-wide"
          style={{ color: "rgba(148, 163, 184, 0.5)" }}
        >
          ← Back
        </button>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: i <= currentStepIndex
                  ? "rgba(139, 92, 246, 0.5)"
                  : "rgba(255, 255, 255, 0.06)",
              }}
            />
          ))}
        </div>

        <h2
          className="text-xl sm:text-2xl mb-6"
          style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)" }}
        >
          {steps[currentStepIndex].label}
        </h2>

        <AnimatePresence mode="wait">
          {/* Step: Basics */}
          {step === "basics" && (
            <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(148, 163, 184, 0.6)" }}>Display name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={30} placeholder="What should we call you?"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(148, 163, 184, 0.6)" }}>Age</label>
                <input value={age} onChange={e => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Must be 18+" type="number" min={18}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(148, 163, 184, 0.6)" }}>Gender</label>
                <div className="flex gap-2 flex-wrap">
                  {GENDERS.map(g => (
                    <button key={g.value} onClick={() => setGender(g.value)}
                      className="px-4 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: gender === g.value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${gender === g.value ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                        color: gender === g.value ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.6)",
                      }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(148, 163, 184, 0.6)" }}>Interested in</label>
                <div className="flex gap-2 flex-wrap">
                  {INTERESTED_IN.map(g => (
                    <button key={g.value} onClick={() => setInterestedIn(g.value)}
                      className="px-4 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: interestedIn === g.value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${interestedIn === g.value ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                        color: interestedIn === g.value ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.6)",
                      }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(148, 163, 184, 0.6)" }}>Broad location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. London, New York"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(148, 163, 184, 0.6)" }}>What are you looking for?</label>
                <div className="space-y-2">
                  {DATING_INTENTIONS.map(d => (
                    <button key={d.value} onClick={() => setIntention(d.value)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-left transition-all"
                      style={{
                        background: intention === d.value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${intention === d.value ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                        color: intention === d.value ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.6)",
                      }}>
                      <span>{d.icon}</span> {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Interests */}
          {step === "interests" && (
            <motion.div key="interests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xs mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>Choose at least 3 things you enjoy.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button key={interest} onClick={() => toggleInterest(interest)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        background: selected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                        color: selected ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.5)",
                      }}>
                      {interest}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] mt-3" style={{ color: "rgba(148,163,184,0.3)" }}>{selectedInterests.length} selected</p>
            </motion.div>
          )}

          {/* Step: Questions */}
          {step === "questions" && (
            <motion.div key="questions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <p className="text-xs mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>Answer at least 3 questions. Be yourself.</p>
              {questions.map(q => (
                <div key={q.id}>
                  <label className="text-xs mb-1.5 block" style={{ color: "rgba(224,231,255,0.7)" }}>{q.question_text}</label>
                  <textarea value={answers[q.id] || ""} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} rows={2} maxLength={500}
                    placeholder="Your answer..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
                </div>
              ))}
              <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>{Object.values(answers).filter(a => a.trim()).length} answered</p>
            </motion.div>
          )}

          {/* Step: Photos */}
          {step === "photos" && (
            <motion.div key="photos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xs mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>Add 1-4 photos. Your first photo will be your primary.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>✕</button>
                    {i === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px]"
                        style={{ background: "rgba(139,92,246,0.3)", color: "rgba(224,231,255,0.9)" }}>Primary</div>
                    )}
                  </div>
                ))}
                {photos.length < 4 && (
                  <label className="aspect-[3/4] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <span className="text-2xl mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>+</span>
                    <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>Add photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file && photos.length < 4) setPhotos(prev => [...prev, file]);
                    }} />
                  </label>
                )}
              </div>
            </motion.div>
          )}

          {/* Step: Bio */}
          {step === "bio" && (
            <motion.div key="bio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xs mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>Write a short bio. Or skip — your personality answers speak for you.</p>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={500}
                placeholder="A little about yourself..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
              <p className="text-[10px] mt-1" style={{ color: "rgba(148,163,184,0.3)" }}>{bio.length}/500</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStepIndex > 0 && (
            <button onClick={() => {
              const order: Step[] = ["basics", "interests", "questions", "photos", "bio"];
              setStep(order[currentStepIndex - 1]);
            }}
              className="px-6 py-3 rounded-xl text-xs"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.6)" }}>
              Back
            </button>
          )}
          <button
            onClick={step === "bio" ? handleComplete : handleNext}
            disabled={!canProceed() || saving}
            className="flex-1 py-3 rounded-xl text-sm tracking-wide transition-all"
            style={{
              background: canProceed()
                ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${canProceed() ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
              color: canProceed() ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.3)",
              opacity: canProceed() ? 1 : 0.5,
            }}>
            {saving ? "Creating profile..." : step === "bio" ? "Complete Profile" : "Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
