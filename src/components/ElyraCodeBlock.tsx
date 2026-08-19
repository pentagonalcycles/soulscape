"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ElyraCodeBlockProps {
  language?: string;
  filename?: string;
  children: string;
  onRun?: (code: string, language: string, filename?: string) => void;
}

const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "rgba(5, 15, 8, 0.8)",
    margin: 0,
    padding: "16px",
    borderRadius: "0 0 10px 10px",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "none",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};

const RUNNABLE_LANGUAGES = ["html", "css", "javascript", "js", "typescript", "ts"];

export default function ElyraCodeBlock({ language, filename, children, onRun }: ElyraCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const canRun = onRun && RUNNABLE_LANGUAGES.includes(language?.toLowerCase() || "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = children;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayLang = language || "code";
  const displayHeader = filename ? `${filename} · ${displayLang}` : displayLang;

  const btnBase = {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer" as const,
    transition: "all 0.2s ease",
    fontFamily: "monospace",
  };

  return (
    <div style={{
      borderRadius: "12px",
      overflow: "hidden",
      margin: "12px 0",
      border: "1px solid rgba(0, 255, 136, 0.12)",
      background: "rgba(5, 15, 8, 0.8)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        background: "rgba(0, 255, 136, 0.04)",
        borderBottom: "1px solid rgba(0, 255, 136, 0.08)",
      }}>
        <span style={{
          fontSize: "11px",
          fontFamily: "monospace",
          color: "rgba(0, 255, 136, 0.6)",
          textTransform: "lowercase",
          letterSpacing: "0.05em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
          marginRight: "8px",
        }} title={displayHeader}>
          {displayHeader}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {canRun && (
            <button
              onClick={() => onRun(children, language || "text", filename)}
              style={{
                ...btnBase,
                border: "1px solid rgba(0, 255, 136, 0.25)",
                background: "rgba(0, 255, 136, 0.08)",
                color: "#00ff88",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 255, 136, 0.15)";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 255, 136, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ▶ Run
            </button>
          )}
          <button
            onClick={handleCopy}
            style={{
              ...btnBase,
              border: "1px solid rgba(0, 255, 136, 0.15)",
              background: copied ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.04)",
              color: copied ? "#00ff88" : "rgba(0, 255, 136, 0.6)",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)";
                e.currentTarget.style.color = "rgba(0, 255, 136, 0.9)";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "rgba(0, 255, 136, 0.04)";
                e.currentTarget.style.color = "rgba(0, 255, 136, 0.6)";
              }
            }}
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      </div>

      {/* Code */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <SyntaxHighlighter
          language={language || "text"}
          style={customTheme}
          customStyle={{
            margin: 0,
            padding: "16px",
            background: "rgba(5, 15, 8, 0.8)",
            fontSize: "13px",
            lineHeight: "1.6",
            minHeight: "40px",
          }}
          codeTagProps={{
            style: {
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: "13px",
            },
          }}
          wrapLongLines={false}
        >
          {children.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
