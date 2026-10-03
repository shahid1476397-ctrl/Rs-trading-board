import React from 'react';
import { AutomationIntent } from '../services/appAutomationService';
import { X, ExternalLink, ArrowLeft, Smartphone, MessageSquare, PhoneCall, Play } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface AutomationOverlayProps {
  intent: AutomationIntent | null;
  onClose: () => void;
}

export const AutomationOverlay: React.FC<AutomationOverlayProps> = ({ intent, onClose }) => {
  if (!intent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md h-[90vh] bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Top Header Bar */}
        <div className="px-4 py-2.5 bg-black border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playBlip(700);
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white uppercase text-[11px]">
                {intent.appName || 'DEVICE AUTOMATION'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={intent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 transition-all font-bold flex items-center gap-1 text-[10px]"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Direct Link</span>
            </a>
            <button
              onClick={() => {
                sound.playBlip(700);
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-black flex flex-col overflow-hidden relative">
          {/* 1. SEND MESSAGE / SMS / WHATSAPP AUTOMATION */}
          {intent.type === 'send_message' && (
            <div className="flex-1 flex flex-col justify-between p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-2xl mx-auto mt-2">
                💬
              </div>

              <div className="space-y-2">
                <div className="text-lg font-bold text-white font-sans">
                  Message Dispatch Ready
                </div>
                <p className="text-slate-400 font-sans text-xs max-w-xs mx-auto leading-relaxed">
                  Archer AI has prepared your message. Select whether to send via SMS or WhatsApp:
                </p>

                {intent.messageText && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 text-xs font-sans italic mx-auto max-w-xs">
                    "{intent.messageText}"
                  </div>
                )}
              </div>

              {/* Action Buttons: SMS and WhatsApp */}
              <div className="w-full space-y-2">
                <a
                  href={`sms:?body=${encodeURIComponent(intent.messageText || '')}`}
                  className="w-full py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via SMS 📱</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(intent.messageText || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Send via WhatsApp 💬</span>
                </a>

                <button
                  onClick={() => {
                    sound.playBlip(700);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* 2. PHONE CALL AUTOMATION */}
          {intent.type === 'phone_call' && (
            <div className="flex-1 flex flex-col justify-between p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center text-4xl shadow-2xl mx-auto mt-2">
                📞
              </div>

              <div className="space-y-2">
                <div className="text-lg font-bold text-white font-sans">
                  Phone Dialer Opened
                </div>
                <p className="text-slate-400 font-sans text-xs max-w-xs mx-auto leading-relaxed">
                  Archer AI has launched the phone dialer.
                </p>
              </div>

              <div className="w-full space-y-2">
                <a
                  href="tel:"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Open Phone Dialer 📞</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 text-slate-300 font-bold text-xs"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* 3. YOUTUBE PLAY AUTOMATION */}
          {intent.type === 'youtube_play' && (
            <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video shadow-lg">
                <iframe
                  title="YouTube Player"
                  src={`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(intent.query || 'motu patlu')}&autoplay=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">YOUTUBE AUTOMATION</span>
                  <span className="text-[10px] text-rose-400 font-bold uppercase">Playing Live</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Playing search results for: <span className="font-bold text-cyan-300 font-mono">"{intent.query}"</span>
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href={intent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open YouTube App 📱</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 4. INSTAGRAM, CHROME OR OTHER APP OPEN */}
          {intent.type === 'open_app' && (
            <div className="flex-1 flex flex-col items-center justify-between p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-4xl shadow-2xl mt-4">
                {intent.app === 'instagram'
                  ? '📸'
                  : intent.app === 'chrome'
                  ? '🌐'
                  : intent.app === 'whatsapp'
                  ? '💬'
                  : intent.app === 'spotify'
                  ? '🎧'
                  : '📱'}
              </div>

              <div className="space-y-2">
                <div className="text-lg font-bold text-white font-sans">
                  {intent.appName} Opened!
                </div>
                <p className="text-slate-400 font-sans text-xs max-w-xs leading-relaxed">
                  Archer AI has launched <span className="text-white font-bold">{intent.appName}</span> on your mobile device.
                </p>
                <div className="px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] inline-flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>APP DISPATCH NOMINAL</span>
                </div>
              </div>

              {/* Direct Open Action Button */}
              <div className="w-full space-y-2">
                <a
                  href={intent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Launch {intent.appName} Now</span>
                </a>

                <button
                  onClick={() => {
                    sound.playBlip(700);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Back to Archer AI
                </button>
              </div>
            </div>
          )}

          {/* 5. WEB SEARCH */}
          {intent.type === 'web_search' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Search Query</span>
                  <div className="text-cyan-300 font-bold text-sm mt-1">{intent.query}</div>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-slate-800 text-slate-300 text-xs font-sans leading-relaxed">
                  Archer AI has executed web research for this topic. Click below to view live results or articles.
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={intent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Google Search Results</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-2xl bg-slate-900 text-slate-400 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
