"use client";

import { useState, useCallback } from "react";
import { runTests, type TestResult, type TestRun, type TestCategory } from "@/lib/test-runner";
import type { SandboxFile } from "./ElyraSandbox";
import type { ElyraProject } from "@/lib/elyra-storage";

interface LunaTestLabProps {
  files: SandboxFile[];
  project: ElyraProject | null;
  onFixWithLuna: (failedTests: TestResult[]) => void;
  testHistory: TestRun[];
  onHistoryUpdate: (run: TestRun) => void;
}

const CATEGORY_ICONS: Record<TestCategory, string> = {
  render: "📄",
  console: "🖥️",
  js: "⚡",
  layout: "📐",
  a11y: "♿",
  perf: "🚀",
  security: "🔒",
  logic: "🧮",
  form: "📋",
  link: "🔗",
  responsive: "📱",
};

const CATEGORY_LABELS: Record<TestCategory, string> = {
  render: "Render",
  console: "Console",
  js: "JavaScript",
  layout: "Layout",
  a11y: "Accessibility",
  perf: "Performance",
  security: "Security",
  logic: "Logic",
  form: "Forms",
  link: "Links",
  responsive: "Responsive",
};

export default function LunaTestLab({ files, project, onFixWithLuna, testHistory, onHistoryUpdate }: LunaTestLabProps) {
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: "", total: 0, done: 0 });
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(null);
  const [expandedFailure, setExpandedFailure] = useState<string | null>(null);

  const handleRunTests = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentRun(null);
    setProgress({ current: "Starting...", total: 12, done: 0 });

    try {
      const run = await runTests(files, (current, total) => {
        setProgress(prev => ({ ...prev, current, done: prev.done + 1 }));
      });
      setCurrentRun(run);
      onHistoryUpdate(run);
    } catch (err) {
      setCurrentRun({
        id: `run-${Date.now()}`,
        timestamp: Date.now(),
        results: [{
          id: `test-err-${Date.now()}`,
          name: "Test runner error",
          status: "failed",
          message: `Tests could not run: ${err instanceof Error ? err.message : "Unknown error"}`,
          category: "render",
        }],
        passed: 0,
        failed: 1,
        warnings: 0,
        skipped: 0,
        duration: 0,
      });
    } finally {
      setIsRunning(false);
      setProgress({ current: "", total: 0, done: 0 });
    }
  }, [files, isRunning, onHistoryUpdate]);

  const handleRetestFailed = useCallback(async () => {
    if (isRunning || !currentRun) return;
    const failedTests = currentRun.results.filter(r => r.status === "failed" || r.status === "warning");
    if (failedTests.length === 0) return;
    await handleRunTests();
  }, [isRunning, currentRun, handleRunTests]);

  const filteredResults = currentRun
    ? selectedCategory
      ? currentRun.results.filter(r => r.category === selectedCategory)
      : currentRun.results
    : [];

  const categories = currentRun
    ? [...new Set(currentRun.results.map(r => r.category))]
    : [];

  const latestHistory = testHistory[0] || null;
  const previousHistory = testHistory[1] || null;

  const btnStyle = (active?: boolean) => ({
    padding: "6px 12px",
    borderRadius: 6,
    background: active ? "rgba(0, 255, 136, 0.12)" : "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${active ? "rgba(0, 255, 136, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
    color: active ? "var(--crochetworld-nebula)" : "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontFamily: "monospace",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap" as const,
  });

  const statusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed": return <span style={{ color: "#22c55e" }}>✓</span>;
      case "failed": return <span style={{ color: "#ef4444" }}>✕</span>;
      case "warning": return <span style={{ color: "#f59e0b" }}>⚠</span>;
      case "skipped": return <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>;
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "rgba(8, 12, 10, 0.98)",
      borderLeft: "1px solid rgba(0, 255, 136, 0.1)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderBottom: "1px solid rgba(0, 255, 136, 0.08)",
        background: "rgba(0, 255, 136, 0.02)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: isRunning ? "#fbbf24" : currentRun
              ? currentRun.failed > 0 ? "#ef4444" : currentRun.warnings > 0 ? "#f59e0b" : "#22c55e"
              : "rgba(255,255,255,0.2)",
            boxShadow: isRunning ? "0 0 6px rgba(251, 191, 36, 0.5)" : "none",
          }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.6)", letterSpacing: "0.5px" }}>
            Test Lab
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleRunTests}
            disabled={isRunning || files.length === 0}
            style={{
              ...btnStyle(),
              color: isRunning ? "rgba(255,255,255,0.2)" : files.length === 0 ? "rgba(255,255,255,0.15)" : "var(--crochetworld-nebula)",
              cursor: isRunning || files.length === 0 ? "default" : "pointer",
            }}
          >
            {isRunning ? "Testing..." : "Run Tests"}
          </button>
          {currentRun && currentRun.failed > 0 && !isRunning && (
            <button onClick={handleRetestFailed} style={btnStyle()}>
              Retest Failed
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(0, 255, 136, 0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
              {progress.current}
            </span>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
              {progress.done}/{progress.total}
            </span>
          </div>
          <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
              background: "var(--crochetworld-nebula)",
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      {/* Summary */}
      {currentRun && !isRunning && (
        <div style={{
          display: "flex", gap: 12, padding: "10px 14px",
          borderBottom: "1px solid rgba(0, 255, 136, 0.06)", flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#22c55e" }}>
            ✓ {currentRun.passed}
          </span>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b" }}>
            ⚠ {currentRun.warnings}
          </span>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#ef4444" }}>
            ✕ {currentRun.failed}
          </span>
          {currentRun.skipped > 0 && (
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
              — {currentRun.skipped}
            </span>
          )}
          <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>
            {currentRun.duration}ms
          </span>
        </div>
      )}

      {/* Category filters */}
      {currentRun && !isRunning && categories.length > 0 && (
        <div style={{
          display: "flex", gap: 4, padding: "6px 14px", flexShrink: 0,
          borderBottom: "1px solid rgba(0, 255, 136, 0.06)",
          overflowX: "auto",
        }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={btnStyle(!selectedCategory)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              style={btnStyle(selectedCategory === cat)}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {!currentRun && !isRunning && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", padding: "20px",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, fontSize: 20,
            }}>
              🧪
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: "0 0 8px", fontFamily: "monospace" }}>
              Luna Test Lab
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0, fontFamily: "monospace", lineHeight: 1.5, maxWidth: 240 }}>
              Run tests on your project to find issues with rendering, code, accessibility, and more.
            </p>
            {files.length === 0 && (
              <p style={{ fontSize: 9, color: "rgba(245, 158, 11, 0.6)", textAlign: "center", margin: "12px 0 0", fontFamily: "monospace" }}>
                No files to test. Add files in the Sandbox first.
              </p>
            )}
          </div>
        )}

        {filteredResults.map(result => (
          <div
            key={result.id}
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
              cursor: result.status === "failed" || result.status === "warning" ? "pointer" : "default",
              background: expandedFailure === result.id ? "rgba(255, 255, 255, 0.03)" : "transparent",
              transition: "background 0.2s",
            }}
            onClick={() => {
              if (result.status === "failed" || result.status === "warning") {
                setExpandedFailure(expandedFailure === result.id ? null : result.id);
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{statusIcon(result.status)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 11, fontFamily: "monospace",
                    color: result.status === "passed" ? "rgba(255,255,255,0.6)"
                      : result.status === "failed" ? "#fca5a5"
                      : result.status === "warning" ? "#fde68a"
                      : "rgba(255,255,255,0.3)",
                  }}>
                    {result.name}
                  </span>
                  <span style={{
                    fontSize: 8, fontFamily: "monospace", padding: "1px 5px",
                    borderRadius: 3, background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.25)",
                  }}>
                    {CATEGORY_LABELS[result.category]}
                  </span>
                </div>
                <p style={{
                  fontSize: 10, fontFamily: "monospace", margin: "3px 0 0",
                  color: "rgba(255,255,255,0.35)", lineHeight: 1.4,
                }}>
                  {result.message}
                </p>

                {/* Expanded details for failures/warnings */}
                {expandedFailure === result.id && (result.status === "failed" || result.status === "warning") && (
                  <div style={{
                    marginTop: 8, padding: 10, borderRadius: 6,
                    background: result.status === "failed" ? "rgba(239, 68, 68, 0.06)" : "rgba(245, 158, 11, 0.06)",
                    border: `1px solid ${result.status === "failed" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
                  }}>
                    {result.expected && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Expected
                        </span>
                        <p style={{ fontSize: 10, fontFamily: "monospace", color: "#86efac", margin: "2px 0 0" }}>
                          {result.expected}
                        </p>
                      </div>
                    )}
                    {result.actual && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Actual
                        </span>
                        <p style={{ fontSize: 10, fontFamily: "monospace", color: "#fca5a5", margin: "2px 0 0" }}>
                          {result.actual}
                        </p>
                      </div>
                    )}
                    {result.suggestion && (
                      <div>
                        <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Suggestion
                        </span>
                        <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.5)", margin: "2px 0 0", lineHeight: 1.4 }}>
                          {result.suggestion}
                        </p>
                      </div>
                    )}
                    {result.file && (
                      <p style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", margin: "6px 0 0" }}>
                        File: {result.file}{result.line ? `:${result.line}` : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {currentRun && !isRunning && currentRun.failed > 0 && (
        <div style={{
          padding: "10px 14px", borderTop: "1px solid rgba(0, 255, 136, 0.08)",
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          <button
            onClick={() => onFixWithLuna(currentRun.results.filter(r => r.status === "failed"))}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 6,
              background: "rgba(168, 85, 247, 0.12)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              color: "#c084fc", fontSize: 10, fontFamily: "monospace",
              cursor: "pointer", letterSpacing: "0.5px", textTransform: "uppercase",
              transition: "all 0.2s",
            }}
          >
            Ask Luna to Fix
          </button>
          <button onClick={handleRunTests} style={{ ...btnStyle(), flex: 1 }}>
            Run All Tests
          </button>
        </div>
      )}

      {/* History */}
      {testHistory.length > 0 && (
        <div style={{
          padding: "8px 14px", borderTop: "1px solid rgba(0, 255, 136, 0.06)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "1px" }}>
            History
          </span>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
            {testHistory.slice(0, 5).map((run, i) => (
              <div key={run.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", minWidth: 50 }}>
                  {i === 0 ? "Latest" : i === 1 ? "Previous" : `${i + 1} ago`}
                </span>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "#22c55e" }}>{run.passed}✓</span>
                {run.warnings > 0 && <span style={{ fontSize: 9, fontFamily: "monospace", color: "#f59e0b" }}>{run.warnings}⚠</span>}
                {run.failed > 0 && <span style={{ fontSize: 9, fontFamily: "monospace", color: "#ef4444" }}>{run.failed}✕</span>}
                <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.15)", marginLeft: "auto" }}>
                  {new Date(run.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
