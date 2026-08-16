"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="global-corners" />
      <div className="relative z-10 pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-2xl sm:text-3xl mb-8 text-center" style={{ color: "var(--text-primary)", fontWeight: 300, letterSpacing: "0.02em" }}>
              Privacy Policy
            </h1>

            <div className="space-y-8" style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8" }}>
              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>What We Collect</h2>
                <p>Elovayne collects minimal data necessary to provide our services:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Account information (if you create an account)</li>
                  <li>Content you post (reflections, poems, ideas)</li>
                  <li>Usage data (page visits, feature usage)</li>
                  <li>Device information (browser type, screen size)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>Elyra AI Conversations</h2>
                <p>Your conversations with Elyra are processed to provide responses. We do not use your conversations to train AI models. Conversation history is stored locally on your device and can be cleared at any time.</p>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>File Uploads</h2>
                <p>Files you upload (images, code, documents) are processed to provide the requested service. Uploaded files are not shared with other users unless you explicitly choose to share them. Files may be stored temporarily for processing.</p>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>Tarot Readings</h2>
                <p>Your Tarot questions and saved readings are private and stored securely. Only you can access your saved readings. We do not share your personal questions or readings with anyone.</p>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>How We Use Data</h2>
                <p>We use your data to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Provide and improve Elovayne services</li>
                  <li>Personalize your experience</li>
                  <li>Ensure community safety</li>
                  <li>Analyze usage patterns (anonymized)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>Data Security</h2>
                <p>We use industry-standard security measures to protect your data. All connections are encrypted. We regularly review our security practices.</p>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>Your Rights</h2>
                <p>You can:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Delete your account and data</li>
                  <li>Export your content</li>
                  <li>Opt out of analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg mb-3" style={{ color: "var(--text-primary)", fontWeight: 400 }}>Contact</h2>
                <p>For privacy questions, contact us through our <a href="/support" style={{ color: "#00d4aa", textDecoration: "none", borderBottom: "1px solid rgba(0, 212, 170, 0.3)" }}>Support page</a>.</p>
              </section>

              <p className="text-xs mt-8" style={{ color: "var(--text-dim)" }}>Last updated: January 2026</p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
