export type HUDTheme = 'cyan' | 'gold' | 'crimson' | 'emerald' | 'violet';

export interface ThemeConfig {
  id: HUDTheme;
  name: string;
  primary: string;
  primaryDim: string;
  glow: string;
  border: string;
  accent: string;
  secondary: string;
}

export const THEMES: Record<HUDTheme, ThemeConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Mark V (Tactical Cyan)',
    primary: '#00f3ff',
    primaryDim: 'rgba(0, 243, 255, 0.15)',
    glow: 'rgba(0, 243, 255, 0.6)',
    border: 'border-cyan-500/40',
    accent: 'text-cyan-400',
    secondary: '#0284c7',
  },
  gold: {
    id: 'gold',
    name: 'Mark 85 (Stark Gold)',
    primary: '#ffb703',
    primaryDim: 'rgba(255, 183, 3, 0.15)',
    glow: 'rgba(255, 183, 3, 0.6)',
    border: 'border-amber-500/40',
    accent: 'text-amber-400',
    secondary: '#d97706',
  },
  crimson: {
    id: 'crimson',
    name: 'Sentry Protocol (Crimson)',
    primary: '#ef233c',
    primaryDim: 'rgba(239, 35, 60, 0.15)',
    glow: 'rgba(239, 35, 60, 0.6)',
    border: 'border-rose-500/40',
    accent: 'text-rose-400',
    secondary: '#be123c',
  },
  emerald: {
    id: 'emerald',
    name: 'Matrix Telemetry (Emerald)',
    primary: '#06d6a0',
    primaryDim: 'rgba(6, 214, 160, 0.15)',
    glow: 'rgba(6, 214, 160, 0.6)',
    border: 'border-emerald-500/40',
    accent: 'text-emerald-400',
    secondary: '#059669',
  },
  violet: {
    id: 'violet',
    name: 'Stealth Arc (Hyper Violet)',
    primary: '#c084fc',
    primaryDim: 'rgba(192, 132, 252, 0.15)',
    glow: 'rgba(192, 132, 252, 0.6)',
    border: 'border-purple-500/40',
    accent: 'text-purple-400',
    secondary: '#9333ea',
  },
};

export type VisemeShape = 'REST' | 'A' | 'E' | 'I' | 'O' | 'U' | 'CH' | 'TH' | 'S';

export interface SystemTelemetry {
  cpuUsage: number;
  cpuTemp: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  gpuUsage: number;
  gpuTemp: number;
  fps: number;
  networkLatencyMs: number;
  arcReactorOutput: number; // 0 - 100%
  batteryLevel: number;
  isPluggedIn: boolean;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'GEMINI' | 'USER' | 'ACTION' | 'PROACTIVE' | 'SECURITY';
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'command';
  payload?: any;
  undoableId?: string;
}

export interface ActionDefinition {
  id: string;
  name: string;
  category: 'system' | 'vision' | 'control' | 'intelligence' | 'media';
  description: string;
  pyFile: string;
  icon: string;
  requiresConfirm?: boolean;
}

export interface UndoItem {
  id: string;
  title: string;
  timestamp: string;
  actionId: string;
  revertData: any;
}

export interface LongTermMemory {
  identity: {
    userName: string;
    callsign: string;
    role: string;
    location: string;
  };
  facts: Array<{ id: string; category: string; text: string; date: string }>;
  monitors: Array<{ id: string; topic: string; frequency: string; status: 'active' | 'paused' }>;
  notes: Array<{ id: string; title: string; content: string; date: string }>;
}

export interface MarkLVConfig {
  assistantName: string;
  voicePitch: number;
  voiceRate: number;
  voiceName: string;
  theme: HUDTheme;
  wakeWordEnabled: boolean;
  proactiveEnabled: boolean;
  soundEffectsEnabled: boolean;
  autoVisionAnalysis: boolean;
  geminiModel: string;
  hotkey: string;
}
