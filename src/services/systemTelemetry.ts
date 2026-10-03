import { SystemTelemetry } from '../types/marklv';

export type TelemetryListener = (telemetry: SystemTelemetry) => void;

class TelemetryService {
  private current: SystemTelemetry = {
    cpuUsage: 28,
    cpuTemp: 44,
    memoryUsedGB: 9.4,
    memoryTotalGB: 32.0,
    gpuUsage: 36,
    gpuTemp: 52,
    fps: 60,
    networkLatencyMs: 14,
    arcReactorOutput: 88,
    batteryLevel: 94,
    isPluggedIn: true,
  };

  private listeners: Set<TelemetryListener> = new Set();
  private intervalId: number | null = null;
  private fpsCounter: number = 60;
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;

  constructor() {
    this.startTracking();
  }

  public subscribe(cb: TelemetryListener): () => void {
    this.listeners.add(cb);
    cb(this.current);
    return () => this.listeners.delete(cb);
  }

  public getTelemetry(): SystemTelemetry {
    return { ...this.current };
  }

  public setArcReactorOutput(output: number) {
    this.current.arcReactorOutput = Math.max(10, Math.min(100, output));
    this.notify();
  }

  public spikeCPU(amount: number = 30) {
    this.current.cpuUsage = Math.min(99, this.current.cpuUsage + amount);
    this.current.cpuTemp = Math.min(85, this.current.cpuTemp + Math.round(amount * 0.2));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.current));
  }

  private startTracking() {
    // Measure actual requestAnimationFrame FPS
    const measureFPS = () => {
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFrameTime >= 1000) {
        this.fpsCounter = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.current.fps = this.fpsCounter;
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      requestAnimationFrame(measureFPS);
    };
    if (typeof window !== 'undefined') {
      requestAnimationFrame(measureFPS);
    }

    // Interval to gently oscillate metrics and check browser memory if supported
    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(() => {
        // Read real performance memory if available (Chrome)
        const perf = window.performance as any;
        if (perf && perf.memory) {
          const used = perf.memory.usedJSHeapSize / (1024 * 1024 * 1024);
          const total = perf.memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
          this.current.memoryUsedGB = +(used * 8 + 6.2).toFixed(1); // Scaled to realistic OS metric
          this.current.memoryTotalGB = 32.0;
        }

        // Realistic organic fluctuations
        const cpuDelta = (Math.random() - 0.48) * 4;
        this.current.cpuUsage = Math.max(12, Math.min(96, +(this.current.cpuUsage + cpuDelta).toFixed(1)));
        this.current.cpuTemp = Math.max(38, Math.min(78, +(40 + this.current.cpuUsage * 0.35).toFixed(1)));

        const gpuDelta = (Math.random() - 0.5) * 5;
        this.current.gpuUsage = Math.max(18, Math.min(94, +(this.current.gpuUsage + gpuDelta).toFixed(1)));
        this.current.gpuTemp = Math.max(45, Math.min(82, +(48 + this.current.gpuUsage * 0.3).toFixed(1)));

        const netDelta = (Math.random() - 0.5) * 3;
        this.current.networkLatencyMs = Math.max(8, Math.min(45, Math.round(this.current.networkLatencyMs + netDelta)));

        this.notify();
      }, 1200);
    }
  }

  public destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const telemetryService = new TelemetryService();
