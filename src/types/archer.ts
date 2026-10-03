export type ArcherThemeId = 'archer-legacy' | 'neon-void' | 'solar-amber' | 'electric-cyan' | 'crimson-neon';

export interface ArcherTheme {
  id: ArcherThemeId;
  name: string;
  orbColorHex: string;
  orbColorNum: number;
  glowColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
}

export const ARCHER_THEMES: Record<ArcherThemeId, ArcherTheme> = {
  'archer-legacy': {
    id: 'archer-legacy',
    name: 'Archer Legacy',
    orbColorHex: '#00f3ff',
    orbColorNum: 0x00f3ff,
    glowColor: 'rgba(0, 243, 255, 0.45)',
    accentBg: 'bg-cyan-500',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-300',
  },
  'neon-void': {
    id: 'neon-void',
    name: 'Neon Void',
    orbColorHex: '#b5179e',
    orbColorNum: 0xb5179e,
    glowColor: 'rgba(181, 23, 158, 0.45)',
    accentBg: 'bg-fuchsia-600',
    borderColor: 'border-fuchsia-500',
    textColor: 'text-fuchsia-400',
  },
  'solar-amber': {
    id: 'solar-amber',
    name: 'Solar Amber',
    orbColorHex: '#ff9e00',
    orbColorNum: 0xff9e00,
    glowColor: 'rgba(255, 158, 0, 0.45)',
    accentBg: 'bg-amber-500',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
  },
  'electric-cyan': {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    orbColorHex: '#00b4d8',
    orbColorNum: 0x00b4d8,
    glowColor: 'rgba(0, 180, 216, 0.45)',
    accentBg: 'bg-sky-500',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-400',
  },
  'crimson-neon': {
    id: 'crimson-neon',
    name: 'Crimson Neon',
    orbColorHex: '#e63946',
    orbColorNum: 0xe63946,
    glowColor: 'rgba(230, 57, 70, 0.45)',
    accentBg: 'bg-rose-600',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
  },
};

export interface ThinkingSteps {
  assessing: string;
  clarifying: string;
}

export interface ArcherChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  thinking?: ThinkingSteps;
}

export interface PixelAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  deskX: number;
  deskY: number;
  talkingTo?: string;
}
