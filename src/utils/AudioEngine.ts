// Project MEMENTO-WAR Procedural Audio Engine
// Uses Web Audio API to synthesize dark ambient horror soundscapes

class HorrorAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientStaticNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private ambientStaticGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  
  // Heartbeat state
  private heartbeatInterval: any = null;
  private heartbeatBpm: number = 60;
  private heartbeatGain: GainNode | null = null;

  // Active playing source (for custom files)
  private activeSource: AudioBufferSourceNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction due to browser autoplay policies
  }

  public init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create ambient static chain
      this.initAmbientStatic();

      // Create drone chain
      this.initDrone();

      // Create heartbeat chain
      this.heartbeatGain = this.ctx.createGain();
      this.heartbeatGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.heartbeatGain.connect(this.masterGain);
      this.startHeartbeatLoop();

    } catch (e) {
      console.error("Failed to initialize AudioContext", e);
    }
  }

  private initAmbientStatic() {
    if (!this.ctx || !this.masterGain) return;

    // Fallback script processor for generating white noise
    const bufferSize = 4096;
    this.ambientStaticNode = this.ctx.createScriptProcessor(bufferSize, 1, 1);
    this.ambientStaticNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Generate random static white noise
        output[i] = Math.random() * 2 - 1;
      }
    };

    // Low pass filter to make the static sound dark and heavy
    const staticFilter = this.ctx.createBiquadFilter();
    staticFilter.type = 'lowpass';
    staticFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // Slowly modulate filter frequency for wind/static movement
    const filterLfo = this.ctx.createOscillator();
    filterLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 0.08 Hz (very slow)
    
    const filterLfoGain = this.ctx.createGain();
    filterLfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(staticFilter.frequency);
    filterLfo.start();

    this.ambientStaticGain = this.ctx.createGain();
    this.ambientStaticGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Very quiet background hum

    this.ambientStaticNode.connect(staticFilter);
    staticFilter.connect(this.ambientStaticGain);
    this.ambientStaticGain.connect(this.masterGain);
  }

  private initDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Eerie low bunker drone
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(55.5, this.ctx.currentTime); // Slightly detuned

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.droneOsc1.connect(droneFilter);
    this.droneOsc2.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  private startHeartbeatLoop() {
    const triggerHeartbeat = () => {
      this.playHeartbeatSound();
      
      // Calculate delay based on BPM
      const intervalMs = (60 / this.heartbeatBpm) * 1000;
      
      // Schedule next pulse
      if (this.heartbeatInterval) clearTimeout(this.heartbeatInterval);
      this.heartbeatInterval = setTimeout(triggerHeartbeat, intervalMs);
    };

    triggerHeartbeat();
  }

  private playHeartbeatSound() {
    if (!this.ctx || !this.heartbeatGain) return;

    const time = this.ctx.currentTime;
    
    // Heartbeat is double pulse: LUB-DUB
    
    // Pulse 1: LUB
    this.createHeartbeatPulse(time, 58, 0.4);
    
    // Pulse 2: DUB (slightly higher frequency and delayed)
    this.createHeartbeatPulse(time + 0.25, 62, 0.3);
  }

  private createHeartbeatPulse(startTime: number, frequency: number, volume: number) {
    if (!this.ctx || !this.heartbeatGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);
    // Quick pitch slide down to feel heavier
    osc.frequency.exponentialRampToValueAtTime(10, startTime + 0.2);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(this.heartbeatGain);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  // --- Dynamic Procedural Sound Triggers (10x-15x Better Audio experience) ---

  // Trigger Sonar / Radar Ping in the distance
  public triggerPing() {
    if (!this.ctx || !this.masterGain) return;
    this.init(); // Auto fallback if context is suspended

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const delayFeedback = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, time);
    osc.frequency.exponentialRampToValueAtTime(800, time + 1.5);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.25, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0);

    // Setup ping echo
    delay.delayTime.setValueAtTime(0.4, time);
    delayFeedback.gain.setValueAtTime(0.5, time);

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Feedback loop
    gain.connect(delay);
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 4);
  }

  // Trigger Geiger Counter ticks (Paranoia level)
  public triggerGeiger(ticksCount: number = 8) {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;

    for (let i = 0; i < ticksCount; i++) {
      const clickTime = time + i * (0.05 + Math.random() * 0.15);
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3000, clickTime);
      filter.Q.setValueAtTime(8, clickTime);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, clickTime);

      gain.gain.setValueAtTime(0, clickTime);
      gain.gain.linearRampToValueAtTime(0.08, clickTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.015);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.03);
    }
  }

  // Trigger Distorted Morse Code Emergency Transmission
  public triggerMorse() {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master) return;
    const time = ctx.currentTime;
    const notes = [1, 1, 1, 3, 3, 3, 1, 1, 1]; // SOS
    let currentOffset = 0;

    notes.forEach((dur) => {
      const startTime = time + currentOffset;
      const duration = dur * 0.12;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const dist = ctx.createWaveShaper();

      // Create retro tube distortion curve
      function makeDistortionCurve(amount: number) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
      }
      dist.curve = makeDistortionCurve(80);
      dist.oversample = '4x';

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
      gain.gain.setValueAtTime(0.05, startTime + duration - 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(dist);
      dist.connect(gain);
      gain.connect(master);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);

      currentOffset += duration + 0.1;
    });
  }

  // Trigger dynamic explosion blast (Gunfight / Flashback)
  public triggerExplosion() {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 2.5; // 2.5 seconds
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(300, time);
    // Exploding rumble sweeps down
    lpFilter.frequency.exponentialRampToValueAtTime(20, time + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.5, time + 0.03); // Quick rise
    gain.gain.exponentialRampToValueAtTime(0.001, time + 2.3); // Heavy decay

    // Extra low frequency rumble osc
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65, time);
    subOsc.frequency.linearRampToValueAtTime(10, time + 1.5);

    subGain.gain.setValueAtTime(0, time);
    subGain.gain.linearRampToValueAtTime(0.8, time + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

    whiteNoise.connect(lpFilter);
    lpFilter.connect(gain);
    gain.connect(this.masterGain);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 2.5);

    subOsc.start(time);
    subOsc.stop(time + 2.0);

    // Trigger high paranoia heartbeat rate
    this.setHeartbeatBpm(135);
    setTimeout(() => {
      this.setHeartbeatBpm(60);
    }, 8000);
  }

  // Trigger high pitch scary ghost whisper wind
  public triggerWhisper() {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 3.0;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'bandpass';
    hpFilter.frequency.setValueAtTime(1200, time);
    // Sweeps up and down like a ghostly sigh
    hpFilter.frequency.linearRampToValueAtTime(2500, time + 1.2);
    hpFilter.frequency.linearRampToValueAtTime(800, time + 2.8);
    hpFilter.Q.setValueAtTime(12, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 3.0);

    whiteNoise.connect(hpFilter);
    hpFilter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 3.0);
  }

  // Trigger radio tuning screeching
  public triggerRadioScreech() {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const fmGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, time);
    osc1.frequency.linearRampToValueAtTime(2200, time + 0.4);
    osc1.frequency.linearRampToValueAtTime(600, time + 0.8);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(120, time); // Modulator frequency
    fmGain.gain.setValueAtTime(500, time); // Modulation depth

    mainGain.gain.setValueAtTime(0, time);
    mainGain.gain.linearRampToValueAtTime(0.07, time + 0.05);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);

    osc2.connect(fmGain);
    fmGain.connect(osc1.frequency);
    osc1.connect(mainGain);
    mainGain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 1.0);
    osc2.stop(time + 1.0);
  }

  // --- Volume & State Management ---

  public setStaticVolume(volume: number) {
    if (!this.ctx) this.init();
    if (this.ambientStaticGain) {
      this.ambientStaticGain.gain.setTargetAtTime(volume * 0.15, this.ctx!.currentTime, 0.1);
    }
  }

  public setHeartbeatBpm(bpm: number) {
    this.heartbeatBpm = Math.min(180, Math.max(35, bpm));
  }

  public setMasterVolume(volume: number) {
    if (!this.ctx) this.init();
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.05);
    }
  }

  public stopAllSounds() {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {}
      this.activeSource = null;
    }
  }

  // Custom audio playback node creator (for visualizer hooking)
  public playCustomAudio(audioBuffer: AudioBuffer, onEnded: () => void, loop: boolean = false, playbackRate: number = 1.0) {
    if (!this.ctx) this.init();
    this.stopAllSounds();

    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;
    source.playbackRate.setValueAtTime(playbackRate, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(20000, ctx.currentTime); // Default wide open

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, ctx.currentTime);

    // Audio Analyzer Node for Realtime Waveform
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(analyser);
    analyser.connect(this.masterGain!);

    source.onended = () => {
      if (this.activeSource === source) {
        this.activeSource = null;
        onEnded();
      }
    };

    source.start(0);
    this.activeSource = source;

    return { source, analyser, filter, gain };
  }

  // Decode standard file to AudioBuffer
  public async decodeAudioFile(file: File): Promise<AudioBuffer> {
    if (!this.ctx) this.init();
    const arrayBuffer = await file.arrayBuffer();
    return await this.ctx!.decodeAudioData(arrayBuffer);
  }

  // Procedurally synthesize waveforms to simulate previewing a file
  public createProceduralBuffer(fileType: string): AudioBuffer {
    if (!this.ctx) this.init();
    const sampleRate = this.ctx!.sampleRate;
    const duration = fileType === 'screams' ? 2.5 : fileType === 'gunfight' ? 3.0 : 4.0;
    const buffer = this.ctx!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Procedural sound synth inside a buffer
    if (fileType === 'static' || fileType === 'radio') {
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
    } else if (fileType === 'heartbeat') {
      const bpm = 120;
      const beatLen = sampleRate * (60 / bpm);
      for (let i = 0; i < data.length; i++) {
        const beatIdx = i % beatLen;
        if (beatIdx < sampleRate * 0.1) {
          const t = beatIdx / (sampleRate * 0.1);
          data[i] = Math.sin(2 * Math.PI * 60 * (beatIdx / sampleRate)) * (1 - t) * 0.4;
        } else if (beatIdx > beatLen * 0.3 && beatIdx < beatLen * 0.3 + sampleRate * 0.1) {
          const subIdx = beatIdx - beatLen * 0.3;
          const t = subIdx / (sampleRate * 0.1);
          data[i] = Math.sin(2 * Math.PI * 65 * (subIdx / sampleRate)) * (1 - t) * 0.3;
        } else {
          data[i] = 0;
        }
      }
    } else {
      // Default ambient horror drone wave
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const mainF = 55 + Math.sin(2 * Math.PI * 0.2 * t) * 2;
        data[i] = (
          Math.sin(2 * Math.PI * mainF * t) * 0.15 +
          Math.sin(2 * Math.PI * (mainF * 1.5) * t) * 0.05 * Math.sin(2 * Math.PI * 4 * t) +
          (Math.random() * 2 - 1) * 0.03
        );
      }
    }

    return buffer;
  }
}

export const audioEngine = new HorrorAudioEngine();
