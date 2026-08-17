import { LiveFilter } from "@/lib/live-filters";

export interface CameraOptions {
  facingMode: "user" | "environment";
  audio?: boolean;
}

/**
 * Manages the camera stream and produces the outgoing video stream with a
 * selected filter applied via canvas captureStream(). "natural" passes the
 * raw camera track through with zero processing cost.
 *
 * Canvas resolution and frame rate are scaled down on low-end / mobile devices
 * so filters degrade gracefully instead of stalling the stream.
 */
export class LiveCameraPipeline {
  rawStream: MediaStream | null = null;
  outputStream: MediaStream | null = null;
  currentFilterId: string = "natural";

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private bgCanvas: HTMLCanvasElement | null = null;
  private sharpCanvas: HTMLCanvasElement | null = null;
  private rafId: number | null = null;
  private lastDraw = 0;
  private fps = 30;
  private width = 0;
  private height = 0;
  private active = false;

  onQualityNote?: (note: string) => void;

  get isMobileDevice(): boolean {
    return typeof window !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4 && window.innerWidth < 640;
  }

  async startCamera(options: CameraOptions): Promise<MediaStream> {
    this.rawStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: options.facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: options.audio ?? true,
    });
    return this.rawStream;
  }

  /** A hidden <video> bound to the raw camera stream. */
  getSourceVideo(): HTMLVideoElement {
    const video = document.createElement("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    if (this.rawStream) video.srcObject = this.rawStream;
    return video;
  }

  /**
   * Applies a filter and returns the stream that should be used for the
   * preview and for peer connections. "natural" returns the raw stream.
   */
  async applyFilter(filter: LiveFilter): Promise<MediaStream> {
    if (!this.rawStream) throw new Error("no-camera");
    this.currentFilterId = filter.id;

    if (filter.id === "natural" || (!filter.css && !filter.backgroundBlur)) {
      this.teardownCanvas();
      this.outputStream = this.rawStream;
      return this.rawStream;
    }

    const video = this.getSourceVideo();
    this.computeSize(video);
    const canvas = this.ensureCanvas();
    this.ensureCompositeCanvases();
    const stream = canvas.captureStream(this.fps);
    this.outputStream = stream;
    this.active = true;
    this.lastDraw = 0;

    const draw = (t: number) => {
      this.rafId = requestAnimationFrame(draw);
      if (!this.active) return;
      if (t - this.lastDraw < 1000 / this.fps) return;
      this.lastDraw = t;
      this.drawFrame(video, filter);
    };
    this.rafId = requestAnimationFrame(draw);

    return stream;
  }

  private computeSize(video: HTMLVideoElement) {
    let w = video.videoWidth || 1280;
    let h = video.videoHeight || 720;
    const maxW = this.isMobileDevice ? 480 : 720;
    if (w > maxW) {
      const scale = maxW / w;
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    this.width = w % 2 === 0 ? w : w - 1;
    this.height = h % 2 === 0 ? h : h - 1;
    this.fps = this.isMobileDevice ? 24 : 30;
    if (this.isMobileDevice) {
      this.onQualityNote?.(`Filters render at ${this.width}p · ${this.fps}fps for your device`);
    }
  }

  private ensureCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d")!;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    return this.canvas;
  }

  private ensureCompositeCanvases() {
    let bgCanvas = this.bgCanvas;
    let sharpCanvas = this.sharpCanvas;
    if (!bgCanvas || !sharpCanvas) {
      bgCanvas = document.createElement("canvas");
      sharpCanvas = document.createElement("canvas");
      this.bgCanvas = bgCanvas;
      this.sharpCanvas = sharpCanvas;
    }
    bgCanvas.width = this.width;
    bgCanvas.height = this.height;
    sharpCanvas.width = this.width;
    sharpCanvas.height = this.height;
  }

  private drawFrame(video: HTMLVideoElement, filter: LiveFilter) {
    if (!this.ctx || !this.canvas) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;
    const { width: w, height: h } = this;

    if (filter.backgroundBlur) {
      this.drawBackgroundBlur(video, w, h);
      return;
    }

    this.ctx.filter = filter.css || "none";
    this.ctx.drawImage(video, 0, 0, w, h);
    this.ctx.filter = "none";
  }

  private drawBackgroundBlur(video: HTMLVideoElement, w: number, h: number) {
    if (!this.ctx || !this.canvas || !this.bgCanvas || !this.sharpCanvas) return;

    const bg = this.bgCanvas.getContext("2d")!;
    const sharp = this.sharpCanvas.getContext("2d")!;

    // Blurred full frame as background
    bg.filter = "blur(22px) saturate(1.15) brightness(0.9)";
    bg.drawImage(video, 0, 0, w, h);
    bg.filter = "none";

    // Sharp frame with a soft radial mask in the center
    sharp.clearRect(0, 0, w, h);
    sharp.drawImage(video, 0, 0, w, h);
    const cx = w / 2;
    const cy = h * 0.45;
    const r = Math.min(w, h) * 0.46;
    const grad = sharp.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    sharp.globalCompositeOperation = "destination-in";
    sharp.fillStyle = grad;
    sharp.fillRect(0, 0, w, h);
    sharp.globalCompositeOperation = "source-over";

    this.ctx.clearRect(0, 0, w, h);
    this.ctx.drawImage(this.bgCanvas, 0, 0);
    this.ctx.drawImage(this.sharpCanvas, 0, 0);
  }

  getVideoTrack(): MediaStreamTrack | null {
    return this.outputStream?.getVideoTracks()[0] ?? this.rawStream?.getVideoTracks()[0] ?? null;
  }

  private teardownCanvas() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.active = false;
    if (this.canvas) {
      this.canvas.getContext("2d")?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.outputStream && this.outputStream !== this.rawStream) {
      this.outputStream.getTracks().forEach((t) => t.stop());
    }
  }

  stop() {
    this.teardownCanvas();
    this.rawStream?.getTracks().forEach((t) => t.stop());
    this.rawStream = null;
    this.outputStream = null;
  }
}

/** Shared helper to turn a MediaStream into a live <video> element. */
export function streamToVideo(stream: MediaStream, className?: string): HTMLVideoElement {
  const video = document.createElement("video");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.srcObject = stream;
  if (className) video.className = className;
  return video;
}