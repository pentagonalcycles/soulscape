"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AudioPlayer from "./AudioPlayer";

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

interface FileCardProps {
  file: CommunityFile;
}

export default function FileCard({ file }: FileCardProps) {
  const { userId } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwner = userId === file.user_id;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    if (!file.is_downloadable) return;
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(file.file_url, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        background: "rgba(21, 38, 29, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 255, 136, 0.08)",
        borderRadius: "14px",
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.2)";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 255, 136, 0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "18px" }}>{file.file_type === "music" ? "🎵" : "🖼️"}</span>
            <span style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#e0f5e8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {file.file_name}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(224, 245, 232, 0.3)" }}>
            {formatSize(file.file_size)} · {formatDate(file.created_at)}
            {isOwner && <span style={{ marginLeft: "8px", color: "rgba(0, 255, 136, 0.5)" }}>yours</span>}
          </div>
        </div>

        {file.is_downloadable && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            whileTap={{ scale: 0.9 }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(0, 255, 136, 0.15)",
              background: "rgba(0, 255, 136, 0.06)",
              color: "#00ff88",
              fontSize: "11px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ↓ Download
          </motion.button>
        )}
      </div>

      {/* Description */}
      {file.description && (
        <p style={{
          fontSize: "12px",
          color: "rgba(224, 245, 232, 0.45)",
          margin: "0 0 10px",
          lineHeight: "1.5",
        }}>
          {file.description}
        </p>
      )}

      {/* Audio Player for music */}
      {file.file_type === "music" && isExpanded && (
        <div style={{ marginTop: "8px" }}>
          <AudioPlayer src={file.file_url} fileName={file.file_name} />
        </div>
      )}

      {/* Image preview */}
      {file.file_type === "image" && isExpanded && (
        <div style={{ marginTop: "8px", borderRadius: "10px", overflow: "hidden" }}>
          <img
            src={file.file_url}
            alt={file.file_name}
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "contain",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          />
        </div>
      )}

      {/* Download count */}
      <div style={{
        marginTop: "8px",
        fontSize: "10px",
        color: "rgba(224, 245, 232, 0.2)",
      }}>
        {file.download_count} downloads
      </div>
    </motion.div>
  );
}
