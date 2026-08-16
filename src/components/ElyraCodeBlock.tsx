"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ElyraCodeBlockProps {
  language?: string;
  children: string;
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

export default function ElyraCodeBlock({ language, children }: ElyraCodeBlockProps) {
  const [copied, setCopied] = useState(false);

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
        }}>
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(0, 255, 136, 0.15)",
            background: copied ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.04)",
            color: copied ? "#00ff88" : "rgba(0, 255, 136, 0.6)",
            fontSize: "11px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "monospace",
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
