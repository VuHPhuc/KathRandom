// Audio synthesis using Web Audio API for zero-dependency realistic sounds
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick(pitchModifier = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Debounce very rapid ticks so audio buffer doesn't saturate
    if (now - this.lastTickTime < 0.025) return;
    this.lastTickTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sharp click sound like a wooden/plastic peg
      osc.type = 'triangle';
      const baseFreq = 580 * Math.max(0.7, Math.min(1.4, pitchModifier));
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, time: 0.00, dur: 0.15 }, // C5
      { f: 659.25, time: 0.14, dur: 0.15 }, // E5
      { f: 783.99, time: 0.28, dur: 0.15 }, // G5
      { f: 1046.50, time: 0.44, dur: 0.70 }, // C6
      { f: 1318.51, time: 0.60, dur: 0.60 }  // E6
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.time);

      gain.gain.setValueAtTime(0.25, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });

    // Add gentle noise burst for cheer/applause effect
    this.playCheer();
  }

  playCheer() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.7));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now + 0.3);
    noise.stop(now + 1.8);
  }
}

export const sound = new SoundEffects();
