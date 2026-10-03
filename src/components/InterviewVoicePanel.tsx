import React, { useState, useRef, useEffect } from 'react';
import { brain, ChatMessage } from '../services/geminiBrainService';
import { speech } from '../services/speechService';
import { sound } from '../services/soundEffects';
import { Mic, MicOff, Send, Sparkles, Volume2, Bot, User, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface InterviewVoicePanelProps {
  currentCityName: string;
  onExecuteAction?: (action: any) => void;
}

const URDU_SUGGESTIONS = [
  'آپ اپنے بارے میں بتائیں اور آپ کیا کر سکتے ہیں؟',
  'کراچی کی تزویراتی اہمیت اور موسم بتائیں',
  'یہ کام یاد رکھو کہ شام 5 بجے سیٹلائٹ ٹریک کرنا ہے',
  'ٹوکیو کی طرف کیمرہ گھماؤ اور تفصیل دو',
  'میرے کون کون سے ٹاسکس باقی ہیں؟',
];

export const InterviewVoicePanel: React.FC<InterviewVoicePanelProps> = ({
  currentCityName,
  onExecuteAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: 'السلام علیکم! میں ٹیرام کمانڈ اے آئی (جمنی آرٹیفیشل انٹیلیجنس) ہوں۔ آپ مجھ سے جو بھی بات کریں گے، میں یاد رکھوں گا، آپ کے ٹاسکس محفوظ کروں گا، اور ارتھ کو آپ کے حکم پر کنٹرول کروں گا۔ فرمائیے، میں کیا مدد کروں؟',
      time: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Voice speech synthesis for AI responses in Urdu
  const speakAIResponse = async (text: string) => {
    setIsSpeaking(true);
    // Remove markdown symbols
    const cleanText = text.replace(/[*_#`[\]()]/g, '').trim();
    await speech.speak(cleanText, {
      pitch: 0.95,
      rate: 1.05,
      onEnd: () => setIsSpeaking(false),
    });
    setIsSpeaking(false);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isProcessing) return;

    sound.playBlip(1200);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await brain.queryGemini(trimmed, messages, currentCityName);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: response.reply,
        time: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);

      // Execute action if returned (e.g. fly to city, zoom, etc.)
      if (response.action && onExecuteAction) {
        onExecuteAction(response.action);
      }

      // Speak back the response in Urdu!
      speakAIResponse(response.reply);
    } catch (e) {
      setIsProcessing(false);
      sound.playAlert();
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      speech.stopListening();
      setIsListening(false);
      sound.playBlip(700);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } else {
      sound.playBlip(1200);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 50]);
      }
      const ok = speech.startListening(
        (transcript, isFinal) => {
          if (isFinal) {
            setIsListening(false);
            handleSendMessage(transcript);
          }
        },
        (err) => {
          console.warn('Speech error', err);
          setIsListening(false);
        }
      );
      if (ok) {
        setIsListening(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/60 border border-slate-800/80 rounded-xl backdrop-blur-md overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-orbitron">
              GEMINI BRAIN INTERVIEW (انٹرویو و گفتگو)
            </h2>
            <span className="text-[10px] text-cyan-400 font-sans" dir="rtl">
              اردو بولنے اور یاد رکھنے والا سمارٹ جمنی اسسٹنٹ
            </span>
          </div>
        </div>

        {/* Live Audio Status */}
        <div className="flex items-center gap-1.5">
          {isSpeaking && (
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 rounded text-[10px] flex items-center gap-1 animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>جمنی بول رہا ہے...</span>
            </span>
          )}
          {isListening && (
            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-bold border border-rose-800 rounded text-[10px] flex items-center gap-1 animate-ping">
              <Mic className="w-3 h-3" />
              <span>سن رہا ہے...</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user'
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-cyan-950 border-cyan-700 text-cyan-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-950/70 border border-cyan-700 text-cyan-100 text-right'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-100 text-right'
              }`}
              dir="rtl"
            >
              <div className="text-[10px] text-slate-400 mb-1 font-mono text-left" dir="ltr">
                {msg.time}
              </div>
              <div className="text-xs sm:text-sm whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs p-2 bg-black/40 rounded-lg border border-slate-800 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>جمنی سوچ رہا ہے اور معلومات پروسیس کر رہا ہے...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Urdu Suggestions Chips */}
      <div className="p-2 border-t border-slate-800/80 bg-black/40">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" dir="rtl">
          {URDU_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[11px] whitespace-nowrap transition-all font-sans active:scale-95"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Voice & Input Controls Footer */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        {/* Large Tactile Mic Button for Urdu Interview Voice */}
        <button
          onClick={toggleListening}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/60'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-950'
          }`}
          title="مائیکروفون پر کلک کر کے اردو میں بولیں"
        >
          <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
        </button>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex-1 flex gap-1.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اردو میں بات کریں یا کوئی کام / ٹاسک یاد رکھنے کے لیے کہیں..."
            className="flex-1 px-3 py-2 bg-black border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans text-right"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
