"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import FileUploader from "./FileUploader";
import FileCard from "./FileCard";
import CategoryFilter from "./CategoryFilter";
import { useBgTheme } from "@/lib/useBgTheme";

interface CommunityFile {
  id: string;
  user_id: string;
  file_name: string;
  file_type: "music" | "image";
  file_url: string;
  file_size: number;
  description: string;
  is_downloadable: boolean;
  download_count: number;
  category: string;
  created_at: string;
}

type Category = "all" | "music" | "image";

export default function SharePage() {
  const { darkBg } = useBgTheme();
  const [files, setFiles] = useState<CommunityFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const client = supabase();

    const { data, error } = await client
      .from("community_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFiles(data as CommunityFile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredFiles = activeCategory === "all"
    ? files
    : files.filter((f) => f.file_type === activeCategory);

  const counts: Record<Category, number> = {
    all: files.length,
    music: files.filter((f) => f.file_type === "music").length,
    image: files.filter((f) => f.file_type === "image").length,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: darkBg ? "#000000" : "linear-gradient(180deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{
        position: "fixed",
        top: "-20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(239, 68, 68, 0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed",
        bottom: "-20%",
        right: "-10%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "80px 20px 40px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: "32px" }}
        >
          <h1 style={{
            fontSize: "28px",
            fontWeight: 300,
            letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #00d4aa, #ffd700, #00ff88)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 8px",
          }}>
            Community Share
          </h1>
          <p style={{
            fontSize: "13px",
            color: "rgba(240, 255, 245, 0.65)",
            margin: 0,
            lineHeight: "1.6",
          }}>
            Share music and art with the Elovayne community
          </p>
        </motion.div>

        {/* Upload section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: "32px" }}
        >
          <FileUploader onUploadComplete={fetchFiles} />
        </motion.div>

        {/* Browse section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Filter bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "#e0f5e8",
              margin: 0,
              letterSpacing: "0.02em",
            }}>
              Community Files
            </h2>
            <CategoryFilter active={activeCategory} onChange={setActiveCategory} counts={counts} />
          </div>

          {/* File grid */}
          {loading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "120px",
                    borderRadius: "14px",
                    background: "rgba(5, 10, 6, 0.4)",
                    border: "1px solid rgba(0, 255, 136, 0.05)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "rgba(240, 255, 245, 0.55)",
              fontSize: "13px",
            }}>
              {activeCategory === "all"
                ? "No files shared yet. Be the first!"
                : `No ${activeCategory} files shared yet.`}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}>
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
