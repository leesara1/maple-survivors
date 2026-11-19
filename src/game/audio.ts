class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  private lastPlayed: Record<string, number> = {};

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private canPlay(key: string, minGapMs: number): boolean {
    const now = performance.now();
    const prev = this.lastPlayed[key] || 0;
    if (now - prev < minGapMs) return false;
    this.lastPlayed[key] = now;
    return true;
  }

  private tone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + duration);
    }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  public playSlash(evolved = false): void {
    if (!this.canPlay('slash', 80)) return;
    this.tone(evolved ? 420 : 320, 95, evolved ? 0.16 : 0.11, 'triangle', 0.09);
  }

  public playShuriken(): void {
    if (!this.canPlay('shuriken', 75)) return;
    this.tone(860, 1280, 0.06, 'square', 0.035);
  }

  public playOrb(): void {
    if (!this.canPlay('orb', 95)) return;
    this.tone(520, 780, 0.1, 'sine', 0.06);
  }

  public playArrow(): void {
    if (!this.canPlay('arrow', 85)) return;
    this.tone(680, 260, 0.06, 'triangle', 0.05);
  }

  public playHoly(): void {
    if (!this.canPlay('holy', 140)) return;
    this.tone(660, 990, 0.18, 'sine', 0.07);
    this.tone(990, 1320, 0.2, 'triangle', 0.04, 0.05);
  }

  public playHit(isCrit = false): void {
    if (!this.canPlay('hit', 45)) return;
    this.tone(isCrit ? 240 : 170, 75, 0.05, 'square', isCrit ? 0.045 : 0.025);
  }

  public playPlayerHurt(): void {
    if (!this.canPlay('hurt', 180)) return;
    this.tone(210, 75, 0.16, 'sawtooth', 0.11);
  }

  public playGem(combo = 0): void {
    if (!this.canPlay('gem', 35)) return;
    const base = 740 + Math.min(combo, 12) * 42;
    this.tone(base, base * 1.18, 0.055, 'sine', 0.045);
  }

  public playCoin(): void {
    if (!this.canPlay('coin', 50)) return;
    this.tone(1180, 1560, 0.08, 'square', 0.04);
  }

  public playLevelUp(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, n, 0.16, 'triangle', 0.09, i * 0.07);
    });
  }

  public playChest(): void {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((n, i) => {
      this.tone(n, n * 1.03, 0.22, 'square', 0.06, i * 0.08);
    });
  }

  public playBomb(): void {
    this.tone(160, 32, 0.42, 'sawtooth', 0.15);
    this.tone(320, 50, 0.35, 'triangle', 0.12, 0.04);
  }

  public playBossSpawn(): void {
    this.tone(180, 90, 0.32, 'sawtooth', 0.11);
    this.tone(140, 70, 0.42, 'sawtooth', 0.12, 0.25);
  }

  public playVictory(): void {
    const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    melody.forEach((n, i) => {
      this.tone(n, n, 0.26, 'triangle', 0.1, i * 0.1);
    });
  }
}

export const sound = new SoundEngine();
