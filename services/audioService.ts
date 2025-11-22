
export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
  }

  async init() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.buffer) {
      this.buffer = this.generateDiscoLoop();
    }
  }

  play() {
    if (!this.ctx || !this.buffer || !this.gainNode) return;
    
    // Stop existing if any
    this.stop();

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start(0);
    this.isPlaying = true;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.source = null;
    }
    this.isPlaying = false;
  }

  setVolume(val: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = val; // 0 to 1
    }
  }

  private generateDiscoLoop(): AudioBuffer {
    if (!this.ctx) throw new Error("No Audio Context");

    const duration = 5.0;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, length, sampleRate); // Stereo

    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // BPM = 120 (2 beats per second). 5 seconds = 10 beats.
    // 1 beat = 0.5 seconds.
    const beatLen = 0.5 * sampleRate;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // --- KICK (Four on the floor: 0, 1, 2, 3...) ---
      // Simple sine sweep
      let kick = 0;
      const beatTime = t % 0.5; // 120 BPM
      if (beatTime < 0.15) {
        const freq = 150 * Math.exp(-beatTime * 25); // Drop pitch
        const amp = Math.exp(-beatTime * 20);
        kick = Math.sin(2 * Math.PI * freq * beatTime) * amp;
      }

      // --- HI-HAT (Off beats: 0.25, 0.75...) ---
      let hat = 0;
      const halfBeatTime = t % 0.25;
      // Check if we are on an off-beat (every second 0.25s interval)
      const isOffBeat = Math.floor(t / 0.25) % 2 !== 0;
      
      if (isOffBeat && halfBeatTime < 0.05) {
        const noise = (Math.random() * 2 - 1);
        hat = noise * Math.exp(-halfBeatTime * 80) * 0.3;
      }

      // --- BASS (Funky Octaves) ---
      // Root note G (approx 49Hz), switching to octave (98Hz)
      let bass = 0;
      const noteLen = 0.25; // 16th notes at 60bpm or 8th at 120
      const measurePos = t % 2.0; // 1 bar loop for bass pattern
      
      let bassFreq = 49.00; // G1
      // Simple pattern
      if (measurePos > 1.0 && measurePos < 1.25) bassFreq = 98.00; // Octave up
      if (measurePos > 1.75) bassFreq = 73.42; // D2

      // Sawtooth approximation
      const bassPhase = (t * bassFreq) % 1.0;
      bass = (bassPhase * 2 - 1) * 0.4;
      
      // Low pass filter effect (simple lerp)
      // In a real buffer generation, pure math filters are tricky, 
      // we keep it raw but lower amplitude.

      // Mix
      let sample = (kick * 0.8) + (hat * 0.6) + (bass * 0.5);
      
      // Limiter
      sample = Math.max(-1, Math.min(1, sample));

      left[i] = sample;
      right[i] = sample;
    }

    return buffer;
  }
}
