import { memory } from './memoryService';

// Service for mobile app launching, SMS/WhatsApp messaging, calls, search, and device automation

export interface AutomationIntent {
  type: 'open_app' | 'youtube_play' | 'web_search' | 'research' | 'open_url' | 'send_message' | 'phone_call' | 'build_project' | 'remember_info';
  app?: string;
  appName?: string;
  recipient?: string;
  messageText?: string;
  query?: string;
  url?: string;
  deepLink?: string;
  embedType?: 'youtube' | 'web' | 'app' | 'sms' | 'project';
  embedUrl?: string;
  spokenConfirmation: string;
}

export const APP_REGISTRY: Record<string, { name: string; url: string; deepLink: string; icon: string }> = {
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com',
    deepLink: 'instagram://app',
    icon: '📸',
  },
  chrome: {
    name: 'Google Chrome',
    url: 'https://www.google.com',
    deepLink: 'googlechrome://',
    icon: '🌐',
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com',
    deepLink: 'googlechrome://',
    icon: '🔍',
  },
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    deepLink: 'youtube://',
    icon: '▶️',
  },
  whatsapp: {
    name: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    deepLink: 'whatsapp://',
    icon: '💬',
  },
  message: {
    name: 'Messages (SMS)',
    url: 'sms:',
    deepLink: 'sms:',
    icon: '💬',
  },
  sms: {
    name: 'Messages (SMS)',
    url: 'sms:',
    deepLink: 'sms:',
    icon: '📩',
  },
  phone: {
    name: 'Phone / Dialer',
    url: 'tel:',
    deepLink: 'tel:',
    icon: '📞',
  },
  call: {
    name: 'Phone / Dialer',
    url: 'tel:',
    deepLink: 'tel:',
    icon: '📞',
  },
  facebook: {
    name: 'Facebook',
    url: 'https://www.facebook.com',
    deepLink: 'fb://',
    icon: '👥',
  },
  tiktok: {
    name: 'TikTok',
    url: 'https://www.tiktok.com',
    deepLink: 'snssdk1233://',
    icon: '🎵',
  },
  twitter: {
    name: 'X (Twitter)',
    url: 'https://www.x.com',
    deepLink: 'twitter://',
    icon: '🐦',
  },
  x: {
    name: 'X (Twitter)',
    url: 'https://www.x.com',
    deepLink: 'twitter://',
    icon: '✖️',
  },
  spotify: {
    name: 'Spotify',
    url: 'https://open.spotify.com',
    deepLink: 'spotify://',
    icon: '🎧',
  },
  gmail: {
    name: 'Gmail',
    url: 'https://mail.google.com',
    deepLink: 'googlegmail://',
    icon: '✉️',
  },
  maps: {
    name: 'Google Maps',
    url: 'https://maps.google.com',
    deepLink: 'googlemaps://',
    icon: '🗺️',
  },
  calculator: {
    name: 'Calculator',
    url: 'https://www.google.com/search?q=calculator',
    deepLink: 'calculator://',
    icon: '🧮',
  },
  camera: {
    name: 'Camera',
    url: 'https://webcamtests.com',
    deepLink: 'camera://',
    icon: '📷',
  },
  browser: {
    name: 'Web Browser',
    url: 'https://www.google.com',
    deepLink: 'https://www.google.com',
    icon: '🌐',
  },
};

export class AppAutomationService {
  /**
   * Strictly parses user command so Archer opens ONLY what the user asks for
   */
  public parseCommand(prompt: string): AutomationIntent | null {
    const text = prompt.toLowerCase().trim();

    // 0. Website & Project Building Command ("website banao", "build website", "calculator banao", "portfolio banao", "change karo")
    if (
      text.includes('website bana') ||
      text.includes('build website') ||
      text.includes('project bana') ||
      text.includes('calculator bana') ||
      text.includes('portfolio bana') ||
      text.includes('landing page') ||
      text.includes('app bana') ||
      text.includes('build app') ||
      text.includes('code karo') ||
      text.includes('change kar')
    ) {
      return {
        type: 'build_project',
        appName: 'Archer Project & Code Studio',
        query: prompt,
        embedType: 'project',
        spokenConfirmation: 'हाँ जी, मैंने आपके लिए प्रोजेक्ट बिल्ड स्टूडियो खोल दिया है और कोड तैयार कर रहा हूँ।',
      };
    }

    // 0.1 Name Memory Command ("mera naam [X] hai", "naam yaad rakho")
    if (text.includes('mera naam') || text.includes('naam yaad')) {
      const match = prompt.match(/(?:mera naam|my name is|naam hai)\s+([a-zA-Z\u0600-\u06FF\u0900-\u097F]+)/i);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        memory.setUserName(extractedName);
        return {
          type: 'remember_info',
          query: extractedName,
          spokenConfirmation: `हाँ जी, मैंने याद रख लिया है कि आपका नाम ${extractedName} है। मैं हमेशा याद रखूँगा।`,
        };
      }
    }

