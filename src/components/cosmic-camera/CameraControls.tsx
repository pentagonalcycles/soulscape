"use client";

import { motion } from "framer-motion";
import { FilterPreset, FRAME_OPTIONS } from "./filterPresets";
import { useIsPlus } from "@/lib/premium";

interface CameraControlsProps {
  filters: FilterPreset[];
  activeFilter: FilterPreset;
  onFilterChange: (f: FilterPreset) => void;
  onCapture: () => void;
  onSwitchCamera: () => void;
  onSave: () => void;
  onRetake: () => void;
  onOpenImage: () => void;
  facing: string;
  capturedPhoto: string | null;
  isStreaming: boolean;
  selectedFrame: string;
  onFrameChange: (id: string) => void;
  showFrames: boolean;
  onToggleFrames: () => void;
}

export default function CameraControls(props: CameraControlsProps) {
  const isPlus = useIsPlus();
  const {
    filters, activeFilter, onFilterChange, onCapture, onSwitchCamera, onSave, onRetake, onOpenImage,
    capturedPhoto, isStreaming, selectedFrame, onFrameChange, showFrames, onToggleFrames,
  } = props;

  return (
    <div className="cosmic-camera-controls">
      {/* Filter pills */}
      <div className="cosmic-camera-filters">
        <div className="cosmic-camera-filters-scroll">
          {filters.map((f) => (
            <button key={f.id} onClick={() => onFilterChange(f)} className={`cosmic-filter-pill ${activeFilter.id === f.id ? "active" : ""}`}>
              <span className="cosmic-filter-icon">{f.icon}</span>
              <span className="cosmic-filter-name">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="cosmic-camera-bottom">
        {/* Left: switch camera */}
        <button onClick={onSwitchCamera} className="cosmic-camera-side-btn" title="Switch camera">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M16.5 9.5l2.5-2.5 2.5 2.5" /><path d="M19 7v6a4 4 0 01-4 4H7" />
            <path d="M7.5 14.5L5 17l-2.5-2.5" /><path d="M5 17v-6a4 4 0 014-4h8" />
          </svg>
        </button>

        {/* Center: SHUTTER */}
        <motion.button
          onClick={capturedPhoto ? onRetake : onCapture}
          className={`cosmic-camera-shutter ${capturedPhoto ? "retake" : ""}`}
          whileTap={{ scale: 0.88 }}
          disabled={!isStreaming && !capturedPhoto}
        >
          <div className="cosmic-camera-shutter-ring" />
          <div className="cosmic-camera-shutter-dot" />
        </motion.button>

        {/* Right side */}
        {capturedPhoto ? (
          <div className="cosmic-camera-captured-actions">
            <button onClick={onOpenImage} className="cosmic-camera-side-btn open" title="Open image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 3h6v6" /><path d="M10 14L21 3" />
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              </svg>
            </button>
            <button onClick={onSave} className="cosmic-camera-side-btn save" title="Save">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 15V3m0 12l-4-4m4 4l4-4" />
                <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
              </svg>
            </button>
          </div>
        ) : (
          <button onClick={onToggleFrames} className={`cosmic-extra-btn ${showFrames ? "on" : ""}`} title="Frames">
            🖼
          </button>
        )}
      </div>

      {/* Frame picker */}
      {showFrames && isPlus && (
        <div className="cosmic-camera-frames-panel">
          <div className="cosmic-frames-scroll">
            {FRAME_OPTIONS.map((frame) => (
              <button key={frame.id} onClick={() => onFrameChange(frame.id)} className={`cosmic-frame-pill ${selectedFrame === frame.id ? "active" : ""}`}>
                <span>{frame.icon}</span><span>{frame.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
