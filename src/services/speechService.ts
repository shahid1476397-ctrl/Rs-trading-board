import { VisemeShape } from '../types/marklv';

export type VisemeCallback = (shape: VisemeShape, intensity: number) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private isMuted: boolean = false; // User controls mute explicitly ("जब तक मैं म्यूट पर न लगाऊं, ये म्यूट पर न लगे")
  private visemeListeners: Set<VisemeCallback> = new Set();
  private visemeInterval: number | null = null;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private restartTimeout: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis || null;
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        // Natural Hindi / Hinglish recognition matching the video
        this.recognition.lang = 'hi-IN';
      }
      if (this.synth) {
        this.synth.onvoiceschanged = () => {
          this.synth?.getVoices();
        };
      }
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopListening();
      this.stopSpeaking();
    } else {
      if (this.onResultCallback) {
        this.startListening(this.onResultCallback);
      }
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public onViseme(cb: VisemeCallback): () => void {
    this.visemeListeners.add(cb);
    return () => this.visemeListeners.delete(cb);
  }

  private emitViseme(shape: VisemeShape, intensity: number) {
    this.visemeListeners.forEach(cb => cb(shape, intensity));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public cancel(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    if (this.visemeInterval) clearInterval(this.visemeInterval);
    this.isSpeaking = false;
    this.emitViseme('REST', 0);
  }

  public speak(
    text: string,
    options?: { pitch?: number; rate?: number; voiceName?: string; onEnd?: () => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Pause listening while speaking to prevent self-echo
      if (this.recognition && this.isListening) {
        try {
          this.recognition.stop();
        } catch {}
      }

      this.synth.cancel();
      try {
        this.synth.resume();
      } catch {}
      if (this.visemeInterval) clearInterval(this.visemeInterval);

      // Strip code blocks, markdown tags, JSON blocks before vocalizing
      let cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[*_#`[\]()]/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.volume = 1.0;
      utterance.pitch = options?.pitch ?? 0.96;
      utterance.rate = options?.rate ?? 1.0;

      const voices = this.synth.getVoices();

      // Find natural Hindi voice matching the video ("جیسی اس کی آواز ہے ویسے میرے آرچر کی آواز ہونی چاہیے، وہ بھی ہندی میں")
      const hindiVoice = voices.find(v => 
        v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.startsWith('hi') ||
        v.name.includes('Hindi') || v.name.includes('हिन्दी') || v.name.includes('Lekha') || v.name.includes('Neerja') || v.name.includes('Swara')
      ) || voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('ur')) || voices[0];

      if (options?.voiceName) {
        const found = voices.find(v => v.name === options.voiceName);
        if (found) utterance.voice = found;
      } else if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = hindiVoice.lang || 'hi-IN';
      } else {
        utterance.lang = 'hi-IN';
      }

      const shapes: VisemeShape[] = ['A', 'E', 'O', 'I', 'U', 'CH', 'S'];
      let step = 0;
      let keepAliveInterval: number | null = null;

      utterance.onstart = () => {
        this.isSpeaking = true;
        keepAliveInterval = window.setInterval(() => {
          if (this.synth?.speaking) {
            try { this.synth.pause(); this.synth.resume(); } catch {}
          }
        }, 10000);

        this.visemeInterval = window.setInterval(() => {
          step++;
          if (step % 4 === 0) {
            this.emitViseme('REST', 0.2);
          } else {
            const nextShape = shapes[step % shapes.length];
            const intensity = 0.4 + Math.random() * 0.6;
            this.emitViseme(nextShape, intensity);
          }
        }, 85);
      };

      const finishSpeech = () => {
        this.isSpeaking = false;
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (this.visemeInterval) clearInterval(this.visemeInterval);
        this.emitViseme('REST', 0);

        if (options?.onEnd) options.onEnd();

        // AUTOMATIC RESUME LISTENING (UNLESS USER EXPLICITLY MUTED)
        // "जब तक मैं म्यूट पर न लगाऊं, ये म्यूट पर न लगे। जब मैं म्यूट लगाऊं तब ये म्यूट करे वरना ये मुझसे बात करता रहे"
        if (!this.isMuted && this.onResultCallback) {
          window.setTimeout(() => {
            if (!this.isMuted && !this.isSpeaking) {
              this.startListening(this.onResultCallback!);
            }
          }, 350);
        }

        resolve();
      };

      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.visemeInterval) clearInterval(this.visemeInterval);
    this.isSpeaking = false;
    this.emitViseme('REST', 0);
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ): boolean {
    this.onResultCallback = onResult;

    if (this.isMuted) {
      return false;
    }

    if (!this.recognition) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      } else {
        return false;
      }
    }

    try {
      this.recognition.lang = 'hi-IN';

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          onResult(final, true);
        } else if (interim) {
          onResult(interim, false);
        }
      };

      this.recognition.onerror = (e: any) => {
        this.isListening = false;
        if (onError) onError(e);

        // Auto restart if not muted and not speaking (continuous conversation)
        if (!this.isMuted && !this.isSpeaking && this.onResultCallback) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = window.setTimeout(() => {
            if (!this.isMuted && !this.isSpeaking && this.onResultCallback) {
              this.startListening(this.onResultCallback);
            }
          }, 600);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;

        // Auto restart if not muted and not speaking (keeps conversation alive continuously)
        if (!this.isMuted && !this.isSpeaking && this.onResultCallback) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = window.setTimeout(() => {
            if (!this.isMuted && !this.isSpeaking && this.onResultCallback) {
              this.startListening(this.onResultCallback);
            }
          }, 300);
        }
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      this.isListening = false;
      return false;
    }
  }

  public stopListening() {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public getStatus() {
    return {
      hasRecognition: !!this.recognition,
      hasSynthesis: !!this.synth,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isMuted: this.isMuted,
    };
  }
}

export const speech = new SpeechService();
