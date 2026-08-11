"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type FacingMode = "user" | "environment";

export interface CameraState {
  isStreaming: boolean;
  facing: FacingMode;
  error: string | null;
  hasPermission: boolean;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef<FacingMode>("user");
  const mountedRef = useRef(false);
  const [state, setState] = useState<CameraState>({
    isStreaming: false,
    facing: "user",
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const startCamera = useCallback(
    async (mode?: FacingMode) => {
      stopCamera();
      const facingMode = mode ?? facingRef.current;
      facingRef.current = facingMode;

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (constraintErr) {
          if (constraintErr instanceof DOMException && constraintErr.name === "OverconstrainedError") {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } else {
            throw constraintErr;
          }
        }
        
        if (!mountedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video play failed, retrying...", playErr);
            await new Promise((r) => setTimeout(r, 200));
            if (videoRef.current && mountedRef.current) {
              await videoRef.current.play();
            }
          }
        }

        if (mountedRef.current) {
          setState({
            isStreaming: true,
            facing: facingMode,
            error: null,
            hasPermission: true,
          });
        }
      } catch (err) {
        if (!mountedRef.current) return;
        
        let message = "Camera access failed";
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            message = "Camera permission denied. Please allow camera access in your browser settings.";
          } else if (err.name === "NotFoundError") {
            message = "No camera found on this device.";
          } else if (err.name === "NotReadableError") {
            message = "Camera is in use by another application.";
          }
        }
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: message,
        }));
      }
    },
    [stopCamera]
  );

  const switchCamera = useCallback(async () => {
    const newFacing: FacingMode = facingRef.current === "user" ? "environment" : "user";
    await startCamera(newFacing);
  }, [startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    ...state,
    startCamera,
    stopCamera,
    switchCamera,
  };
}
