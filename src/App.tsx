import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ARCHER_THEMES,
  ArcherChatMessage,
  ArcherTheme,
  ArcherThemeId,
} from './types/archer';
import { CITIES_DATABASE, GeoLocation } from './types/earth';
import { sound } from './services/soundEffects';
import { speech } from './services/speechService';
import { brain } from './services/geminiBrainService';
import { appAutomation, AutomationIntent, APP_REGISTRY } from './services/appAutomationService';
import { memory, BuiltProject } from './services/memoryService';
import { websiteBuilder } from './services/websiteBuilderService';

// Components
import { ParticleOrb } from './components/ParticleOrb';
import { NodeConnectorWires } from './components/NodeConnectorWires';
import { AgentTown } from './components/AgentTown';
import { LeftSystemPanel } from './components/LeftSystemPanel';
import { RightVoicePanel } from './components/RightVoicePanel';
import { ArcherNodeModal } from './components/ArcherNodeModal';
import { ArcherMobileHero } from './components/ArcherMobileHero';
import { AutomationOverlay } from './components/AutomationOverlay';
import { InteractiveGlobe } from './components/InteractiveGlobe';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ProjectStudioModal } from './components/ProjectStudioModal';
import { PermissionsAndApiModal } from './components/PermissionsAndApiModal';

