export class AmbientSoundEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  async play(soundType: string): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.isPlaying = true;
    } catch (e) {
      // Silently fail if audio is not supported
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  stop(): void {
    this.isPlaying = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  destroy(): void {
    this.stop();
  }

  isActive(): boolean {
    return this.isPlaying;
  }
}
