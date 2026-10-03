import { CITIES_DATABASE, GeoLocation, GlobeState, GlobeViewMode, SATELLITES_DATABASE } from '../types/earth';
import { geminiService } from './geminiService';
import { sound } from './soundEffects';
import { speech } from './speechService';

export interface VoiceCommandResult {
  spokenText: string;
  spokenTextUrdu?: string;
  logText: string;
  targetLocation?: GeoLocation;
  newMode?: GlobeViewMode;
  newZoom?: number;
  autoRotate?: boolean;
}

export class EarthVoiceController {
  public parseAndExecute(transcript: string, currentState: GlobeState): VoiceCommandResult {
    const raw = transcript.trim();
    const lower = raw.toLowerCase();

    // 1. URDU & ENGLISH CITY MATCHING
    for (const city of CITIES_DATABASE) {
      const matchEng = lower.includes(city.name.toLowerCase());
      const matchUrdu = raw.includes(city.nameUrdu);

      if (matchEng || matchUrdu) {
        sound.playExecuteSuccess();
        const spoken = `Target acquired: ${city.name}, ${city.country}. Coordinates locked at ${city.lat.toFixed(2)} degrees North, ${city.lng.toFixed(2)} degrees East. Local temperature is ${city.tempC} degrees Celsius.`;
        const spokenUrdu = `ہدف مل گیا: ${city.nameUrdu}، ${city.countryUrdu}۔ کوآرڈینیٹس لاک ہو گئے۔ درجہ حرارت ${city.tempC} سینٹی گریڈ ہے۔`;

        return {
          spokenText: spoken,
          spokenTextUrdu: spokenUrdu,
          logText: `[VOICE RECON] ${city.name} (${city.nameUrdu}) locked. Lat: ${city.lat}° | Lng: ${city.lng}° | Temp: ${city.tempC}°C`,
          targetLocation: city,
          newZoom: 1.6, // Zoom in closer on target city
        };
      }
    }

    // 2. ZOOM IN / ZOOM OUT COMMANDS
    if (lower.includes('zoom in') || lower.includes('closer') || raw.includes('زوم ان') || raw.includes('قریب') || raw.includes('بڑا کرو')) {
      sound.playChirp();
      const nextZoom = Math.max(1.3, currentState.targetZoom - 0.4);
      return {
        spokenText: 'Optical magnification increased. Approaching low planetary orbit.',
        spokenTextUrdu: 'زوم ان کر دیا گیا۔ ارتھ کا مائیکرو ویو کیمرہ فوکس ہو گیا۔',
        logText: `[CAMERA] Zoom in: ${(nextZoom * 100).toFixed(0)}% orbital altitude`,
        newZoom: nextZoom,
      };
    }

    if (lower.includes('zoom out') || lower.includes('far') || raw.includes('زوم آؤٹ') || raw.includes('دور') || raw.includes('پیچھے')) {
      sound.playChirp();
      const nextZoom = Math.min(3.2, currentState.targetZoom + 0.6);
      return {
        spokenText: 'Planetary wide-angle lens engaged. Full hemispheric surveillance active.',
        spokenTextUrdu: 'زوم آؤٹ کر دیا گیا۔ مکمل گلوب ویو بحال ہے۔',
        logText: `[CAMERA] Zoom out: ${(nextZoom * 100).toFixed(0)}% orbital altitude`,
        newZoom: nextZoom,
      };
    }

    // 3. ROTATION / MOTION COMMANDS
    if (lower.includes('stop') || lower.includes('halt') || lower.includes('pause') || raw.includes('روکو') || raw.includes('ٹھہرو') || raw.includes('بند کرو')) {
      sound.playBlip(700);
      return {
        spokenText: 'Planetary inertial spin halted. Position fixed.',
        spokenTextUrdu: 'ارتھ کی گردش روک دی گئی۔ پوزیشن فکس ہے۔',
        logText: '[ORBIT] Auto-rotation disabled.',
        autoRotate: false,
      };
    }

    if (lower.includes('rotate') || lower.includes('spin') || lower.includes('turn') || raw.includes('گھماؤ') || raw.includes('گھومیں') || raw.includes('حرکت')) {
      sound.playBlip(1200);
      return {
        spokenText: 'Planetary auto-rotation engaged at 0.18 degrees per second.',
        spokenTextUrdu: 'ارتھ کی گردش شروع کر دی گئی۔',
        logText: '[ORBIT] Auto-rotation engaged.',
        autoRotate: true,
      };
    }

    // 4. VIEW MODES (Holographic, Meteorology, Satellites, Photoreal)
    if (lower.includes('hologram') || lower.includes('holographic') || lower.includes('wireframe') || raw.includes('ہولوگرافک') || raw.includes('ہولوگرام')) {
      sound.playExecuteSuccess();
      return {
        spokenText: 'Switching to holographic quantum wireframe sensor matrix.',
        spokenTextUrdu: 'ہولوگرافک میٹرکس ویو تبدیل کر دیا گیا۔',
        logText: '[VIEW] Switched to Holographic Neon Shader.',
        newMode: 'holographic',
      };
    }

    if (lower.includes('weather') || lower.includes('meteorolog') || lower.includes('radar') || raw.includes('موسم') || raw.includes('ریڈار')) {
      sound.playExecuteSuccess();
      return {
        spokenText: 'Meteorological atmospheric stream overlay loaded. Monitoring jet streams.',
        spokenTextUrdu: 'موسمیاتی اور ایٹموسفیرک ریڈار چالو ہو گیا۔',
        logText: '[VIEW] Meteorological weather radar overlay active.',
        newMode: 'meteorology',
      };
    }

    if (lower.includes('satellite') || lower.includes('orbit') || raw.includes('سیٹلائٹ') || raw.includes('مدار')) {
      sound.playExecuteSuccess();
      return {
        spokenText: 'Orbital assets tracked: International Space Station, Starlink and Hubble trajectories visible.',
        spokenTextUrdu: 'سیٹلائٹ اور خلائی مدار کی ٹریکنگ چالو ہے۔',
        logText: '[VIEW] Orbital asset telemetry enabled.',
        newMode: 'satellites',
      };
    }

    if (lower.includes('normal') || lower.includes('reset') || lower.includes('photoreal') || raw.includes('عام') || raw.includes('ری سیٹ')) {
      sound.playBlip(1100);
      return {
        spokenText: 'Returning to natural photorealistic planetary projection.',
        spokenTextUrdu: 'عام اور قدرتی ارتھ پروجیکشن بحال کر دی گئی۔',
        logText: '[VIEW] Standard Photoreal Earth View loaded.',
        newMode: 'photoreal',
        newZoom: 2.2,
      };
    }

    // 5. Default General Geospatial Response
    const fallbackSpoken = `Planetary command received: "${raw}". Optical sensors aligned. Telemetry nominal.`;
    return {
      spokenText: fallbackSpoken,
      spokenTextUrdu: `کمانڈ موصول ہو گئی: "${raw}"۔ ارتھ کنٹرول سینسرز فعال ہیں۔`,
      logText: `[COMMAND DISPATCH] "${raw}" processed by TerraCommand Matrix.`,
    };
  }
}

export const earthVoiceController = new EarthVoiceController();
