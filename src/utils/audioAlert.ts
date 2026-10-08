class SoundAlertSystem {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;

  constructor() {
    // Check saved preferences
    const savedMute = localStorage.getItem('agrisound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('agrisound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('agrisound_muted', String(muted));
  }

  /**
   * Plays a distinct, gentle acoustic alert when a pest or beneficial sound is detected.
   */
  public playPestAlert(urgency: 'critical' | 'high' | 'moderate' | 'beneficial' = 'high') {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(this.volume, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      gainNode.connect(this.audioCtx.destination);

      if (urgency === 'beneficial') {
        // Soft positive chime for beneficial insects (e.g., Dragonfly)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523, now); // C5
        osc1.frequency.setValueAtTime(659, now + 0.18); // E5
        osc1.connect(gainNode);
        osc1.start(now);
        osc1.stop(now + 0.45);
      } else if (urgency === 'critical') {
        // High alert tone sequence: 784 Hz (G5) -> 987 Hz (B5)
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(784, now);
        osc1.frequency.setValueAtTime(987, now + 0.2);
        osc1.connect(gainNode);
        osc1.start(now);
        osc1.stop(now + 0.55);
      } else {
        // Standard alert tone sequence: 587 Hz (D5) -> 880 Hz (A5)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587, now);
        osc1.frequency.setValueAtTime(880, now + 0.18);
        osc1.connect(gainNode);
        osc1.start(now);
        osc1.stop(now + 0.5);
      }
    } catch {
      // Audio playback blocked or unsupported in current environment
    }
  }

  /**
   * Sound check for farmer testing in field
   */
  public playTestBeep() {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Handle audio errors gracefully
    }
  }
}

export const soundAlert = new SoundAlertSystem();