    // 0.2 Specific Contact Calling & Messaging ("Ali ko call karo", "Ahmed ko message karo")
    const contacts = memory.getProfile().contacts;
    for (const c of contacts) {
      if (text.includes(c.name.toLowerCase())) {
        if (text.includes('call') || text.includes('phone')) {
          return {
            type: 'phone_call',
            app: 'phone',
            appName: `Call ${c.name}`,
            recipient: c.name,
            url: `tel:${c.phone}`,
            deepLink: `tel:${c.phone}`,
            spokenConfirmation: `हाँ जी, मैं ${c.name} को कॉल मिला रहा हूँ।`,
          };
        }
        if (text.includes('message') || text.includes('sms') || text.includes('msg')) {
          let content = text
            .replace(new RegExp(`(${c.name.toLowerCase()}|ko|message|sms|bhejo|karo)`, 'gi'), '')
            .trim();
          const encoded = encodeURIComponent(content || 'Hello');
          return {
            type: 'send_message',
            app: 'message',
            appName: `Message ${c.name}`,
            recipient: c.name,
            messageText: content || 'Hello',
            url: `sms:${c.phone}?body=${encoded}`,
            deepLink: `sms:${c.phone}?body=${encoded}`,
            spokenConfirmation: `हाँ जी, मैंने ${c.name} को मैसेज भेजने के लिए ऐप खोल दिया है।`,
          };
        }
      }
    }

    // 1. Messaging & SMS Command (e.g. "kisi ko message karna ho", "message bhejo", "SMS karo", "WhatsApp message bhejo")
    if (
      text.includes('message') ||
      text.includes('sms') ||
      text.includes('msg') ||
      text.includes('bhejo') ||
      text.includes('kisi ko message')
    ) {
      // Extract optional message content
      let content = text
        .replace(/(kisi ko message karna ho|kisi ko message karo|message karo|message bhejo|sms karo|sms bhejo|whatsapp par message karo|whatsapp message karo)/gi, '')
        .trim();

      const encoded = encodeURIComponent(content || 'Hello from Archer AI');
      return {
        type: 'send_message',
        app: 'message',
        appName: 'Messages (SMS / WhatsApp)',
        messageText: content || 'Hello',
        url: `sms:?body=${encoded}`,
        deepLink: `sms:?body=${encoded}`,
        embedType: 'sms',
        spokenConfirmation: content
          ? `हाँ जी, मैंने मैसेज ऐप खोल दिया है: "${content}" भेजने के लिए।`
          : 'हाँ जी, मैंने आपके लिए मोबाइल मैसेज ऐप खोल दिया है।',
      };
    }

    // 2. Phone Call Command (e.g. "call karo", "phone milao")
    if (text.includes('call karo') || text.includes('phone milao') || text.includes('dial karo')) {
      return {
        type: 'phone_call',
        app: 'phone',
        appName: 'Phone Dialer',
        url: 'tel:',
        deepLink: 'tel:',
        spokenConfirmation: 'हाँ जी, मैंने फोन डायलर खोल दिया है।',
      };
    }