// Icons
import {
  Globe2,
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  LayoutDashboard,
  MessageSquare,
  Mic,
  MicOff,
  Code,
  ShieldCheck,
  FolderKanban,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState<ArcherThemeId>('archer-legacy');
  const [isSystemActive, setIsSystemActive] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // MUTE STATE (User controls mute explicitly; never auto-mutes unless user clicks Mute)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [liveTranscription, setLiveTranscription] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastSpokenText, setLastSpokenText] = useState<string>(
    'Hello! I am Archer AI, your personal voice assistant and autonomous software builder. How may I assist you today?'
  );

  // Project Studio & Live Code Builder Modal
  const [isProjectStudioOpen, setIsProjectStudioOpen] = useState<boolean>(false);
  const [activeProject, setActiveProject] = useState<BuiltProject | null>(memory.getLatestProject() || null);

  // Permissions & API Key Setup Modal
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);

  // Active App Automation Intent (Instagram, Chrome, Messages/SMS, YouTube, etc.)
  const [activeAutomation, setActiveAutomation] = useState<AutomationIntent | null>(null);

  // Mobile Tasks list
  const [tasks, setTasks] = useState([
    { id: 't_1', title: 'Upload video in YouTube', completed: false },
    { id: 't_2', title: 'Build interactive web project', completed: true },
    { id: 't_3', title: 'Verify mobile app permissions', completed: true },
  ]);

  // Active Node Configuration Modal (MEMORY, SKILLS, SOUL, SETTING)
  const [activeNodeModal, setActiveNodeModal] = useState<'MEMORY' | 'SKILLS' | 'SOUL' | 'SETTING' | null>(null);

  // Stage Mode: 'orb' | 'earth'
  const [centerMode, setCenterMode] = useState<'orb' | 'earth'>('orb');

  // Mobile View Mode: 'hero' (Exact Video Screen) | 'dashboard' (Agent Town 3-Col) | 'chat'
  const [mobileView, setMobileView] = useState<'hero' | 'dashboard' | 'chat'>('hero');

  // Earth coordinates
  const [targetLat, setTargetLat] = useState<number>(40.7128);
  const [targetLng, setTargetLng] = useState<number>(-74.0060);
  const [targetZoom, setTargetZoom] = useState<number>(2.2);
  const [selectedCity, setSelectedCity] = useState<GeoLocation | null>(CITIES_DATABASE[2]);

  // Initial Message in English & Natural Voice
  const [messages, setMessages] = useState<ArcherChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      text: 'Hello! I am Archer AI, your personal voice assistant, device automation hub, and autonomous software builder. What would you like to create or control today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thinking: {
        assessing:
          'Autonomous builder, device automation, and continuous listening loop active.',
        clarifying:
          'Ready for voice commands: "Build a website", "Open Instagram", "Open Chrome", "Message Ali", or ask any question.',
      },
    },
  ]);

  const currentTheme = ARCHER_THEMES[currentThemeId];
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  // Voice speech synthesis in natural voice
  const speakNaturalResponse = useCallback(async (text: string) => {
    setIsSpeaking(true);
    setLastSpokenText(text);
    await speech.speak(text, {
      pitch: 0.96,
      rate: 1.0,
      onEnd: () => {
        setIsSpeaking(false);
      },
    });
    setIsSpeaking(false);
  }, []);

  // Handle User Message (typed or spoken) + PRECISE AUTOMATION & PROJECT BUILDING
  const handleSendMessage = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isThinking) return;

    sound.playBlip(1200);
    setLiveTranscription('');

    // 1. Strict Local Automation Parser
    const localIntent = appAutomation.parseCommand(trimmed);

    const userMsg: ArcherChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // If local intent recognized immediately, trigger right away!
    if (localIntent) {
      if (localIntent.type === 'build_project') {
        const built = websiteBuilder.generateWebsite(trimmed, activeProject || undefined);
        setActiveProject(built);
        setIsProjectStudioOpen(true);
      } else {
        setActiveAutomation(localIntent);
        appAutomation.executeIntent(localIntent);
      }
    }

    try {
      const res = await brain.queryGemini(trimmed, messages, selectedCity?.name || 'New York, USA');

      // Check if response contains an action (Project Building, SMS, App, YouTube, etc.)
      if (res.action) {
        if (res.action.action === 'build_project') {
          const built = websiteBuilder.generateWebsite(res.action.query || trimmed, activeProject || undefined);
          setActiveProject(built);
          setIsProjectStudioOpen(true);
        } else if (res.action.action === 'remember_info' && res.action.key === 'userName' && res.action.value) {
          memory.setUserName(res.action.value);
        } else if (res.action.action === 'send_message') {
          const content = res.action.messageText || '';
          const intent: AutomationIntent = {
            type: 'send_message',
            app: 'message',
            appName: 'Messages (SMS / WhatsApp)',
            messageText: content,
            url: `sms:?body=${encodeURIComponent(content)}`,
            deepLink: `sms:?body=${encodeURIComponent(content)}`,
            spokenConfirmation: res.reply,
          };
          setActiveAutomation(intent);
          appAutomation.executeIntent(intent);
        } else if (res.action.action === 'phone_call') {
          const intent: AutomationIntent = {
            type: 'phone_call',
            app: 'phone',
            appName: 'Phone Dialer',
            url: 'tel:',
            deepLink: 'tel:',
            spokenConfirmation: res.reply,
          };
          setActiveAutomation(intent);
          appAutomation.executeIntent(intent);
        } else if (res.action.action === 'open_app' && res.action.app) {
          const appInfo = APP_REGISTRY[res.action.app.toLowerCase()] || {
            name: res.action.app,
            url: `https://${res.action.app}.com`,
            deepLink: `${res.action.app}://`,
            icon: '📱',
          };
          const intent: AutomationIntent = {
            type: 'open_app',
            app: res.action.app,
            appName: appInfo.name,
            url: appInfo.url,
            deepLink: appInfo.deepLink,
            spokenConfirmation: res.reply,
          };
          setActiveAutomation(intent);
          appAutomation.executeIntent(intent);
        } else if (res.action.action === 'youtube_play' && res.action.query) {
          const intent: AutomationIntent = {
            type: 'youtube_play',
            app: 'youtube',
            appName: 'YouTube',
            query: res.action.query,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(res.action.query)}`,
            deepLink: `youtube://results?search_query=${encodeURIComponent(res.action.query)}`,
            spokenConfirmation: res.reply,
          };
          setActiveAutomation(intent);
          appAutomation.executeIntent(intent);
        } else if (res.action.action === 'web_search' && res.action.query) {
          const intent: AutomationIntent = {
            type: 'web_search',
            query: res.action.query,
            url: `https://www.google.com/search?q=${encodeURIComponent(res.action.query)}`,
            spokenConfirmation: res.reply,
          };
          setActiveAutomation(intent);
          appAutomation.executeIntent(intent);
        }
      }

      const assistantMsg: ArcherChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: res.thinking || {
          assessing: `Evaluating user request: "${trimmed}".`,
          clarifying: 'Executed requested action and delivered clear human guidance.',
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);

      // Automatically speak out the response
      speakNaturalResponse(res.reply);
    } catch (e) {
      console.error(e);
      setIsThinking(false);
    }
  }, [messages, isThinking, selectedCity, activeProject, speakNaturalResponse]);

  // CONTINUOUS SPEECH LISTENING CONTROLLER (Never auto-mutes unless user clicks Mute)
  const startContinuousListening = useCallback(() => {
    if (isMutedRef.current) return;

    speech.startListening(
      (transcript, isFinal) => {
        setLiveTranscription(transcript);
        setIsListening(true);
        if (isFinal) {
          setLiveTranscription('');
          handleSendMessage(transcript);
        }
      },
      (err) => {
        if (!isMutedRef.current) {
          setIsListening(true);
        } else {
          setIsListening(false);
        }
      }
    );
    setIsListening(true);
  }, [handleSendMessage]);

  // Explicit Mute / Unmute Toggle
  const toggleMute = useCallback(() => {
    setIsMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      speech.setMuted(nextMuted);
      if (nextMuted) {
        sound.playBlip(700);
        speech.stopListening();
        speech.cancel();
        setIsListening(false);
        setIsSpeaking(false);
        setLiveTranscription('');
      } else {
        sound.playBlip(1200);
        startContinuousListening();
      }
      return nextMuted;
    });
  }, [startContinuousListening]);

  // Auto-boot listening on start
  useEffect(() => {
    sound.playBoot();
    const timer = setTimeout(() => {
      startContinuousListening();
    }, 800);
    return () => clearTimeout(timer);
  }, [startContinuousListening]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-slate-100 select-none relative font-mono">
      {/* 1. TOP HEADER & QUICK CONTROLS (CLEAN ALL-ENGLISH UI) */}
      <header className="h-12 shrink-0 px-3 sm:px-4 bg-black/95 border-b border-slate-800/90 backdrop-blur-md flex items-center justify-between z-20">
        {/* Branding & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-xs shadow-md transition-colors"
            style={{
              borderColor: currentTheme.orbColorHex,
              color: currentTheme.orbColorHex,
              boxShadow: `0 0 10px ${currentTheme.glowColor}`,
            }}
          >
            AI
          </div>
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-xs sm:text-sm tracking-wider text-white">
              ARCHER AI
            </span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border hidden xs:inline"
              style={{
                borderColor: currentTheme.orbColorHex,
                color: currentTheme.orbColorHex,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              VOICE & BUILDER OS
            </span>
          </div>
        </div>

        {/* Center: Mobile Screen Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-black/70 p-0.5 rounded-lg border border-slate-800 text-[10px]">
          <button
            onClick={() => {
              sound.playBlip(1000);
              setMobileView('hero');
            }}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
              mobileView === 'hero'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>Mobile Hero</span>
          </button>

          <button
            onClick={() => {
              sound.playBlip(1000);
              setMobileView('dashboard');
            }}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
              mobileView === 'dashboard'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3 h-3 text-cyan-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              sound.playBlip(1000);
              setMobileView('chat');
            }}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
              mobileView === 'chat'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-amber-400" />
            <span>Chat</span>
          </button>
        </div>

        {/* Right Tools: Project Studio + Permissions/API + Master Mute + PWA Install */}
        <div className="flex items-center gap-2">
          {/* Autonomous Project Studio Button */}
          <button
            onClick={() => {
              sound.playBlip(1100);
              setIsProjectStudioOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            title="Open Website & Project Studio"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          {/* Permissions & API Setup Button */}
          <button
            onClick={() => {
              sound.playBlip(1100);
              setIsPermissionsModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 text-xs transition-all"
            title="Permissions, Camera, Contacts & Gemini API Setup"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          {/* Master MUTE / UNMUTE button (Never auto-mutes unless clicked) */}
          <button
            onClick={toggleMute}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isMuted
                ? 'bg-rose-950 border-rose-700 text-rose-300'
                : 'bg-emerald-950/80 border-emerald-600 text-emerald-300 animate-pulse'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden xs:inline">
              {isMuted ? 'Muted' : 'Listening'}
            </span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sound.setEnabled(next);
              if (next) sound.playBlip(1200);
            }}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              soundEnabled ? 'bg-slate-900 border-slate-700 text-cyan-400' : 'bg-black border-slate-800 text-slate-500'
            }`}
            title="Audio FX"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEW SWITCHER */}
      {/* VIEW A: EXACT MOBILE HERO SCREEN (Replication of Smartphone Screen from Video) */}
      {mobileView === 'hero' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
          <div className="w-full max-w-sm h-full max-h-[720px] rounded-3xl border border-slate-800 bg-black overflow-hidden shadow-2xl flex flex-col">
            <ArcherMobileHero
              theme={currentTheme}
              isListening={isListening && !isMuted}
              isSpeaking={isSpeaking}
              isMuted={isMuted}
              tasks={tasks}
              onToggleTask={(id) => {
                sound.playBlip(1000);
                setTasks((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
                );
              }}
              onToggleMute={toggleMute}
              onSelectNode={(node) => {
                if (node === 'CHAT') {
                  setMobileView('chat');
                } else {
                  setActiveNodeModal(node);
                }
              }}
              headlines={[
                isMuted
                  ? 'Microphone muted: Tap Unmute to speak'
                  : 'Always listening: Say "Build a website", "Open Instagram", "Open Chrome"',
              ]}
            />
          </div>

          {/* Quick Voice Prompt Helper Chips */}
          <div className="absolute bottom-2 flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
            <button
              onClick={() => handleSendMessage('Build a modern portfolio website')}
              className="px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-600 text-cyan-300 text-[11px] font-sans hover:bg-cyan-900 shadow-md whitespace-nowrap"
            >
              "Build a website" 💻
            </button>
            <button
              onClick={() => handleSendMessage('Hello Archer, what is your status?')}
              className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-cyan-300 text-[11px] font-sans hover:bg-slate-800 shadow-md whitespace-nowrap"
            >
              "Hello Archer" 🎙️
            </button>
            <button
              onClick={() => handleSendMessage('Open Instagram')}
              className="px-3 py-1 rounded-full bg-slate-900/90 border border-rose-700 text-rose-300 text-[11px] font-sans hover:bg-slate-800 shadow-md whitespace-nowrap"
            >
              "Open Instagram" 📸
            </button>
            <button
              onClick={() => handleSendMessage('Open Google Chrome')}
              className="px-3 py-1 rounded-full bg-slate-900/90 border border-blue-700 text-blue-300 text-[11px] font-sans hover:bg-slate-800 shadow-md whitespace-nowrap"
            >
              "Open Chrome" 🌐
            </button>
            <button
              onClick={() => handleSendMessage('Send a message')}
              className="px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-700 text-emerald-300 text-[11px] font-sans hover:bg-slate-800 shadow-md whitespace-nowrap"
            >
              "Send message" 💬
            </button>
          </div>
        </div>
      ) : mobileView === 'chat' ? (
        /* VIEW B: CHAT & VOICE PANEL */
        <div className="flex-1 flex flex-col p-2 sm:p-3 overflow-hidden">
          <RightVoicePanel
            theme={currentTheme}
            onSelectTheme={(newThemeId) => {
              setCurrentThemeId(newThemeId);
            }}
            messages={messages}
            isThinking={isThinking}
            isListening={isListening && !isMuted}
            isSpeaking={isSpeaking}
            liveTranscription={liveTranscription}
            onSendMessage={handleSendMessage}
            onToggleMic={toggleMute}
            onSpeakText={speakNaturalResponse}
          />
        </div>
      ) : (
        /* VIEW C: FULL 3-COLUMN DESKTOP DASHBOARD (With Agent Town and Diagnostics in English) */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-2 sm:p-3 overflow-hidden">
          {/* Left Column: Diagnostics */}
          <section className="hidden xl:flex xl:col-span-3 flex-col h-full overflow-hidden">
            <LeftSystemPanel
              theme={currentTheme}
              isOnline={isSystemActive}
              onToggleOnline={() => setIsSystemActive((prev) => !prev)}
            />
          </section>

          {/* Center Column: Orb + Agent Town */}
          <section className="col-span-1 lg:col-span-7 xl:col-span-5 flex flex-col gap-2.5 h-full overflow-y-auto pr-0.5">
            {/* Top Stage */}
            <div className="h-[220px] sm:h-[235px] shrink-0 rounded-2xl border border-slate-800/90 backdrop-blur-md overflow-hidden bg-black/60 relative shadow-xl">
              {centerMode === 'orb' && (
                <div className="grid grid-cols-12 gap-1 sm:gap-2 p-2 sm:p-2.5 h-full">
                  <div className="col-span-5 flex items-center justify-center">
                    <NodeConnectorWires
                      theme={currentTheme}
                      activeNode={activeNodeModal}
                      onSelectNode={(node) => {
                        sound.playBlip(1100);
                        setActiveNodeModal(node);
                      }}
                    />
                  </div>

                  <div className="col-span-7 flex items-center justify-center h-full">
                    <ParticleOrb
                      theme={currentTheme}
                      isActive={isSystemActive}
                      isListening={isListening && !isMuted}
                      isSpeaking={isSpeaking}
                      lastSpokenText={lastSpokenText}
                      onToggleActive={() => {
                        sound.playExecuteSuccess();
                        setIsSystemActive((prev) => !prev);
                      }}
                      onToggleMic={toggleMute}
                      onReplayVoice={() => speakNaturalResponse(lastSpokenText)}
                    />
                  </div>
                </div>
              )}

              {centerMode === 'earth' && (
                <div className="relative w-full h-full">
                  <InteractiveGlobe
                    viewMode="photoreal"
                    targetLat={targetLat}
                    targetLng={targetLng}
                    targetZoom={targetZoom}
                    autoRotate={isSystemActive}
                    selectedLocation={selectedCity}
                    onSelectLocation={(city) => {
                      setSelectedCity(city);
                      setTargetLat(city.lat);
                      setTargetLng(city.lng);
                      setTargetZoom(1.6);
                      speakNaturalResponse(`Camera focused on ${city.name}. Coordinates updated.`);
                    }}
                  />
                  <button
                    onClick={() => setCenterMode('orb')}
                    className="absolute top-2 right-2 z-10 px-2.5 py-1 bg-slate-900/90 text-cyan-300 border border-cyan-500/50 rounded-md text-[10px]"
                  >
                    🔮 Switch to Orb
                  </button>
                </div>
              )}
            </div>

            {/* Agent Town (6 Autonomous Assistants) */}
            <div className="flex-1 min-h-[220px] rounded-2xl overflow-hidden shrink-0 border border-slate-800/90 bg-black/60 shadow-xl">
              <AgentTown />
            </div>
          </section>

          {/* Right Column: Voice Panel */}
          <section className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col h-full overflow-hidden">
            <RightVoicePanel
              theme={currentTheme}
              onSelectTheme={(newThemeId) => {
                setCurrentThemeId(newThemeId);
              }}
              messages={messages}
              isThinking={isThinking}
              isListening={isListening && !isMuted}
              isSpeaking={isSpeaking}
              liveTranscription={liveTranscription}
              onSendMessage={handleSendMessage}
              onToggleMic={toggleMute}
              onSpeakText={speakNaturalResponse}
            />
          </section>
        </main>
      )}

      {/* 3. PROJECT & WEBSITE BUILDER STUDIO MODAL */}
      <ProjectStudioModal
        isOpen={isProjectStudioOpen}
        project={activeProject}
        onClose={() => setIsProjectStudioOpen(false)}
        onProjectUpdated={(updated) => setActiveProject(updated)}
      />

      {/* 4. PERMISSIONS, CONTACTS & GEMINI API KEY SETUP MODAL */}
      <PermissionsAndApiModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        onContactSelected={(contact, action) => {
          setIsPermissionsModalOpen(false);
          if (action === 'call') {
            handleSendMessage(`Call ${contact.name}`);
          } else {
            handleSendMessage(`Message ${contact.name}`);
          }
        }}
      />

      {/* 5. APP & DEVICE AUTOMATION OVERLAY (Instagram, Chrome, Messages/SMS, YouTube, Dialer) */}
      <AutomationOverlay
        intent={activeAutomation}
        onClose={() => setActiveAutomation(null)}
      />

      {/* 6. NODE CONFIGURATION MODAL */}
      <ArcherNodeModal
        node={activeNodeModal}
        onClose={() => setActiveNodeModal(null)}
        onExecuteSkill={(skill) => {
          handleSendMessage(`Execute ${skill}`);
        }}
      />
    </div>
  );
}
