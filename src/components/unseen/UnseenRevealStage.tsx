"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { MatchWithProfile } from "@/lib/unseen/types";
import { getSignedUrl } from "@/lib/unseen/storage";

interface UnseenRevealStageProps {
  match: MatchWithProfile;
  myUserId: string;
  onKeep: () => void;
  onEnd: () => void;
}

export default function UnseenRevealStage({ match, myUserId, onKeep, onEnd }: UnseenRevealStageProps) {
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);
  const [theirPhotoUrl, setTheirPhotoUrl] = useState<string | null>(null);
  const [blurLevel, setBlurLevel] = useState(40);
  const [loaded, setLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const myConsent = match.user_a_id === myUserId ? match.stage_reveal_a : match.stage_reveal_b;

  useEffect(() => {
    async function loadPhotos() {
      const client = supabase();

      // Load my photo
      const { data: myPhotos } = await client
        .from("unseen_photos")
        .select("storage_path")
        .eq("user_id", myUserId)
        .eq("is_primary", true)
        .limit(1);

      if (myPhotos?.[0]) {
        const url = await getSignedUrl(myPhotos[0].storage_path);
        setMyPhotoUrl(url);
      }

      // Load their photo
      const { data: theirPhotos } = await client
        .from("unseen_photos")
        .select("storage_path")
        .eq("user_id", match.other_profile.user_id)
        .eq("is_primary", true)
        .limit(1);

      if (theirPhotos?.[0]) {
        const url = await getSignedUrl(theirPhotos[0].storage_path);
        setTheirPhotoUrl(url);
      }
    }

    loadPhotos();
  }, [myUserId, match.other_profile.user_id]);

  // Animate blur reduction
  useEffect(() => {
    if (!loaded) {
      const timer = setTimeout(() => {
        setLoaded(true);
        // Gradually reduce blur
        const interval = setInterval(() => {
          setBlurLevel(prev => {
            if (prev <= 0) {
              clearInterval(interval);
              setTimeout(() => setShowActions(true), 500);
              return 0;
            }
            return prev - 2;
          });
        }, 80);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(236,72,153,0.5)" }}>
          Stage 3 — The Reveal
        </p>
        <h2 className="text-xl sm:text-2xl mb-8" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
          Now you get to see each other.
        </h2>

        {/* Photo reveal */}
        <div className="flex justify-center gap-6 mb-8">
          {/* Their photo */}
          <div className="relative">
            <div
              className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {theirPhotoUrl ? (
                <motion.div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${theirPhotoUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: `blur(${blurLevel}px)`,
                    transition: "filter 0.3s ease",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.1)" }}>
                  <span className="text-3xl">◎</span>
                </div>
              )}
            </div>
            <p className="text-[10px] mt-2" style={{ color: "rgba(148,163,184,0.4)" }}>
              {match.other_profile.display_name}
            </p>
          </div>

          {/* My photo */}
          <div className="relative">
            <div
              className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {myPhotoUrl ? (
                <motion.div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${myPhotoUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: `blur(${blurLevel}px)`,
                    transition: "filter 0.3s ease",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.1)" }}>
                  <span className="text-3xl">◎</span>
                </div>
              )}
            </div>
            <p className="text-[10px] mt-2" style={{ color: "rgba(148,163,184,0.4)" }}>You</p>
          </div>
        </div>

        {blurLevel > 0 && (
          <p className="text-xs mb-4 animate-pulse" style={{ color: "rgba(148,163,184,0.4)" }}>
            Coming into focus...
          </p>
        )}

        {myConsent && (
          <p className="text-xs mb-4" style={{ color: "rgba(139,92,246,0.5)" }}>
            You made your choice. Waiting for them...
          </p>
        )}

        {/* Actions */}
        {showActions && !myConsent && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={onKeep}
              className="w-full py-4 rounded-2xl text-sm tracking-wide transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "rgba(224,231,255,0.9)",
              }}
            >
              Keep the Connection
            </button>
            <button
              onClick={onEnd}
              className="w-full py-3 rounded-xl text-xs transition-all"
              style={{ color: "rgba(148,163,184,0.4)" }}
            >
              Let It End Here
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