    // 3. YouTube Play Command (e.g. "YouTube par Motu Patlu play karo", "YouTube chalao")
    if (
      text.includes('youtube') &&
      (text.includes('play') ||
        text.includes('chalao') ||
        text.includes('lagao') ||
        text.includes('search') ||
        text.includes('open') ||
        text.includes('khol') ||
        text.includes('karo'))
    ) {
      let query = text
        .replace(/(youtube par|youtube pe|youtube|play karo|play|chalao|lagao|karo|open|khol|batao|search)/gi, '')
        .trim();
      if (!query || query === 'par' || query === 'pe') query = 'Motu Patlu';

      const encoded = encodeURIComponent(query);
      return {
        type: 'youtube_play',
        app: 'youtube',
        appName: 'YouTube',
        query,
        url: `https://www.youtube.com/results?search_query=${encoded}`,
        deepLink: `youtube://results?search_query=${encoded}`,
        embedType: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encoded}`,
        spokenConfirmation: `हाँ जी, मैं आपके लिए यूट्यूब पर ${query} चला रहा हूँ।`,
      };
    }

    // 4. Chrome / Web Browser Command (e.g. "Chrome open karo", "Google kholo")
    if (text.includes('chrome') || text.includes('google chrome') || text.includes('browser')) {
      return {
        type: 'open_app',
        app: 'chrome',
        appName: 'Google Chrome',
        url: 'https://www.google.com',
        deepLink: 'googlechrome://',
        embedType: 'app',
        embedUrl: 'https://www.google.com',
        spokenConfirmation: 'हाँ जी, मैंने आपके लिए गूगल क्रोम खोल दिया है।',
      };
    }

    // 5. Instagram Open Command (e.g. "Instagram open karo", "Instagram kholo")
    if (text.includes('instagram') || text.includes('insta')) {
      return {
        type: 'open_app',
        app: 'instagram',
        appName: 'Instagram',
        url: 'https://www.instagram.com',
        deepLink: 'instagram://app',
        embedType: 'app',
        embedUrl: 'https://www.instagram.com',
        spokenConfirmation: 'हाँ जी, मैंने आपके लिए इंस्टाग्राम खोल दिया है।',
      };
    }

    // 6. Direct App Open Check from Registry (WhatsApp, Spotify, Camera, Calculator, etc.)
    for (const [key, appInfo] of Object.entries(APP_REGISTRY)) {
      if (
        text.includes(key) &&
        (text.includes('open') ||
          text.includes('kholo') ||
          text.includes('khol') ||
          text.includes('start') ||
          text.includes('chalao') ||
          text.includes('karo') ||
          text.startsWith(key))
      ) {
        return {
          type: 'open_app',
          app: key,
          appName: appInfo.name,
          url: appInfo.url,
          deepLink: appInfo.deepLink,
          embedType: 'app',
          embedUrl: appInfo.url,
          spokenConfirmation: `हाँ जी, मैंने आपके लिए ${appInfo.name} खोल दिया है।`,
        };
      }
    }

    // 7. Web Search / Research command (e.g. "Google search karo...", "Research on...")
    if (
      text.includes('search') ||
      text.includes('google') ||
      text.includes('research') ||
      text.includes('dhoondo') ||
      text.includes('talash')
    ) {
      const query = text
        .replace(/(google search karo|google search|search karo|search|research karo|research|dhoondo|talash karo)/gi, '')
        .trim();
      if (query) {
        const encoded = encodeURIComponent(query);
        return {
          type: 'web_search',
          query,
          url: `https://www.google.com/search?q=${encoded}`,
          deepLink: `https://www.google.com/search?q=${encoded}`,
          embedType: 'web',
          spokenConfirmation: `हाँ जी, मैंने ${query} के बारे में सर्च कर दिया है।`,
        };
      }
    }

    return null;
  }

  /**
   * Executes the automation by triggering mobile deep link dispatch
   */
  public executeIntent(intent: AutomationIntent): void {
    try {
      const targetUrl = intent.deepLink || intent.url || 'https://google.com';

      // 1. Dispatch custom protocol / mobile scheme (e.g. instagram://, sms:, tel:, googlechrome://)
      if (typeof window !== 'undefined') {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile && intent.deepLink) {
          try {
            window.location.href = intent.deepLink;
          } catch {}
        }
      }

      // 2. Click hidden anchor fallback for desktop / web browser
      const link = document.createElement('a');
      link.href = intent.url || intent.deepLink || 'https://google.com';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('App intent dispatch handled inside container', e);
    }
  }
}

export const appAutomation = new AppAutomationService();
