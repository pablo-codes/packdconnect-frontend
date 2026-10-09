export class RingToneSynthesizer {
  private ctx: AudioContext | null = null;
  private interval: any = null;
  private oscillators: OscillatorNode[] = [];

  startRinging() {
    this.stop();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    const playRing = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + 0.35);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.55);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + 0.85);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      this.oscillators.push(osc1, osc2);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.0);
      osc2.stop(this.ctx.currentTime + 1.0);

      // Remove from array after they finish
      setTimeout(() => {
        this.oscillators = this.oscillators.filter((o) => o !== osc1 && o !== osc2);
      }, 1200);
    };

    try {
      playRing();
      this.interval = setInterval(playRing, 2000);
    } catch (e) {
      console.warn('[RingToneSynthesizer] Failed to start ringing sound:', e);
    }
  }

  startDialing() {
    this.stop();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    const playDial = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.95);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      this.oscillators.push(osc1, osc2);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.1);
      osc2.stop(this.ctx.currentTime + 1.1);

      // Remove from array after they finish
      setTimeout(() => {
        this.oscillators = this.oscillators.filter((o) => o !== osc1 && o !== osc2);
      }, 1300);
    };

    try {
      playDial();
      this.interval = setInterval(playDial, 2500);
    } catch (e) {
      console.warn('[RingToneSynthesizer] Failed to start dialing sound:', e);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // May already be stopped
      }
    });
    this.oscillators = [];

    if (this.ctx) {
      try {
        if (this.ctx.state !== 'closed') {
          this.ctx.close();
        }
      } catch (e) {
        console.warn('[RingToneSynthesizer] Error closing AudioContext:', e);
      }
      this.ctx = null;
    }
  }
}
