"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import Navigation from "@/components/Navigation";
import Link from "next/link";

const contactTypes = [
  { value: "email", label: "Email" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const identityTypes = [
  { value: "anonymous", label: "Anonymous", description: "No identity shown" },
  { value: "alias", label: "Alias", description: "Show a creative name" },
  { value: "real", label: "Real Name", description: "Show your real name" },
];

export default function ProfilePage() {
  const { userProfile, updateProfile, refreshProfile, isAnonymous, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.display_name ?? "");
  const [bio, setBio] = useState(userProfile?.bio ?? "");
  const [contactInfo, setContactInfo] = useState(userProfile?.contact_info ?? "");
  const [contactType, setContactType] = useState(userProfile?.contact_type ?? "email");
  const [identityType, setIdentityType] = useState(userProfile?.identity_type ?? "anonymous");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: displayName || null,
      bio: bio || null,
      contact_info: contactInfo || null,
      contact_type: contactInfo ? contactType as "email" | "discord" | "website" | "other" : null,
      identity_type: identityType as "anonymous" | "alias" | "real",
    });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleStartEditing = () => {
    setDisplayName(userProfile?.display_name ?? "");
    setBio(userProfile?.bio ?? "");
    setContactInfo(userProfile?.contact_info ?? "");
    setContactType(userProfile?.contact_type ?? "email");
    setIdentityType(userProfile?.identity_type ?? "anonymous");
    setEditing(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Nebula />
      <Starfield />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation activePage="profile" />

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                Your Profile
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                Control how you appear to others. Share only what you want.
              </p>
            </motion.div>

            <motion.div
              className="glass rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {!editing ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl text-elovayne-light">Your Identity</h2>
                    <button
                      onClick={handleStartEditing}
                      className="text-sm text-elovayne-violet hover:text-elovayne-light transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-elovayne-dim uppercase tracking-wider">Identity</label>
                      <p className="text-elovayne-light capitalize">{userProfile?.identity_type ?? "anonymous"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-elovayne-dim uppercase tracking-wider">Display Name</label>
                      <p className="text-elovayne-light">{userProfile?.display_name ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-elovayne-dim uppercase tracking-wider">Bio</label>
                      <p className="text-elovayne-light whitespace-pre-wrap">{userProfile?.bio ?? "No bio yet"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-elovayne-dim uppercase tracking-wider">Contact</label>
                      {userProfile?.contact_info ? (
                        <p className="text-elovayne-light">
                          <span className="text-elovayne-muted capitalize">{userProfile.contact_type}: </span>
                          {userProfile.contact_info}
                        </p>
                      ) : (
                        <p className="text-elovayne-muted">Not shared</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-elovayne-dim uppercase tracking-wider">Member Since</label>
                      <p className="text-elovayne-light">
                        {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl text-elovayne-light">Edit Profile</h2>
                    <button
                      onClick={() => setEditing(false)}
                      className="text-sm text-elovayne-dim hover:text-elovayne-light transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-elovayne-dim uppercase tracking-wider mb-2">
                        How do you want to appear?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {identityTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setIdentityType(type.value as "anonymous" | "alias" | "real")}
                            className={`p-3 rounded-xl text-center transition-all ${
                              identityType === type.value
                                ? "bg-elovayne-nebula/30 border border-elovayne-violet/50 text-elovayne-light"
                                : "bg-elovayne-deep/50 border border-transparent text-elovayne-muted hover:text-elovayne-light"
                            }`}
                          >
                            <div className="text-sm font-heading">{type.label}</div>
                            <div className="text-xs text-elovayne-dim mt-1">{type.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {identityType !== "anonymous" && (
                      <div>
                        <label className="block text-xs text-elovayne-dim uppercase tracking-wider mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="How should we call you?"
                          className="w-full bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/50 transition-colors"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-elovayne-dim uppercase tracking-wider mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself... or don't. Anonymity is beautiful too."
                        rows={3}
                        className="w-full bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/50 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-elovayne-dim uppercase tracking-wider mb-2">
                        Contact Details (optional)
                      </label>
                      <p className="text-xs text-elovayne-dim mb-3">
                        Only shown if you choose to share. Leave empty to stay private.
                      </p>
                      <div className="flex gap-3">
                        <select
                          value={contactType}
                          onChange={(e) => setContactType(e.target.value as typeof contactType)}
                          className="bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light focus:outline-none focus:border-elovayne-violet/50 transition-colors"
                        >
                          {contactTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder="your contact here"
                          className="flex-1 bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/50 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-3 rounded-xl bg-elovayne-nebula/40 hover:bg-elovayne-nebula/60 text-elovayne-light font-heading tracking-wider transition-all disabled:opacity-50"
                    >
                      {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Account Section */}
            <motion.div
              className="glass rounded-2xl p-6 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="font-heading text-lg text-elovayne-light mb-4">Account</h2>
              {isAnonymous ? (
                <div className="space-y-3">
                  <p className="text-sm text-elovayne-muted">
                    You&apos;re using an anonymous account. Upgrade to keep your stories and journal forever.
                  </p>
                  <Link
                    href="/login"
                    className="block w-full py-3 rounded-xl bg-elovayne-nebula/40 hover:bg-elovayne-nebula/60 text-elovayne-light font-heading tracking-wider text-center transition-all"
                  >
                    Upgrade to Permanent Account
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-elovayne-muted">
                    Your account is permanent. Your data is safe.
                  </p>
                  <button
                    onClick={signOut}
                    className="text-sm text-elovayne-dim hover:text-elovayne-cosmic-pink transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
