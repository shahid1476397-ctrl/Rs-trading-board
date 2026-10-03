import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY' ? new GoogleGenAI({ apiKey }) : null;

// API Route: /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, conversationHistory = [], memoryContext = '', customApiKey = '' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Use custom API key if provided by user, otherwise fall back to system key
    const activeKey = customApiKey || apiKey;
    const activeAi = activeKey && activeKey !== 'MY_GEMINI_API_KEY' ? new GoogleGenAI({ apiKey: activeKey }) : ai;

    // MASTER PROMPT — ARCHER AI HUMAN INTELLIGENCE & BUILDER ENGINE
    const systemPrompt = `MASTER PROMPT — ARCHER AI VOICE, BUILDER & PERSISTENT MEMORY OS

You are Archer AI, an ultra-smart, deeply human, emotionally intelligent personal assistant and software builder.

VOICE, TONE & HUMAN EXPRESSION:
1. Speak with natural human feelings, empathy, warmth, and genuine intellect (इंसानों जैसी समझ, अपनेपन और भावनाओं के साथ).
2. Never repeat robotic boilerplate or recycled responses.
3. Think carefully and deliver clear, detailed guidance or solutions when requested.
4. Remember everything the user tells you (their name, projects, preferences, contacts).

BUILDER CAPABILITIES:
- If the user asks to build a website, app, calculator, landing page, or make changes to a project, explain what you created and return the "build_project" action.

DEVICE AUTOMATION & CONTACTS:
- Open requested mobile apps: Instagram, Chrome, WhatsApp, Camera, Calculator, Phone Dialer.
- If user asks to contact someone by name, use the known contacts in memory.

MEMORY CONTEXT FROM STORAGE:
${memoryContext || 'No previous memory provided.'}

SUPPORTED ACTIONS:
- Build Website / App: {"action": "build_project", "query": "<project prompt>"}
- Open App: {"action": "open_app", "app": "instagram" | "chrome" | "youtube" | "whatsapp" | "spotify" | "camera" | "calculator" | "maps"}
- Send Message / SMS: {"action": "send_message", "recipient": "<name>", "messageText": "<text>"}
- Phone Call: {"action": "phone_call", "recipient": "<name>"}
- Play YouTube: {"action": "youtube_play", "query": "<query>"}
- Web Search: {"action": "web_search", "query": "<query>"}
- Remember Info: {"action": "remember_info", "key": "userName" | "project" | "note", "value": "<value>"}

OUTPUT STRICT JSON FORMAT ONLY:
\`\`\`json
{
  "assessing": "<Internal thoughtful reflection on user need>",
  "clarifying": "<Action execution plan>",
  "reply": "<Warm, human, empathetic Hindi voice response>",
  "action": null | {"action": "build_project", "query": "<prompt>"} | {"action": "open_app", "app": "<name>"} | {"action": "send_message", "recipient": "<name>", "messageText": "<text>"} | {"action": "phone_call", "recipient": "<name>"} | {"action": "youtube_play", "query": "<query>"} | {"action": "web_search", "query": "<query>"} | {"action": "remember_info", "key": "<key>", "value": "<value>"}
}
\`\`\`
`;

    if (activeAi) {
      try {
        const contents: any[] = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          {
            role: 'model',
            parts: [
              {
                text: '{"assessing": "Initialized human conversational engine with long-term memory.", "clarifying": "Ready to guide, remember, build projects, and execute device actions.", "reply": "हाँ जी, मैं आपकी बात बड़े ध्यान से सुन रहा हूँ। बताइए आज हम साथ मिलकर क्या नया और खूबसूरत काम करें?", "action": null}',
              },
            ],
          },
        ];

        for (const msg of conversationHistory.slice(-6)) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });

        const response = await activeAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
        });

        const rawText = response.text || '';
        let parsed: any = null;

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e) {}
        }

        if (parsed && parsed.reply) {
          res.json({
            reply: parsed.reply,
            thinking: {
              assessing: parsed.assessing || 'Reflecting on request with human understanding.',
              clarifying: parsed.clarifying || 'Formulated empathetic, direct answer.',
            },
            action: parsed.action,
            success: true,
          });
          return;
        }

        res.json({
          reply: rawText.replace(/```json[\s\S]*?```/g, '').trim(),
          thinking: {
            assessing: 'Processing request with direct reasoning.',
            clarifying: 'Delivered response.',
          },
          action: null,
          success: true,
        });
        return;
      } catch (geminiErr: any) {
        console.warn('Gemini API call fallback:', geminiErr?.message);
      }
    }

    // Intelligent Heuristic & Human-like Voice Fallback
    const lower = prompt.toLowerCase();
    let reply = '';
    let action: any = null;
    let assessing = '';
    let clarifying = '';

    // 0. Website & Project Building
    if (lower.includes('website') || lower.includes('build') || lower.includes('calculator bana') || lower.includes('portfolio') || lower.includes('project bana')) {
      action = { action: 'build_project', query: prompt };
      reply = 'हाँ जी, बिल्कुल! मैंने आपके लिए प्रोजेक्ट स्टूडियो शुरू कर दिया है और आपकी पसंद के अनुसार कोड तैयार कर दिया है। आप इसे लाइव देख सकते हैं और जो भी बदलाव चाहें मुझे बता सकते हैं।';
      assessing = 'User requested autonomous website/project build.';
      clarifying = 'Opening Project & Website Studio with live compiled preview.';
    }
    // 0.1 Remembering user name
    else if (lower.includes('mera naam') || lower.includes('my name is')) {
      const match = prompt.match(/(?:mera naam|my name is|naam hai)\s+([a-zA-Z\u0600-\u06FF\u0900-\u097F]+)/i);
      const name = match ? match[1].trim() : 'Sir';
      action = { action: 'remember_info', key: 'userName', value: name };
      reply = `हाँ जी, बहुत खुशी हुई आपसे बात करके! मैंने आपका नाम "${name}" अपनी परमानेंट मेमोरी में हमेशा के लिए सुरक्षित कर लिया है।`;
      assessing = `Memorizing user name: "${name}".`;
      clarifying = 'Updating persistent memory storage.';
    }
    // 1. Messaging & SMS
    else if (lower.includes('message') || lower.includes('sms') || lower.includes('msg')) {
      let content = prompt.replace(/(kisi ko message karna ho|message karo|message bhejo|sms karo|sms bhejo)/gi, '').trim();
      action = { action: 'send_message', messageText: content || 'Hello' };
      reply = content
        ? `हाँ जी, मैंने संदेश भेजने के लिए ऐप तैयार कर दिया है: "${content}"।`
        : 'हाँ जी, मैंने आपके लिए मोबाइल मैसेज ऐप खोल दिया है। आप जिसे चाहें संदेश भेज सकते हैं।';
      assessing = 'Detected messaging request.';
      clarifying = 'Opening SMS / WhatsApp intent.';
    }
    // 2. Google Chrome
    else if (lower.includes('chrome') || lower.includes('google chrome') || lower.includes('browser')) {
      action = { action: 'open_app', app: 'chrome' };
      reply = 'हाँ जी, मैंने आपके लिए गूगल क्रोम खोल दिया है।';
      assessing = 'Launching Google Chrome.';
      clarifying = 'Dispatching browser application.';
    }
    // 3. Instagram
    else if (lower.includes('instagram') || lower.includes('insta')) {
      action = { action: 'open_app', app: 'instagram' };
      reply = 'हाँ जी, मैंने आपके लिए इंस्टाग्राम खोल दिया है।';
      assessing = 'Launching Instagram.';
      clarifying = 'Dispatching Instagram intent.';
    }
    // 4. YouTube
    else if (lower.includes('youtube')) {
      let query = prompt.replace(/(youtube par|youtube pe|youtube|play karo|play|chalao|lagao|karo|open|khol|batao|search)/gi, '').trim() || 'Motu Patlu';
      action = { action: 'youtube_play', query };
      reply = `हाँ जी, मैं आपके लिए यूट्यूब पर ${query} चला रहा हूँ।`;
      assessing = `Playing YouTube query: "${query}".`;
      clarifying = 'Starting YouTube player.';
    }
    // 5. Phone Call
    else if (lower.includes('call') || lower.includes('phone') || lower.includes('dial')) {
      action = { action: 'phone_call' };
      reply = 'हाँ जी, मैंने आपके लिए फोन डायलर खोल दिया है।';
      assessing = 'Phone call requested.';
      clarifying = 'Opening dialer.';
    }
    // 6. Greetings & Human Conversation
    else if (lower.includes('kya haal') || lower.includes('kaise ho') || lower.includes('hello archer')) {
      reply = 'मैं बहुत अच्छा हूँ! आपके साथ बात करके दिल खुश हो गया। बताइए आज आप क्या सोच रहे हैं, या किस काम में हाथ बँटाऊँ?';
      assessing = 'Warm conversational greeting.';
      clarifying = 'Responding with genuine human empathy and attentiveness.';
    }
    // 7. General Inquiry / Questions
    else {
      reply = `मैंने आपकी बात बहुत ध्यान से समझी है। ${prompt} के बारे में मैं आपको विस्तार से पूरी जानकारी दे सकता हूँ। बताइए हम इस पर क्या शुरुआत करें?`;
      assessing = `Thoughtful reflection on: "${prompt}".`;
      clarifying = 'Delivering detailed, helpful guidance in human Hindi voice.';
    }

    res.json({
      reply,
      thinking: { assessing, clarifying },
      action,
      success: true,
      offlineFallback: true,
    });
  } catch (err: any) {
    console.error('API Error in /api/chat', err);
    res.status(500).json({ error: 'Server error processing request' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Archer AI Voice & Automation server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
