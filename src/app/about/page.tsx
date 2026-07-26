"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import Navigation from "@/components/Navigation";

const sections = [
  {
    title: "What is Elovayne?",
    content: `Elovayne is a quiet constellation where drifting souls gather to share feelings, stories, and creative whispers. It's a place to be heard without judgment, to connect through empathy, and to find comfort in knowing the stars above hold space for you.`,
  },
  {
    title: "Your privacy matters",
    items: [
      "You can speak completely anonymously — no name, no email, no trace required.",
      "Anonymous whispers cannot be traced back to you. There is no hidden thread.",
      "You can dissolve any of your words at any time, and they are permanently released.",
      "Your journal exists in its own quiet corner — only you can see it.",
      "We never sell your words. There are no ads, no tracking, no algorithms watching.",
    ],
  },
  {
    title: "Community guidelines",
    items: [
      "Be gentle. Everyone here is navigating something tender.",
      "No cruelty, no hate speech, no discrimination of any kind.",
      "No unsolicited advice unless someone asks for it. Sometimes people just need to be heard.",
      "No revealing information about others without their consent.",
      "No spam, self-promotion, or commercial content.",
      "Respect boundaries. If someone asks for space, give it.",
    ],
  },
  {
    title: "Safety & support",
    content: `Elovayne is designed to be a gentle refuge, but it is not a substitute for professional care. If you or someone you know is in crisis, please reach out to a professional service.`,
    items: [
      "You can report any whisper that feels harmful, inappropriate, or violates our guidelines.",
      "Reports are reviewed with care and action is taken to protect the community.",
      "If you're in immediate danger, please contact your local emergency services.",
    ],
  },
  {
    title: "How it drifts",
    items: [
      "Step into the Sanctuary to read and share whispers with the community.",
      "Wander through emotional rooms — each has its own atmosphere and heartbeat.",
      "React with meaning: 'I see you in the dark', 'Your words became light', 'I'm here with you', and more.",
      "Keep a private journal for your constellations of thought and reflection.",
      "Save whispers that resonate with you to revisit later.",
      "Tune your experience with custom colors, ambient sounds, and animation settings.",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Nebula />
      <Starfield />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation />

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                About Elovayne
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                Before you drift further, a few gentle whispers
              </p>
            </motion.div>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  className="glass rounded-2xl p-6 md:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h2 className="font-heading text-xl text-elovayne-light glow-text mb-4">
                    {section.title}
                  </h2>

                  {section.content && (
                    <p className="text-elovayne-muted font-body text-sm leading-relaxed mb-4">
                      {section.content}
                    </p>
                  )}

                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-elovayne-violet mt-1 text-xs">✦</span>
                          <span className="text-elovayne-muted font-body text-sm leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}

              {/* Crisis support */}
              <motion.div
                className="glass rounded-2xl p-6 md:p-8 border border-elovayne-cosmic-pink/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="font-heading text-xl text-elovayne-cosmic-pink mb-4">
                  In crisis?
                </h2>
                <p className="text-elovayne-muted font-body text-sm leading-relaxed mb-4">
                  If you or someone you know is in immediate danger or experiencing a mental health crisis,
                  please reach out for professional help.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-elovayne-light">
                    <span className="text-elovayne-muted">International:</span>{" "}
                    <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-elovayne-violet hover:text-elovayne-light transition-colors">
                      findahelpline.com
                    </a>
                  </p>
                  <p className="text-elovayne-light">
                    <span className="text-elovayne-muted">US:</span>{" "}
                    <span className="text-elovayne-light">988 Suicide & Crisis Lifeline — call or text 988</span>
                  </p>
                  <p className="text-elovayne-light">
                    <span className="text-elovayne-muted">UK:</span>{" "}
                    <span className="text-elovayne-light">Samaritans — call 116 123</span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Back to home */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                href="/"
                className="text-sm text-elovayne-dim hover:text-elovayne-muted transition-colors"
              >
                ← Return to the entrance
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
