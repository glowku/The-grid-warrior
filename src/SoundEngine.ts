class SoundEngine {
  private ctx: AudioContext | null = null;

  // ─── Chœur de combo (souffle aérien + sub gravité) ───
  private comboOsc: OscillatorNode | null = null;
  private comboSubOsc: OscillatorNode | null = null; // ← NOUVEAU : octave grave
  private comboGain: GainNode | null = null;
  private comboSubGain: GainNode | null = null; // ← NOUVEAU
  private comboFilter: BiquadFilterNode | null = null;
  private comboLfo: OscillatorNode | null = null;

  // ─── Tension ambiante (pad océanique + drone grave) ───
  private tensionOsc: OscillatorNode | null = null;
  private tensionSubOsc: OscillatorNode | null = null; // ← NOUVEAU : sub-bass
  private tensionGain: GainNode | null = null;
  private tensionSubGain: GainNode | null = null; // ← NOUVEAU
  private tensionFilter: BiquadFilterNode | null = null;
  private tensionLfo: OscillatorNode | null = null;
  private tensionLfoGain: GainNode | null = null;

  // ─── Gravité pulsée (infrasons rythmiques) ───
  private gravityOsc: OscillatorNode | null = null; // ← NOUVEAU
  private gravityGain: GainNode | null = null; // ← NOUVEAU
  private gravityFilter: BiquadFilterNode | null = null; // ← NOUVEAU
  private gravityLfo: OscillatorNode | null = null; // ← NOUVEAU

  // ─── Cathédrale spatiale ───
  private reverbNode: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private subMasterGain: GainNode | null = null; // ← NOUVEAU : bus grave dédié

  // ─── Gravité musicale ───
  private readonly pentatonicC = [130.81, 146.83, 164.81, 196.00, 220.00];
  private readonly lydianC = [261.63, 293.66, 329.63, 369.99, 440.00, 493.88, 554.37, 587.33];
  private readonly dorianD = [293.66, 329.63, 349.23, 392.00, 440.00, 523.25, 587.33];
  private readonly aeolianA = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00];
  // Gammes graves pour le sub
  private readonly subPentatonic = [65.41, 73.42, 82.41, 98.00, 110.00]; // C2-D2-E2-G2-A2

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // ═══════════════════════════════════════
    //  BUS MASTER — Séparation aigu/grave
    // ═══════════════════════════════════════
    this.subMasterGain = this.ctx.createGain();
    this.subMasterGain.gain.value = 1.2; // Boost sub

    // Réverbération
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.createReverbImpulse();

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.7;
    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.value = 0.35;

    this.dryGain.connect(this.ctx.destination);
    this.wetGain.connect(this.ctx.destination);
    this.reverbNode.connect(this.wetGain);
    this.subMasterGain.connect(this.ctx.destination); // Sub va direct (sec)

    const masterInput = this.ctx.createGain();
    masterInput.connect(this.dryGain);
    masterInput.connect(this.reverbNode);

    // ═══════════════════════════════════════
    //  CHŒUR DU COMBO — Aérien + Sub profond
    // ═══════════════════════════════════════
    // Voix principale (aérienne)
    this.comboOsc = this.ctx.createOscillator();
    this.comboGain = this.ctx.createGain();
    this.comboFilter = this.ctx.createBiquadFilter();
    this.comboLfo = this.ctx.createOscillator();

    this.comboOsc.type = 'triangle';
    this.comboOsc.frequency.value = 261.63;
    this.comboFilter.type = 'lowpass';
    this.comboFilter.Q.value = 1.2;
    this.comboFilter.frequency.value = 800;
    this.comboLfo.type = 'sine';
    this.comboLfo.frequency.value = 0.15;
    this.comboGain.gain.value = 0;

    this.comboLfo.connect(this.comboFilter.frequency);
    this.comboOsc.connect(this.comboFilter);
    this.comboFilter.connect(this.comboGain);
    this.comboGain.connect(masterInput);
    this.comboOsc.start();
    this.comboLfo.start();

    // Voix sub (gravité organique)
    this.comboSubOsc = this.ctx.createOscillator();
    this.comboSubGain = this.ctx.createGain();
    this.comboSubOsc.type = 'sine'; // Pur, profond
    this.comboSubOsc.frequency.value = 65.41; // C2
    this.comboSubGain.gain.value = 0;

    this.comboSubOsc.connect(this.comboSubGain);
    this.comboSubGain.connect(this.subMasterGain!);
    this.comboSubOsc.start();

    // ═══════════════════════════════════════
    //  TENSION — Pad océanique + Drone grave
    // ═══════════════════════════════════════
    // Voix haute (aérienne)
    this.tensionOsc = this.ctx.createOscillator();
    this.tensionGain = this.ctx.createGain();
    this.tensionFilter = this.ctx.createBiquadFilter();
    this.tensionLfo = this.ctx.createOscillator();
    this.tensionLfoGain = this.ctx.createGain();

    this.tensionOsc.type = 'sine';
    this.tensionOsc.frequency.value = 110;
    this.tensionFilter.type = 'lowpass';
    this.tensionFilter.Q.value = 2.0;
    this.tensionFilter.frequency.value = 200;
    this.tensionLfo.type = 'sine';
    this.tensionLfo.frequency.value = 0.08;
    this.tensionLfoGain.gain.value = 250;
    this.tensionGain.gain.value = 0;

    this.tensionLfo.connect(this.tensionLfoGain);
    this.tensionLfoGain.connect(this.tensionFilter.frequency);
    this.tensionOsc.connect(this.tensionFilter);
    this.tensionFilter.connect(this.tensionGain);
    this.tensionGain.connect(masterInput);
    this.tensionOsc.start();
    this.tensionLfo.start();

    // Voix sub (tension physique)
    this.tensionSubOsc = this.ctx.createOscillator();
    this.tensionSubGain = this.ctx.createGain();
    this.tensionSubOsc.type = 'triangle'; // Riche en harmoniques graves
    this.tensionSubOsc.frequency.value = 55.0; // A1, très profond
    this.tensionSubGain.gain.value = 0;

    this.tensionSubOsc.connect(this.tensionSubGain);
    this.tensionSubGain.connect(this.subMasterGain!);
    this.tensionSubOsc.start();

    // ═══════════════════════════════════════
    //  GRAVITÉ PULSÉE — Infrasons rythmiques
    // ═══════════════════════════════════════
    this.gravityOsc = this.ctx.createOscillator();
    this.gravityGain = this.ctx.createGain();
    this.gravityFilter = this.ctx.createBiquadFilter();
    this.gravityLfo = this.ctx.createOscillator();

    this.gravityOsc.type = 'sine';
    this.gravityOsc.frequency.value = 40; // Infrason pur
    this.gravityFilter.type = 'lowpass';
    this.gravityFilter.frequency.value = 80;
    this.gravityFilter.Q.value = 3.0; // Résonance poumon
    this.gravityLfo.type = 'sine';
    this.gravityLfo.frequency.value = 0.2; // Respiration lente
    this.gravityGain.gain.value = 0;

    this.gravityLfo.connect(this.gravityFilter.frequency);
    this.gravityOsc.connect(this.gravityFilter);
    this.gravityFilter.connect(this.gravityGain);
    this.gravityGain.connect(this.subMasterGain!);
    this.gravityOsc.start();
    this.gravityLfo.start();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createReverbImpulse(): AudioBuffer {
    if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    const rate = this.ctx.sampleRate;
    const length = rate * 2.5;
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2.5);
        data[i] = (Math.random() * 2 - 1) * decay * 0.5;
      }
    }
    return impulse;
  }

  private applyBreathEnvelope(
    gainNode: GainNode,
    peak: number,
    attack: number,
    release: number,
    time: number
  ) {
    if (!this.ctx) return;
    gainNode.gain.cancelScheduledValues(time);
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peak, time + attack);
    gainNode.gain.setTargetAtTime(0.0001, time + attack, release);
  }

  public playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number = 0.1,
    distortion: boolean = false,
    subLayer: boolean = false // ← NOUVEAU : ajouter une couche grave
  ) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq * 0.97, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);

    this.applyBreathEnvelope(gain, volume, 0.02, duration * 0.4, t);
    osc.connect(gain);

    if (distortion) {
      const dist = this.ctx.createWaveShaper();
      dist.curve = this.makeDistortionCurve(200);
      dist.oversample = '4x';
      gain.connect(dist);
      dist.connect(this.dryGain!);
      dist.connect(this.reverbNode!);
    } else {
      gain.connect(this.dryGain!);
      gain.connect(this.reverbNode!);
    }

    // Couche sub pour les impacts forts
    if (subLayer && this.subMasterGain) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.value = freq * 0.5; // Une octave en dessous
      this.applyBreathEnvelope(subGain, volume * 0.6, 0.05, duration * 0.6, t);
      subOsc.connect(subGain);
      subGain.connect(this.subMasterGain);
      subOsc.start(t);
      subOsc.stop(t + duration + 0.5);
    }

    osc.start(t);
    osc.stop(t + duration + 0.5);
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve as unknown as Float32Array<ArrayBuffer>;
  }

  // ═══════════════════════════════════════
  //  TENSION — Pad qui respire avec la densité
  // ═══════════════════════════════════════
  updateTension(density: number) {
    this.init();
    if (!this.tensionGain || !this.tensionOsc || !this.tensionLfo || !this.ctx) return;

    const vol = density > 0.05 ? Math.min(0.12, density * 0.12) : 0;
    const subVol = density > 0.1 ? Math.min(0.25, density * 0.2) : 0; // ← Sub plus fort
    const wobbleRate = 0.05 + density * 0.4;
    const filterBase = 180 + density * 400;

    const now = this.ctx.currentTime;
    const swellTime = vol > 0.01 ? 3.5 : 1.5;

    // Voix aérienne
    this.tensionGain.gain.setTargetAtTime(vol, now, swellTime);
    this.tensionLfo.frequency.setTargetAtTime(wobbleRate, now, 1.0);
    if (this.tensionFilter) {
      this.tensionFilter.frequency.setTargetAtTime(filterBase, now, 2.0);
    }
    const baseFreq = 110 + (density * 30);
    this.tensionOsc.frequency.setTargetAtTime(baseFreq, now, 3.0);

    // Voix sub (drone physique qui grandit)
    if (this.tensionSubGain && this.tensionSubOsc) {
      this.tensionSubGain.gain.setTargetAtTime(subVol, now, swellTime * 1.5);
      // Le sub descend quand la tension monte (inversion poétique)
      const subFreq = 55 - (density * 10); // 55Hz → 45Hz
      this.tensionSubOsc.frequency.setTargetAtTime(Math.max(30, subFreq), now, 4.0);
    }

    // Gravité pulsée s'active à haute densité
    if (this.gravityGain && this.gravityLfo) {
      const gravityVol = density > 0.3 ? Math.min(0.15, (density - 0.3) * 0.3) : 0;
      this.gravityGain.gain.setTargetAtTime(gravityVol, now, 2.0);
      this.gravityLfo.frequency.setTargetAtTime(0.2 + (density * 0.8), now, 1.0); // Pulse accélère
    }
  }

  // ═══════════════════════════════════════
  //  COMBO — Chœur qui monte + sub qui tremble
  // ═══════════════════════════════════════
  updateComboHum(combo: number) {
    this.init();
    if (!this.comboGain || !this.comboOsc || !this.comboFilter || !this.ctx) return;

    if (combo <= 1) {
      this.comboGain.gain.setTargetAtTime(0, this.ctx.currentTime, 1.2);
      this.comboOsc.frequency.setTargetAtTime(261.63, this.ctx.currentTime, 1.0);
      this.comboFilter.frequency.setTargetAtTime(600, this.ctx.currentTime, 1.0);
      if (this.comboSubGain) this.comboSubGain.gain.setTargetAtTime(0, this.ctx.currentTime, 1.5);
      return;
    }

    const volume = Math.min(0.1, combo * 0.006);
    const noteIndex = (combo - 1) % this.pentatonicC.length;
    const octaveShift = Math.floor((combo - 1) / 5);
    const freq = this.pentatonicC[noteIndex] * Math.pow(2, octaveShift);

    const now = this.ctx.currentTime;
    const filterOpen = 800 + (combo * 150);

    // Voix aérienne
    this.comboGain.gain.setTargetAtTime(volume, now, 0.4);
    this.comboOsc.frequency.setTargetAtTime(freq, now, 0.6);
    this.comboFilter.frequency.setTargetAtTime(Math.min(filterOpen, 6000), now, 0.8);

    // Voix sub (réponse physique au combo)
    if (this.comboSubOsc && this.comboSubGain) {
      const subNoteIndex = (combo - 1) % this.subPentatonic.length;
      const subOctave = Math.floor((combo - 1) / 3); // Monte plus vite que l'aigu
      const subFreq = this.subPentatonic[subNoteIndex] * Math.pow(2, subOctave);
      const subVol = Math.min(0.2, combo * 0.015); // Sub bien présent

      this.comboSubGain.gain.setTargetAtTime(subVol, now, 0.5);
      this.comboSubOsc.frequency.setTargetAtTime(Math.min(subFreq, 130), now, 0.8);
    }
  }

  // ═══════════════════════════════════════
  //  MOUVEMENT — Glissando spatial + sub directionnel
  // ═══════════════════════════════════════
  playMove(direction: 'left' | 'right' | 'up' | 'down' = 'right', intensity: number = 1) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Couche aérienne
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const scale = this.dorianD;
    const baseNote = scale[Math.floor(Math.random() * scale.length)];
    const baseFreq = 440 * Math.pow(2, (baseNote - 69) / 12);

    const interval = direction === 'left' ? 0.94 : direction === 'right' ? 1.06 : 1.0;
    const startFreq = baseFreq * (direction === 'up' ? 0.5 : direction === 'down' ? 2 : 1);
    const endFreq = baseFreq * interval * intensity;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(2000, t + 0.1);
    filter.frequency.linearRampToValueAtTime(400, t + 0.3);

    this.applyBreathEnvelope(gain, 0.06 * intensity, 0.03, 0.15, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.dryGain!);
    gain.connect(this.reverbNode!);
    osc.start(t);
    osc.stop(t + 0.6);

    // Couche sub (masse qui se déplace)
    if (this.subMasterGain) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();

      subOsc.type = 'triangle';
      const subBase = baseFreq * 0.25; // Deux octaves en dessous
      subOsc.frequency.setValueAtTime(subBase * 0.97, t);
      subOsc.frequency.exponentialRampToValueAtTime(subBase * interval, t + 0.4);

      subFilter.type = 'lowpass';
      subFilter.frequency.value = 150;
      subFilter.Q.value = 2.0;

      this.applyBreathEnvelope(subGain, 0.12 * intensity, 0.08, 0.3, t);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.subMasterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.8);
    }
  }

  // ═══════════════════════════════════════
  //  FRAPPE — Cristaux + gong profond
  // ═══════════════════════════════════════
  playType(char: string, xPos: number) {
    if (!char) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const scale = this.lydianC;
    const index = Math.abs(Math.floor(xPos)) % scale.length;
    const midiNote = scale[index];
    const charDust = (char.charCodeAt(0) % 7) * 0.3;
    const freq = midiNote + charDust;

    // Aigu — cristal
    this.playTone(freq, 'sine', 0.25, 0.07);
    setTimeout(() => this.playTone(freq * 1.498, 'triangle', 0.2, 0.035), 60);
    setTimeout(() => this.playTone(freq * 2, 'sine', 0.35, 0.02), 120);

    // Grave — gong subtil (tous les 3 caractères pour pas surcharger)
    if (char.charCodeAt(0) % 3 === 0 && this.subMasterGain) {
      const gongOsc = this.ctx.createOscillator();
      const gongGain = this.ctx.createGain();
      const gongFilter = this.ctx.createBiquadFilter();

      gongOsc.type = 'sine';
      gongOsc.frequency.value = freq * 0.25; // Très bas
      gongFilter.type = 'lowpass';
      gongFilter.frequency.value = 200;
      gongFilter.Q.value = 4.0;

      gongGain.gain.setValueAtTime(0, t);
      gongGain.gain.linearRampToValueAtTime(0.08, t + 0.05);
      gongGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      gongOsc.connect(gongFilter);
      gongFilter.connect(gongGain);
      gongGain.connect(this.subMasterGain);
      gongOsc.start(t);
      gongOsc.stop(t + 1.0);
    }
  }

  // ═══════════════════════════════════════
  //  PURGE — Accord + sub massif
  // ═══════════════════════════════════════
  playWipe(power: number, lang: string = 'NONE') {
    this.init();
    if (!this.ctx) return;

    const palettes: Record<string, { type: OscillatorType; root: number; mode: number[]; character: number }> = {
      'JavaScript': { type: 'square', root: 523.25, mode: [1, 1.2, 1.5, 2], character: 0.8 },
      'TypeScript': { type: 'square', root: 523.25, mode: [1, 1.25, 1.5, 1.875], character: 0.9 },
      'C++': { type: 'triangle', root: 65.41, mode: [1, 1.189, 1.498, 2], character: 0.3 },
      'C': { type: 'triangle', root: 65.41, mode: [1, 1.189, 1.498, 2], character: 0.3 },
      'Rust': { type: 'sine', root: 1046.5, mode: [1, 1.122, 1.498, 2], character: 1.0 },
      'Haskell': { type: 'sine', root: 1046.5, mode: [1, 1.122, 1.25, 1.498], character: 1.0 },
    };

    const palette = palettes[lang] || { type: 'triangle', root: 261.63, mode: [1, 1.25, 1.5, 2], character: 0.5 };

    // Arpège aigu
    palette.mode.forEach((interval, idx) => {
      setTimeout(() => {
        this.playTone(
          palette.root * interval,
          palette.type,
          0.5 + (idx * 0.1),
          0.08 * palette.character,
          palette.type === 'square'
        );
        if (palette.character > 0.8 && idx === palette.mode.length - 1) {
          setTimeout(() => this.playTone(palette.root * interval * 1.5, 'sine', 1.0, 0.03), 100);
        }
      }, idx * 80);
    });

    // Sub massif — fondement de l'accord
    if (this.subMasterGain) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();

      subOsc.type = 'sine';
      subOsc.frequency.value = palette.root * 0.25; // Deux octaves sous la racine

      subFilter.type = 'lowpass';
      subFilter.frequency.value = 120;
      subFilter.Q.value = 3.0;

      subGain.gain.setValueAtTime(0, this.ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.25 * palette.character, this.ctx.currentTime + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.subMasterGain);
      subOsc.start();
      subOsc.stop(this.ctx.currentTime + 3.5);
    }

    // Tension tombe
    if (this.tensionGain) {
      this.tensionGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.5);
    }
    if (this.tensionSubGain) {
      this.tensionSubGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.8);
    }

    // Pad de soulagement
    const reliefOsc = this.ctx.createOscillator();
    const reliefGain = this.ctx.createGain();
    const reliefFilter = this.ctx.createBiquadFilter();

    reliefOsc.type = 'sine';
    reliefOsc.frequency.setValueAtTime(palette.root / 4, this.ctx.currentTime);
    reliefOsc.frequency.exponentialRampToValueAtTime(palette.root / 2, this.ctx.currentTime + 2.0);

    reliefFilter.type = 'lowpass';
    reliefFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    reliefFilter.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 2.0);

    reliefGain.gain.setValueAtTime(0, this.ctx.currentTime);
    reliefGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
    reliefGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4.0);

    reliefOsc.connect(reliefFilter);
    reliefFilter.connect(reliefGain);
    reliefGain.connect(this.dryGain!);
    reliefGain.connect(this.reverbNode!);
    reliefOsc.start();
    reliefOsc.stop(this.ctx.currentTime + 4.5);
  }

  // ═══════════════════════════════════════
  //  SYMPHONIE — Cascade + orgue sub
  // ═══════════════════════════════════════
  playSymphonicWipe() {
    this.init();
    if (!this.ctx) return;

    const scale = this.lydianC;
    const t = this.ctx.currentTime;

    scale.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.8, 0.09);
        this.playTone(freq * 1.5, 'triangle', 0.7, 0.04);
        if (idx % 2 === 0) this.playTone(freq * 2, 'sine', 1.0, 0.025);
      }, idx * 120);
    });

    // Orgue sub — fondement symphonique
    if (this.subMasterGain) {
      const organOsc = this.ctx.createOscillator();
      const organGain = this.ctx.createGain();
      const organFilter = this.ctx.createBiquadFilter();

      organOsc.type = 'triangle';
      organOsc.frequency.value = 65.41; // C2

      organFilter.type = 'lowpass';
      organFilter.frequency.value = 300;
      organFilter.Q.value = 1.5;

      organGain.gain.setValueAtTime(0, t);
      organGain.gain.linearRampToValueAtTime(0.2, t + 1.5);
      organGain.gain.setTargetAtTime(0.001, t + 3.0, 2.0);

      organOsc.connect(organFilter);
      organFilter.connect(organGain);
      organGain.connect(this.subMasterGain);
      organOsc.start(t);
      organOsc.stop(t + 6.0);
    }

    if (this.tensionGain && this.tensionFilter) {
      this.tensionGain.gain.setTargetAtTime(0.08, t + 1.0, 2.0);
      this.tensionFilter.frequency.setTargetAtTime(2000, t + 1.0, 3.0);
    }
  }

  // ═══════════════════════════════════════
  //  IMPACT — Gouttes + tonnerre sub
  // ═══════════════════════════════════════
  playHit() {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const scale = this.aeolianA;
    const rootMidi = scale[Math.floor(Math.random() * scale.length)];
    const rootFreq = 440 * Math.pow(2, (rootMidi - 69) / 12);

    // Aigu
    this.playTone(rootFreq, 'sine', 0.3, 0.15);
    setTimeout(() => this.playTone(rootFreq * 1.189, 'triangle', 0.25, 0.08), 80);
    setTimeout(() => this.playTone(rootFreq * 1.498, 'sine', 0.4, 0.06), 160);
    setTimeout(() => this.playTone(rootFreq * 2, 'sine', 0.6, 0.03), 300);

    // Tonnerre sub (retardé, comme un écho de basse)
    if (this.subMasterGain) {
      setTimeout(() => {
        const thunderOsc = this.ctx!.createOscillator();
        const thunderGain = this.ctx!.createGain();
        const thunderFilter = this.ctx!.createBiquadFilter();

        thunderOsc.type = 'sine';
        thunderOsc.frequency.setValueAtTime(rootFreq * 0.2, this.ctx!.currentTime);
        thunderOsc.frequency.exponentialRampToValueAtTime(rootFreq * 0.15, this.ctx!.currentTime + 0.5);

        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.value = 100;
        thunderFilter.Q.value = 2.0;

        thunderGain.gain.setValueAtTime(0, this.ctx!.currentTime);
        thunderGain.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + 0.1);
        thunderGain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.5);

        thunderOsc.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(this.subMasterGain!);
        thunderOsc.start();
        thunderOsc.stop(this.ctx!.currentTime + 2.0);
      }, 100);
    }
  }

  // ═══════════════════════════════════════
  //  CHOC — Pluie de cristaux + séisme sub
  // ═══════════════════════════════════════
  playCrash() {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const scale = [50, 51, 54, 55, 58, 59, 62, 63];

    // Aigus chaos
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        this.playTone(freq, 'triangle', 0.2 + Math.random() * 0.2, 0.06);
        setTimeout(() => this.playTone(freq * 1.5, 'sine', 0.15, 0.03), 30 + Math.random() * 50);
      }, i * 70 + Math.random() * 40);
    }

    // Séisme sub (onde de choc)
    if (this.subMasterGain) {
      const quakeOsc = this.ctx.createOscillator();
      const quakeGain = this.ctx.createGain();
      const quakeFilter = this.ctx.createBiquadFilter();

      quakeOsc.type = 'sawtooth'; // Riche en harmoniques graves
      quakeOsc.frequency.setValueAtTime(40, t);
      quakeOsc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

      quakeFilter.type = 'lowpass';
      quakeFilter.frequency.setValueAtTime(200, t);
      quakeFilter.frequency.linearRampToValueAtTime(60, t + 1.0);
      quakeFilter.Q.value = 3.0;

      quakeGain.gain.setValueAtTime(0, t);
      quakeGain.gain.linearRampToValueAtTime(0.3, t + 0.15); // Fort !
      quakeGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

      quakeOsc.connect(quakeFilter);
      quakeFilter.connect(quakeGain);
      quakeGain.connect(this.subMasterGain);
      quakeOsc.start(t);
      quakeOsc.stop(t + 3.0);
    }
  }
}

export const sound = new SoundEngine();
