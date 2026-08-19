"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface SandboxFile {
  name: string;
  content: string;
  language: string;
}

interface ElyraSandboxProps {
  files: SandboxFile[];
  onUpdateFile: (name: string, content: string) => void;
  onReset: () => void;
  onClose: () => void;
  onDebugError?: (errorText: string) => void;
  autoRun?: boolean;
}

type DeviceSize = "desktop" | "tablet" | "mobile";
type MobileTab = "editor" | "preview" | "console";

const DEVICE_WIDTHS: Record<DeviceSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function ElyraSandbox({ files, onUpdateFile, onReset, onClose, onDebugError, autoRun }: ElyraSandboxProps) {
  const [activeFile, setActiveFile] = useState<string>(files[0]?.name || "");
  const [previewKey, setPreviewKey] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState<{ type: "log" | "error" | "warn" | "info"; text: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const autoRunDone = useRef(false);

  const htmlFile = files.find(f => f.name.endsWith(".html"));
  const cssFile = files.find(f => f.name.endsWith(".css"));
  const jsFile = files.find(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutput]);

  const buildPreviewHtml = useCallback(() => {
    const html = htmlFile?.content || "";
    const css = cssFile?.content || "";
    const js = jsFile?.content || "";

    if (!html && !css && !js) return "";

    if (html) {
      let result = html;
      if (css && !html.includes("<style")) {
        result = result.replace("</head>", `<style>${css}</style></head>`);
      }
      if (js && !html.includes("<script")) {
        result = result.replace("</body>", `<script>${js}<\/script></body>`);
      }
      return result;
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #e0e0e0; }
  ${css}
</style>
</head>
<body>
${js ? `<script>
const _origLog = console.log;
const _origErr = console.error;
const _origWarn = console.warn;
console.log = (...a) => { _origLog(...a); parent.postMessage({type:'console',level:'log',args:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x))},'*'); };
console.error = (...a) => { _origErr(...a); parent.postMessage({type:'console',level:'error',args:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x))},'*'); };
console.warn = (...a) => { _origWarn(...a); parent.postMessage({type:'console',level:'warn',args:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x))},'*'); };
window.onerror = (msg) => { parent.postMessage({type:'console',level:'error',args:[String(msg)]},'*'); };
try { ${js} } catch(e) { parent.postMessage({type:'console',level:'error',args:[e.toString()]},'*'); }
<\/script>` : ""}
</body>
</html>`;
  }, [htmlFile, cssFile, jsFile]);

  const runPreview = useCallback(() => {
    setIsRunning(true);
    setConsoleOutput([]);
    setPreviewKey(k => k + 1);
    setShowPreview(true);
    if (isMobile) setMobileTab("preview");
    setTimeout(() => setIsRunning(false), 500);
  }, [isMobile]);

  // Auto-run on first load if autoRun is set
  useEffect(() => {
    if (autoRun && !autoRunDone.current && files.length > 0) {
      autoRunDone.current = true;
      setTimeout(() => runPreview(), 300);
    }
  }, [autoRun, files, runPreview]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "console") {
        setConsoleOutput(prev => [...prev, { type: e.data.level, text: e.data.args.join(" ") }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (files.length > 0 && !files.find(f => f.name === activeFile)) {
      setActiveFile(files[0].name);
    }
  }, [files, activeFile]);

  const activeFileData = files.find(f => f.name === activeFile);

  const handleReset = () => {
    if (confirmReset) {
      onReset();
      setConsoleOutput([]);
      setConfirmReset(false);
      autoRunDone.current = false;
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const handleExport = () => {
    const html = buildPreviewHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const btnStyle = (active?: boolean) => ({
    padding: "5px 10px",
    borderRadius: 6,
    background: active ? "rgba(0, 255, 136, 0.12)" : "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${active ? "rgba(0, 255, 136, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
    color: active ? "var(--elovayne-nebula)" : "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontFamily: "monospace",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap" as const,
  });

  const previewWidth = deviceSize === "desktop" ? "100%" : DEVICE_WIDTHS[deviceSize];

  // Mobile layout with tabs
  if (isMobile) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(8, 12, 10, 0.98)",
        borderLeft: "1px solid rgba(0, 255, 136, 0.1)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", borderBottom: "1px solid rgba(0, 255, 136, 0.08)",
          background: "rgba(0, 255, 136, 0.02)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: isRunning ? "#fbbf24" : "var(--elovayne-nebula)",
              boxShadow: isRunning ? "0 0 5px rgba(251, 191, 36, 0.5)" : "0 0 5px rgba(0, 255, 136, 0.5)",
            }} />
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.6)" }}>Preview</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={runPreview} style={btnStyle()}>Run</button>
            <button onClick={onClose} style={btnStyle()}>Close</button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div style={{
          display: "flex", borderBottom: "1px solid rgba(0, 255, 136, 0.06)", flexShrink: 0,
        }}>
          {(["preview", "editor", "console"] as MobileTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                flex: 1, padding: "8px", fontSize: 10, fontFamily: "monospace",
                background: mobileTab === tab ? "rgba(0, 255, 136, 0.06)" : "transparent",
                border: "none",
                borderBottom: `2px solid ${mobileTab === tab ? "var(--elovayne-nebula)" : "transparent"}`,
                color: mobileTab === tab ? "var(--elovayne-nebula)" : "rgba(255, 255, 255, 0.35)",
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {mobileTab === "preview" && (
            <div style={{ height: "100%", background: "#ffffff" }}>
              <iframe
                key={previewKey}
                ref={iframeRef}
                srcDoc={buildPreviewHtml()}
                sandbox="allow-scripts allow-modals allow-forms"
                style={{ width: "100%", height: "100%", border: "none", background: "#ffffff" }}
                title="Preview"
              />
            </div>
          )}
          {mobileTab === "editor" && activeFileData && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {/* File tabs */}
              <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid rgba(0, 255, 136, 0.06)", flexShrink: 0 }}>
                {files.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setActiveFile(f.name)}
                    style={{
                      padding: "6px 10px", fontSize: 10, fontFamily: "monospace",
                      background: activeFile === f.name ? "rgba(0, 255, 136, 0.06)" : "transparent",
                      border: "none", borderBottom: `2px solid ${activeFile === f.name ? "var(--elovayne-nebula)" : "transparent"}`,
                      color: activeFile === f.name ? "var(--elovayne-nebula)" : "rgba(255, 255, 255, 0.35)",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <textarea
                value={activeFileData.content}
                onChange={(e) => onUpdateFile(activeFileData.name, e.target.value)}
                style={{
                  flex: 1, width: "100%", background: "rgba(5, 10, 8, 0.9)",
                  color: "#d4d4d4", border: "none", padding: "10px 12px",
                  fontSize: 11, fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
                  lineHeight: 1.5, resize: "none", outline: "none", tabSize: 2,
                }}
                spellCheck={false}
              />
            </div>
          )}
          {mobileTab === "console" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "6px 12px", background: "rgba(0, 255, 136, 0.02)", borderBottom: "1px solid rgba(0, 255, 136, 0.04)", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.4)" }}>Console</span>
                <button onClick={() => setConsoleOutput([])} style={btnStyle()}>Clear</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", background: "rgba(5, 10, 8, 0.9)", padding: "8px 12px" }}>
                {consoleOutput.length === 0 ? (
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.2)", fontFamily: "monospace", margin: 0 }}>
                    Output will appear here...
                  </p>
                ) : (
                  consoleOutput.map((entry, i) => (
                    <div key={i} style={{
                      fontSize: 10, fontFamily: "monospace", padding: "2px 0",
                      color: entry.type === "error" ? "#ff4444" : entry.type === "warn" ? "#ffaa00" : "rgba(240, 255, 245, 0.7)",
                    }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.2)", marginRight: 6 }}>
                        {entry.type === "error" ? "✕" : entry.type === "warn" ? "⚠" : "›"}
                      </span>
                      {entry.text}
                    </div>
                  ))
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "rgba(8, 12, 10, 0.98)",
      borderLeft: "1px solid rgba(0, 255, 136, 0.1)",
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
            background: isRunning ? "#fbbf24" : "var(--elovayne-nebula)",
            boxShadow: isRunning ? "0 0 6px rgba(251, 191, 36, 0.5)" : "0 0 6px rgba(0, 255, 136, 0.5)",
          }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.6)", letterSpacing: "0.5px" }}>
            Preview
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={runPreview} style={btnStyle()} title="Run project">Run</button>
          <button onClick={() => setShowPreview(p => !p)} style={btnStyle(showPreview)} title="Toggle preview">Preview</button>
          <button onClick={() => setShowConsole(c => !c)} style={btnStyle(showConsole)} title="Toggle console">Console</button>
          {/* Device size buttons */}
          <div style={{ display: "flex", gap: 2, marginLeft: 4 }}>
            {(["desktop", "tablet", "mobile"] as DeviceSize[]).map(d => (
              <button key={d} onClick={() => setDeviceSize(d)} style={btnStyle(deviceSize === d)} title={d}>
                {d === "desktop" ? "Desktop" : d === "tablet" ? "Tablet" : "Mobile"}
              </button>
            ))}
          </div>
          <button onClick={() => setFullscreen(f => !f)} style={btnStyle(fullscreen)} title="Fullscreen preview">
            {fullscreen ? "Exit Full" : "Full"}
          </button>
          <button onClick={handleExport} style={btnStyle()} title="Download project">Export</button>
          <button onClick={handleReset} style={{
            ...btnStyle(),
            color: confirmReset ? "#ff4444" : "rgba(255, 255, 255, 0.4)",
            border: `1px solid ${confirmReset ? "rgba(255, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
          }} title={confirmReset ? "Click again to confirm" : "Reset sandbox"}>
            {confirmReset ? "Confirm?" : "Reset"}
          </button>
          <button onClick={onClose} style={btnStyle()} title="Close preview">Close</button>
        </div>
      </div>

      {/* File tabs */}
      {files.length > 0 && (
        <div style={{
          display: "flex", gap: 0, padding: "0 8px",
          borderBottom: "1px solid rgba(0, 255, 136, 0.06)",
          overflowX: "auto", flexShrink: 0,
        }}>
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => setActiveFile(f.name)}
              style={{
                padding: "8px 14px", fontSize: 11, fontFamily: "monospace",
                background: activeFile === f.name ? "rgba(0, 255, 136, 0.06)" : "transparent",
                border: "none", borderBottom: `2px solid ${activeFile === f.name ? "var(--elovayne-nebula)" : "transparent"}`,
                color: activeFile === f.name ? "var(--elovayne-nebula)" : "rgba(255, 255, 255, 0.35)",
                cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        {/* Fullscreen preview mode */}
        {fullscreen ? (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", background: "#1a1a1a", padding: 16 }}>
            <div style={{
              width: previewWidth, maxWidth: "100%", height: "100%",
              background: "#ffffff", borderRadius: 8, overflow: "hidden",
              boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
            }}>
              <iframe
                key={previewKey}
                ref={iframeRef}
                srcDoc={buildPreviewHtml()}
                sandbox="allow-scripts allow-modals allow-forms"
                style={{ width: "100%", height: "100%", border: "none", background: "#ffffff" }}
                title="Preview"
              />
            </div>
          </div>
        ) : (
          <>
            {/* File editor */}
            {activeFileData && (
              <div style={{
                flex: showPreview || showConsole ? "0 0 40%" : "1 1 auto",
                display: "flex", flexDirection: "column", minHeight: 0,
                borderBottom: (showPreview || showConsole) ? "1px solid rgba(0, 255, 136, 0.06)" : "none",
              }}>
                <div style={{
                  padding: "6px 14px", background: "rgba(0, 255, 136, 0.02)",
                  borderBottom: "1px solid rgba(0, 255, 136, 0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.4)" }}>
                    {activeFileData.name}
                  </span>
                  <button onClick={() => navigator.clipboard.writeText(activeFileData.content)} style={btnStyle()}>
                    Copy
                  </button>
                </div>
                <textarea
                  value={activeFileData.content}
                  onChange={(e) => onUpdateFile(activeFileData.name, e.target.value)}
                  style={{
                    flex: 1, width: "100%", background: "rgba(5, 10, 8, 0.9)",
                    color: "#d4d4d4", border: "none", padding: "12px 14px",
                    fontSize: 12, fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
                    lineHeight: 1.6, resize: "none", outline: "none", tabSize: 2,
                  }}
                  spellCheck={false}
                />
              </div>
            )}

            {/* Preview */}
            {showPreview && (
              <div style={{
                flex: "0 0 35%", display: "flex", flexDirection: "column", minHeight: 0,
                borderBottom: showConsole ? "1px solid rgba(0, 255, 136, 0.06)" : "none",
              }}>
                <div style={{
                  padding: "6px 14px", background: "rgba(0, 255, 136, 0.02)",
                  borderBottom: "1px solid rgba(0, 255, 136, 0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.4)" }}>
                    Preview {deviceSize !== "desktop" && `(${deviceSize})`}
                  </span>
                  <button onClick={runPreview} style={btnStyle()}>Refresh</button>
                </div>
                <div style={{ flex: 1, background: "#1a1a1a", display: "flex", justifyContent: "center", overflow: "auto" }}>
                  <div style={{
                    width: previewWidth, maxWidth: "100%", height: "100%",
                    background: "#ffffff", transition: "width 0.3s ease",
                  }}>
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      srcDoc={buildPreviewHtml()}
                      sandbox="allow-scripts allow-modals allow-forms"
                      style={{ width: "100%", height: "100%", border: "none", background: "#ffffff" }}
                      title="Preview"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Console */}
            {showConsole && (
              <div style={{ flex: "0 0 25%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{
                  padding: "6px 14px", background: "rgba(0, 255, 136, 0.02)",
                  borderBottom: "1px solid rgba(0, 255, 136, 0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0, 255, 136, 0.4)" }}>Console</span>
                  <button onClick={() => setConsoleOutput([])} style={btnStyle()}>Clear</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", background: "rgba(5, 10, 8, 0.9)", padding: "8px 14px" }}>
                  {consoleOutput.length === 0 ? (
                    <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.2)", fontFamily: "monospace", margin: 0 }}>
                      Output will appear here...
                    </p>
                  ) : (
                    consoleOutput.map((entry, i) => (
                      <div key={i} style={{
                        fontSize: 11, fontFamily: "monospace", padding: "3px 0",
                        color: entry.type === "error" ? "#ff4444" : entry.type === "warn" ? "#ffaa00" : "rgba(240, 255, 245, 0.7)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                        display: "flex", alignItems: "flex-start", gap: 6,
                      }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.2)", flexShrink: 0 }}>
                          {entry.type === "error" ? "✕" : entry.type === "warn" ? "⚠" : "›"}
                        </span>
                        <span style={{ flex: 1, wordBreak: "break-all" }}>{entry.text}</span>
                        {entry.type === "error" && onDebugError && (
                          <button
                            onClick={() => onDebugError(entry.text)}
                            style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: 9,
                              background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.25)",
                              color: "#c084fc", cursor: "pointer", fontFamily: "monospace",
                              whiteSpace: "nowrap", flexShrink: 0,
                            }}
                            title="Ask Luna to debug this error"
                          >
                            Debug
                          </button>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={consoleEndRef} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
