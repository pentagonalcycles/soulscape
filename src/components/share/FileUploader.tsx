"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface FileUploaderProps {
  onUploadComplete: () => void;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const { userId, session } = useAuth();
  const userToken = session?.access_token;
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSuccess(false);

    if (!file.name.match(/\.(mp3|wav|ogg|flac|m4a|aac|jpg|jpeg|png|gif|webp)$/i)) {
      setError("Only music (MP3, WAV, OGG, FLAC) and image (JPG, PNG, GIF, WebP) files are accepted.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 50MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !userId || !userToken) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const client = supabase();
      const ext = selectedFile.name.split(".").pop() || "bin";
      const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await client.storage
        .from("community-files")
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`Storage: ${uploadError.message}`);

      const { data: urlData } = client.storage
        .from("community-files")
        .getPublicUrl(filePath);

      const res = await fetch("/api/upload-meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          file_name: selectedFile.name,
          file_type: selectedFile.type.startsWith("audio/") ? "music" : "image",
          file_url: urlData.publicUrl,
          file_size: selectedFile.size,
          description,
          is_downloadable: isDownloadable,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save metadata");
      }

      setSuccess(true);
      setSelectedFile(null);
      setDescription("");
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setDescription("");
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!userId) {
    return (
      <div style={{
        padding: "24px",
        textAlign: "center",
        color: "rgba(240, 255, 245, 0.65)",
        fontSize: "13px",
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(31, 56, 40, 0.65)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(0, 255, 136, 0.1)",
      borderRadius: "16px",
      padding: "20px",
    }}>
      <h3 style={{
        fontSize: "16px",
        fontWeight: 500,
        color: "#e0f5e8",
        margin: "0 0 16px",
        letterSpacing: "0.02em",
      }}>
        Share Something
      </h3>

      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.15)",
              color: "#00ff88",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            ✨ File shared successfully!
            <button
              onClick={reset}
              style={{
                marginLeft: "12px",
                background: "none",
                border: "none",
                color: "#00ff88",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "12px",
              }}
            >
              Upload another
            </button>
          </motion.div>
        )}

        {!selectedFile && !success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.12)"}`,
              borderRadius: "12px",
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: isDragging ? "rgba(0, 255, 136, 0.04)" : "transparent",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {isDragging ? "☁" : "↑"}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(240, 255, 245, 0.75)", marginBottom: "4px" }}>
              {isDragging ? "Drop your file here" : "Click or drag to upload"}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(240, 255, 245, 0.55)" }}>
              Music: MP3, WAV, OGG, FLAC · Images: JPG, PNG, GIF, WebP · Max 50MB
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.ogg,.flac,.m4a,.aac,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndSetFile(file);
              }}
              style={{ display: "none" }}
            />
          </motion.div>
        )}

        {selectedFile && !success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* File info */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(0, 255, 136, 0.04)",
              border: "1px solid rgba(0, 255, 136, 0.08)",
              marginBottom: "12px",
            }}>
              <span style={{ fontSize: "20px" }}>
                {selectedFile.type.startsWith("audio/") ? "🎵" : "🖼️"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "13px",
                  color: "#e0f5e8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(240, 255, 245, 0.6)" }}>
                  {formatSize(selectedFile.size)}
                </div>
              </div>
              <button
                onClick={reset}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(240, 255, 245, 0.6)",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0, 255, 136, 0.1)",
                background: "rgba(0, 0, 0, 0.2)",
                color: "#e0f5e8",
                fontSize: "13px",
                resize: "vertical",
                marginBottom: "12px",
                fontFamily: "inherit",
              }}
            />

            {/* Downloadable toggle */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              cursor: "pointer",
              fontSize: "12px",
              color: "rgba(240, 255, 245, 0.75)",
            }}>
              <input
                type="checkbox"
                checked={isDownloadable}
                onChange={(e) => setIsDownloadable(e.target.checked)}
                style={{ accentColor: "#00ff88" }}
              />
              Allow others to download
            </label>

            {/* Progress bar */}
            {uploading && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{
                  height: "4px",
                  background: "rgba(0, 255, 136, 0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}>
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      height: "100%",
                      width: "40%",
                      background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "rgba(240, 255, 245, 0.6)",
                  marginTop: "4px",
                  textAlign: "center",
                }}>
                  Uploading...
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(255, 80, 80, 0.08)",
                border: "1px solid rgba(255, 80, 80, 0.15)",
                color: "rgba(255, 120, 120, 0.8)",
                fontSize: "12px",
                marginBottom: "12px",
              }}>
                {error}
              </div>
            )}

            {/* Upload button */}
            <motion.button
              onClick={handleUpload}
              disabled={uploading}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(0, 255, 136, 0.2)",
                background: uploading
                  ? "rgba(0, 255, 136, 0.05)"
                  : "linear-gradient(135deg, rgba(0, 255, 136, 0.12), rgba(0, 204, 106, 0.12))",
                color: uploading ? "rgba(240, 255, 245, 0.6)" : "#00ff88",
                fontSize: "13px",
                fontWeight: 500,
                cursor: uploading ? "wait" : "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {uploading ? "Uploading..." : "Share with Elovayne"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
