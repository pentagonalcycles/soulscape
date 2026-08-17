import { FilterGrade, LiveFilter } from "@/lib/live-filters";

export interface CameraOptions {
  facingMode: "user" | "environment";
  audio?: boolean;
}

/**
 * Manages the camera stream and produces the outgoing video stream with a
 * selected filter applied via canvas captureStream(). "natural" passes the
 * raw camera track through with zero processing cost.
 *
 * Each filter application uses a brand-new canvas so the captureStream always
 * has a live frame source (reusing one canvas for multiple captureStreams can
 * leave tracks black). The hidden source video is awaited before drawing so
 * the first frame is never blank.
 */
export class LiveCameraPipeline {
  rawStream: MediaStream | null = null;
  outputStream: MediaStream | null = null;
  currentFilterId: string = "natural";

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private hiddenVideo: HTMLVideoElement | null = null;
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
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 360 },
        frameRate: { ideal: 30, max: 30 },
      },
      audio: options.audio ?? true,
    });
    return this.rawStream;
  }

  /**
   * Applies a filter and returns the stream that should be used for the
   * preview and for peer connections. "natural" returns the raw stream.
   */
  async applyFilter(filter: LiveFilter): Promise<MediaStream> {
    if (!this.rawStream) throw new Error("no-camera");
    this.currentFilterId = filter.id;

    if (filter.id === "natural") {
      this.teardownCanvas();
      this.outputStream = this.rawStream;
      return this.rawStream;
    }

    // Stop the previous filtered pipeline cleanly.
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.active = false;
    if (this.outputStream && this.outputStream !== this.rawStream) {
      this.outputStream.getTracks().forEach((t) => t.stop());
    }
    this.outputStream = null;

    // Hidden source video bound to the raw camera stream. It is attached to
    // the DOM (off-screen) so playback is guaranteed on all browsers, and it
    // is played fire-and-forget — never awaited, so this method always returns.
    const video = document.createElement("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.style.position = "fixed";
    video.style.top = "-9999px";
    video.style.left = "-9999px";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    document.body.appendChild(video);
    video.srcObject = this.rawStream;
    video.play().catch(() => {});
    this.hiddenVideo = video;

    this.computeSize(video);

    // Fresh canvas per filter so the captureStream has a dedicated frame source.
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d")!;
    this.canvas = canvas;
    this.ctx = ctx;

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
    // Use the actual camera track dimensions (correct even before the video
    // element has loaded, and keeps portrait cameras from being squashed).
    let w = 1280;
    let h = 720;
    const track = this.rawStream?.getVideoTracks()[0];
    const settings = track?.getSettings();
    if (settings && settings.width && settings.height) {
      w = settings.width;
      h = settings.height;
    } else if (video.videoWidth > 0) {
      w = video.videoWidth;
      h = video.videoHeight;
    }
    const maxW = this.isMobileDevice ? 480 : 720;
    if (w > maxW) {
      const scale = maxW / w;
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    this.width = w % 2 === 0 ? w : w - 1;
    this.height = h % 2 === 0 ? h : h - 1;
    this.fps = this.isMobileDevice ? 24 : 30;
    const qualityNote = this.isMobileDevice
      ? `Filters render at ${this.width}p · ${this.fps}fps (mobile optimized)`
      : `Filters render at ${this.width}p · ${this.fps}fps`;
    if (this.onQualityNote) this.onQualityNote(qualityNote);
  }

  private drawFrame(video: HTMLVideoElement, filter: LiveFilter) {
    if (!this.ctx || !this.canvas) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;
    const { width: w, height: h } = this;

    this.ctx.clearRect(0, 0, w, h);
    this.drawCover(video, w, h, this.ctx);
    this.applyGrade(this.ctx, w, h, filter.grade);

    if (filter.vignette) {
      const radius = Math.hypot(w, h) / 2;
      const grad = this.ctx.createRadialGradient(w / 2, h / 2, radius * 0.45, w / 2, h / 2, radius);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.4)");
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    }
  }

  /** Per-pixel color grade. Works on every browser (unlike ctx.filter, which
   *  Safari ignores), and produces strong, clearly distinct looks. */
  private applyGrade(ctx: CanvasRenderingContext2D, w: number, h: number, grade: FilterGrade) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const { exposure, contrast, saturation, temperature, tint, tintAmount } = grade;

    // Per-channel linear factors for exposure + contrast + temperature + tint,
    // baked into 256-entry lookup tables for speed.
    const tempAmt = 40 * temperature;
    const makeLut = (tintCh: number) => {
      const lut = new Uint8ClampedArray(256);
      for (let c = 0; c < 256; c++) {
        let v = c * exposure;
        v = (v - 128) * contrast + 128;
        v = v * (1 - tintAmount) + tintCh * tintAmount;
        lut[c] = v;
      }
      return lut;
    };
    const lutR = makeLut(tint ? tint[0] : 128);
    const lutG = makeLut(tint ? tint[1] : 128);
    const lutB = makeLut(tint ? tint[2] : 128);
    const rTemp = tempAmt;
    const bTemp = -tempAmt;

    if (saturation === 1) {
      for (let i = 0; i < data.length; i += 4) {
        const r = lutR[data[i]] + rTemp;
        const g = lutG[data[i + 1]];
        const b = lutB[data[i + 2]] + bTemp;
        data[i] = r > 255 ? 255 : r < 0 ? 0 : r;
        data[i + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
        data[i + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
      }
    } else {
      for (let i = 0; i < data.length; i += 4) {
        let r = lutR[data[i]] + rTemp;
        let g = lutG[data[i + 1]];
        let b = lutB[data[i + 2]] + bTemp;
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        r = gray + (r - gray) * saturation;
        g = gray + (g - gray) * saturation;
        b = gray + (b - gray) * saturation;
        data[i] = r > 255 ? 255 : r < 0 ? 0 : r;
        data[i + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
        data[i + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /** Draw the video filling a canvas while preserving aspect ratio (crops, never squashes). */
  private drawCover(video: HTMLVideoElement, w: number, h: number, ctx: CanvasRenderingContext2D) {
    const vw = video.videoWidth || w;
    const vh = video.videoHeight || h;
    const scale = Math.max(w / vw, h / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(video, dx, dy, dw, dh);
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
    if (this.hiddenVideo) {
      this.hiddenVideo.pause();
      this.hiddenVideo.srcObject = null;
      this.hiddenVideo.remove();
      this.hiddenVideo = null;
    }
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
