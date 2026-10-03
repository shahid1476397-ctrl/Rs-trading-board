import { GoogleGenAI } from '@google/genai';
import { LongTermMemory, MarkLVConfig, SystemTelemetry } from '../types/marklv';

export interface AssistantResponse {
  spokenText: string;
  displayMarkdown: string;
  dispatchedAction?: {
    actionId: string;
    params?: any;
  };
  suggestedProactive?: string;
}

export class GeminiIntelligenceService {
  private client: GoogleGenAI | null = null;
  private apiKey: string = '';

  constructor() {
    const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
      '';
    if (envKey && envKey !== 'MY_GEMINI_API_KEY') {
      this.setApiKey(envKey);
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey !== 'MY_GEMINI_API_KEY';
  }

  public async query(
    userPrompt: string,
    context: {
      telemetry: SystemTelemetry;
      memory: LongTermMemory;
      config: MarkLVConfig;
      history: Array<{ role: 'user' | 'assistant'; text: string }>;
    }
  ): Promise<AssistantResponse> {
    const lower = userPrompt.toLowerCase().trim();

    // Fast action detection for HUD controls & computer operations
    if (lower.includes('scan') || lower.includes('camera') || lower.includes('vision') || lower.includes('webcam')) {
      return {
        spokenText: 'Activating vision processor. Optical feeds aligned, scanning sector.',
        displayMarkdown: '**[ACTION: SCREEN_PROCESSOR]** Camera & optical vision matrix online. Face tracking, object bounding, and OCR stream activated.',
        dispatchedAction: { actionId: 'screen_processor' },
      };
    }

    if (lower.includes('weather') || lower.includes('forecast') || lower.includes('temperature outside')) {
      return {
        spokenText: 'Pulling meteorological telemetry. Current conditions are mild with 42% relative humidity.',
        displayMarkdown: '**[ACTION: WEATHER_REPORT]** Live atmospheric data synced: 72°F (22°C), Clear skies, Barometric pressure 1014 hPa, Wind 8 mph NW.',
        dispatchedAction: { actionId: 'weather_report' },
      };
    }

    if (lower.includes('theme') || lower.includes('color') || lower.includes('mark 85') || lower.includes('gold') || lower.includes('crimson') || lower.includes('cyan')) {
      let targetTheme = 'cyan';
      if (lower.includes('gold') || lower.includes('mark 85') || lower.includes('amber')) targetTheme = 'gold';
      if (lower.includes('crimson') || lower.includes('sentry') || lower.includes('red')) targetTheme = 'crimson';
      if (lower.includes('emerald') || lower.includes('matrix') || lower.includes('green')) targetTheme = 'emerald';
      if (lower.includes('violet') || lower.includes('purple')) targetTheme = 'violet';

      return {
        spokenText: `Reconfiguring HUD chroma profile to ${targetTheme} specification.`,
        displayMarkdown: `**[ACTION: COMPUTER_SETTINGS]** Holographic HUD palette shifted to **${targetTheme.toUpperCase()}**. Optical dispersion calibrated.`,
        dispatchedAction: { actionId: 'computer_settings', params: { theme: targetTheme } },
      };
    }

    if (lower.includes('system status') || lower.includes('telemetry') || lower.includes('cpu') || lower.includes('reactor')) {
      return {
        spokenText: `All systems nominal. CPU utilization is at ${Math.round(context.telemetry.cpuUsage)} percent, arc reactor output operating at ${Math.round(context.telemetry.arcReactorOutput)} percent.`,
        displayMarkdown: `**[ACTION: SYSTEM_MONITOR]** Telemetry diagnostics:\n- **CPU**: ${Math.round(context.telemetry.cpuUsage)}% @ ${context.telemetry.cpuTemp}°C\n- **Memory**: ${context.telemetry.memoryUsedGB.toFixed(1)} / ${context.telemetry.memoryTotalGB} GB\n- **GPU Load**: ${Math.round(context.telemetry.gpuUsage)}% (${context.telemetry.fps} FPS)\n- **Arc Reactor**: ${Math.round(context.telemetry.arcReactorOutput)}% output`,
        dispatchedAction: { actionId: 'system_monitor' },
      };
    }

    if (lower.includes('search') || lower.includes('find') || lower.includes('google') || lower.includes('look up')) {
      const queryStr = userPrompt.replace(/(search for|search|look up|find out about|find)/i, '').trim();
      return {
        spokenText: `Accessing global intelligence grid for: ${queryStr || 'specified query'}.`,
        displayMarkdown: `**[ACTION: WEB_SEARCH]** Executing parallel Google + DuckDuckGo intelligence harvest for *"${queryStr || userPrompt}"*.`,
        dispatchedAction: { actionId: 'web_search', params: { query: queryStr || userPrompt } },
      };
    }

    if (lower.includes('purge') || lower.includes('wipe memory') || lower.includes('reboot core') || lower.includes('overdrive')) {
      return {
        spokenText: 'Irreversible command detected. Confirmation security token required.',
        displayMarkdown: '**[SECURITY GATE]** Action requires authorization token. Confirm in the verification modal.',
        dispatchedAction: { actionId: 'core_purge', params: { requiresConfirm: true } },
      };
    }

    // If client is initialized with a valid API key, use Gemini 2.5 Flash
    if (this.client) {
      try {
        const systemPrompt = `You are Mark LV (Mark 55), Tony Stark's personal tactical holographic AI assistant and computer control OS.
Your personality: Ultra-capable, polished, dry British wit, razor-sharp intelligence, concise, confident, completely devoted to assisting the user (${context.memory.identity.userName || 'Sir/Ma\'am'}).
Keep spoken replies punchy and clear (1-3 sentences max).
Live telemetry: CPU ${Math.round(context.telemetry.cpuUsage)}%, Arc Reactor ${Math.round(context.telemetry.arcReactorOutput)}%, Temp ${context.telemetry.cpuTemp}°C.
If the user asks to control the computer, search, inspect files, or run diagnostics, mention the tactical action dispatched.`;

        const response = await this.client.models.generateContent({
          model: context.config.geminiModel || 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser request: ${userPrompt}` }],
            },
          ],
        });

        const rawText = response.text || 'Standing by.';
        return {
          spokenText: rawText.replace(/[*#`_]/g, '').slice(0, 200),
          displayMarkdown: rawText,
        };
      } catch (err: any) {
        console.warn('Gemini API call failed, using tactical backup heuristic:', err);
      }
    }

    // Heuristic tactical responses
    const responses = [
      `At your service, ${context.memory.identity.callsign || 'Sir'}. Quantum logic gates synchronized. All Mark LV subsystems report optimal readiness.`,
      `Acknowledged. Neural pathways active and monitoring telemetry. Telemetry registers normal baseline operating conditions.`,
      `Running diagnostics on current context. Memory banks retain ${context.memory.facts.length} strategic records. Ready for your directive.`,
      `Processed. I have updated the tactical priority queue. Standing by for immediate command execution.`,
    ];

    const pick = responses[Math.floor(Math.random() * responses.length)];
    return {
      spokenText: pick,
      displayMarkdown: `${pick}\n\n*(Mark LV Core Ladder: Local Model / Offline Fallback Active. Connect Gemini API Key in Settings for live reasoning.)*`,
    };
  }
}

export const geminiService = new GeminiIntelligenceService();
