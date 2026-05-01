class SoundEngine {
  private ctx: AudioContext | null = null;
  private comboOsc: OscillatorType | any = null;
  private comboGain: GainNode | null = null;
  private tensionOsc: OscillatorType | any = null;
  private tensionGain: GainNode | null = null;
  private tensionFilter: BiquadFilterNode | null = null;
  private tensionLfo: OscillatorNode | null = null;
  private tensionLfoGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup continuous combo hum
      this.comboOsc = this.ctx.createOscillator();
      this.comboGain = this.ctx.createGain();
      this.comboOsc.type = 'sawtooth';
      this.comboOsc.frequency.value = 40; // Base low hum
      this.comboGain.gain.value = 0; // Silent by default
      
      this.comboOsc.connect(this.comboGain);
      this.comboGain.connect(this.ctx.destination);
      this.comboOsc.start();
      
      this.tensionOsc = this.ctx.createOscillator();
      this.tensionGain = this.ctx.createGain();
      this.tensionOsc.type = 'sine'; // Smooth ambient tone
      this.tensionOsc.frequency.value = 110; // A2 note
      
      this.tensionFilter = this.ctx.createBiquadFilter();
      this.tensionFilter.type = 'lowpass';
      this.tensionFilter.Q.value = 0.5; // Very soft resonance

      this.tensionLfo = this.ctx.createOscillator();
      this.tensionLfo.type = 'sine';
      this.tensionLfo.frequency.value = 0.1; // Slow Wobble

      this.tensionLfoGain = this.ctx.createGain();
      this.tensionLfoGain.gain.value = 100; // soft Filter modulation depth

      // Connections for Wobble Pad
      this.tensionLfo.connect(this.tensionLfoGain);
      this.tensionLfoGain.connect(this.tensionFilter.frequency);
      
      this.tensionOsc.connect(this.tensionFilter);
      this.tensionFilter.connect(this.tensionGain);
      this.tensionGain.connect(this.ctx.destination);
      
      this.tensionOsc.start();
      this.tensionLfo.start();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, distortion: boolean = false) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    
    if (distortion) {
      const distParams = this.ctx.createWaveShaper();
      distParams.curve = this.makeDistortionCurve(400); // Heavy distortion
      gain.connect(distParams);
      distParams.connect(this.ctx.destination);
    } else {
      gain.connect(this.ctx.destination);
    }

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private makeDistortionCurve(amount: number) {
    let k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  }

  updateTension(density: number) {
    this.init();
    if (!this.tensionGain || !this.tensionOsc || !this.tensionLfo || !this.ctx) return;
    
    // Soft, evolving ambient pad, mute completely if very few enemies
    const vol = density > 0.05 ? Math.min(0.15, density * 0.15) : 0;
    const wobbleRate = 0.1 + (density * 0.3); // very slow and fluid speeds
    const filterBase = 150 + (density * 150); // gently opens filter
    
    if (this.tensionGain.gain.value < 0.01 && vol > 0.01) {
        this.tensionGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 4.0); // very smooth swell
    } else {
        this.tensionGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 2.0);
    }

    this.tensionLfo.frequency.setTargetAtTime(wobbleRate, this.ctx.currentTime, 0.5);
    if (this.tensionFilter) {
        this.tensionFilter.frequency.setTargetAtTime(filterBase, this.ctx.currentTime, 1.0);
    }
  }

  updateComboHum(combo: number) {
    this.init();
    if (!this.comboGain || !this.comboOsc || !this.ctx) return;
    
    // Smooth, evolving ambient drone instead of harsh saw buzz
    this.comboOsc.type = 'sine';
    if (combo <= 1) {
      this.comboGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      this.comboOsc.frequency.setTargetAtTime(130.81, this.ctx.currentTime, 0.5); // C3
    } else {
      const volume = Math.min(0.08, combo * 0.008);
      const pentatonic = [130.81, 146.83, 164.81, 196.00, 220.00]; // C D E G A
      const freq = pentatonic[(combo - 1) % pentatonic.length] * Math.pow(2, Math.floor((combo - 1) / 5)); // goes up octaves
      
      this.comboGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
      this.comboOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.5);
    }
  }

  playMove() {}

  playType(char: string, xPos: number) {
    if (!char) return;
    // Steve Reich / Philip Glass style: polyphonic marimba / pure synth
    const cMajorMidi = [48, 52, 55, 60, 62, 64, 67, 69, 72, 76, 79]; // Extended C major
    // X position determines the octave and note index!
    const index = Math.abs(xPos) % cMajorMidi.length;
    const midiNote = cMajorMidi[index];
    
    // Shift frequency slightly based on character for "phasing" (Reich signature)
    const charCodeInfo = char.charCodeAt(0) % 5;
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12) + (charCodeInfo * 0.5); // Microtonal phasing
    
    // Play main note
    this.playTone(freq, 'sine', 0.2, 0.08); // Glassy
    
    // Play harmonic a 5th above, delayed slightly (Glass / Reich polyrhythm)
    setTimeout(() => {
        const harmonicFreq = 440 * Math.pow(2, (midiNote + 7 - 69) / 12);
        this.playTone(harmonicFreq, 'sine', 0.15, 0.04);
    }, 50); // 50ms delay echo
  }

  playWipe(power: number, lang: string = 'NONE') {
    // Perfect chord / Arpeggio
    let toneType: OscillatorType = 'triangle';
    let root = 261.63; // C4
    let distortion = false;

    if (lang === 'JavaScript' || lang === 'TypeScript') {
       toneType = 'square';
       distortion = true;
       root = 523.25; // High glitchy C5
    } else if (lang === 'C++' || lang === 'C') {
       toneType = 'sawtooth';
       distortion = true;
       root = 65.41; // Deep Sub bass C2
    } else if (lang === 'Rust' || lang === 'Haskell') {
       toneType = 'sine'; // Pure crystalline
       root = 1046.50; // C6
    } else if (lang.includes('Hyper') || lang.includes('Quantum')) {
       toneType = 'triangle';
       root = 440;
    }

    this.playTone(root, toneType, 0.5, 0.1, distortion);
    setTimeout(() => this.playTone(root * 1.25, toneType, 0.4, 0.1, distortion), 50); // E
    setTimeout(() => this.playTone(root * 1.5, toneType, 0.3, 0.1, distortion), 100); // G
    if (power > 5) setTimeout(() => this.playTone(root * 2, toneType, 0.4, 0.1, distortion), 150); // C octave
    
    // Soothing effect: Suppress tension instantly, then slowly bring it back
    if (this.ctx && this.tensionGain) {
        this.tensionGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        
        // Very soothing ambient pad mixed in
        const pad = this.ctx.createOscillator();
        const padGain = this.ctx.createGain();
        pad.type = 'sine';
        pad.frequency.value = root / 2; // Deep bass
        padGain.gain.setValueAtTime(0, this.ctx.currentTime);
        padGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 1.0);
        padGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4.0);
        
        pad.connect(padGain);
        padGain.connect(this.ctx.destination);
        pad.start();
        pad.stop(this.ctx.currentTime + 4.0);
    }
  }

  playHit() {
    this.init();
    if (!this.ctx) return;
    const notes = [60, 62, 63, 65, 67, 68, 70]; // minor scale
    const root = notes[Math.floor(Math.random() * notes.length)];
    this.playTone(440 * Math.pow(2, (root - 69) / 12), 'sine', 0.2, 0.2);
    setTimeout(() => this.playTone(440 * Math.pow(2, ((root+3) - 69) / 12), 'triangle', 0.2, 0.1), 100);
    setTimeout(() => this.playTone(440 * Math.pow(2, ((root+7) - 69) / 12), 'sine', 0.3, 0.1), 200);
  }

  playCrash() {
    this.init();
    if (!this.ctx) return;
    const scale = [50, 52, 53, 55, 57, 58, 60, 62];
    for (let i=0; i<8; i++) {
        setTimeout(() => {
            const note = scale[Math.floor(Math.random() * scale.length)];
            this.playTone(440 * Math.pow(2, (note - 69) / 12), 'triangle', 0.15, 0.1);
        }, i * 100);
    }
  }
}


export const sound = new SoundEngine();
