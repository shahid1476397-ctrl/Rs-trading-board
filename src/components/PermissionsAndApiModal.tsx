import React, { useState } from 'react';
import { memory, SystemPermissions, UserContact } from '../services/memoryService';
import {
  X,
  ShieldCheck,
  Key,
  Camera,
  Mic,
  Globe,
  Share2,
  Users,
  Download,
  Plus,
  Phone,
  MessageSquare,
  Check,
} from 'lucide-react';
import { sound } from '../services/soundEffects';

interface PermissionsAndApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSelected?: (contact: UserContact, action: 'call' | 'message') => void;
}

export const PermissionsAndApiModal: React.FC<PermissionsAndApiModalProps> = ({
  isOpen,
  onClose,
  onContactSelected,
}) => {
  if (!isOpen) return null;

  const profile = memory.getProfile();
  const [permissions, setPermissions] = useState<SystemPermissions>(profile.permissions);
  const [customKey, setCustomKey] = useState<string>(profile.customApiKey || '');
  const [userName, setUserName] = useState<string>(profile.userName || '');
  const [keySaved, setKeySaved] = useState(false);

  // New Contact Input
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'permissions' | 'api' | 'contacts'>('permissions');

  const togglePermission = (key: keyof SystemPermissions) => {
    sound.playBlip(1000);
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    memory.updatePermissions(updated);
  };

  const handleSaveKey = () => {
    sound.playExecuteSuccess();
    memory.setCustomApiKey(customKey);
    if (userName.trim()) {
      memory.setUserName(userName);
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    sound.playExecuteSuccess();
    memory.addContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: 'Personal Contact',
    });
    setNewContactName('');
    setNewContactPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 font-mono text-xs">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-black border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm font-sans">Settings & System Permissions</span>
              <p className="text-[10px] text-slate-400 font-sans">Device Access, Gemini API Setup & Address Book</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-3 border-b border-slate-800 gap-2 bg-slate-950">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-2.5 px-3 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions ({Object.values(permissions).filter(Boolean).length}/6)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-2.5 px-3 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contacts ({profile.contacts.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {/* TAB 1: SYSTEM PERMISSIONS CHECKLIST */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <p className="text-slate-400 font-sans text-xs">
                Archer AI utilizes these system permissions for automated app launching, live voice recognition, and device actions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Google Chrome */}
                <div
                  onClick={() => togglePermission('chromeAccess')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    permissions.chromeAccess ? 'bg-cyan-950/40 border-cyan-700/80 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-xs font-sans">Google Chrome</div>
                      <div className="text-[10px] text-slate-400">Web Search & URLs</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${permissions.chromeAccess ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}>
                    {permissions.chromeAccess && '✓'}
                  </div>
                </div>

                {/* 2. Camera */}
                <div
                  onClick={() => togglePermission('camera')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    permissions.camera ? 'bg-cyan-950/40 border-cyan-700/80 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs font-sans">Camera Access</div>
                      <div className="text-[10px] text-slate-400">Optical Feeds & Vision</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${permissions.camera ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}>
                    {permissions.camera && '✓'}
                  </div>
                </div>

                {/* 3. Instagram */}
                <div
                  onClick={() => togglePermission('instagramAccess')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    permissions.instagramAccess ? 'bg-cyan-950/40 border-cyan-700/80 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-bold text-xs font-sans">Instagram</div>
                      <div className="text-[10px] text-slate-400">Mobile Deep Link</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${permissions.instagramAccess ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}>
                    {permissions.instagramAccess && '✓'}
                  </div>
                </div>

                {/* 4. WhatsApp */}
                <div
                  onClick={() => togglePermission('whatsappAccess')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    permissions.whatsappAccess ? 'bg-cyan-950/40 border-cyan-700/80 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs font-sans">WhatsApp</div>
                      <div className="text-[10px] text-slate-400">Messaging & Dispatch</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${permissions.whatsappAccess ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}>
                    {permissions.whatsappAccess && '✓'}
                  </div>
                </div>

                {/* 5. Contacts */}
                <div
                  onClick={() => togglePermission('contactsAccess')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    permissions.contactsAccess ? 'bg-cyan-950/40 border-cyan-700/80 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-xs font-sans">Contacts Book</div>
                      <div className="text-[10px] text-slate-400">Call & SMS Intent</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${permissions.contactsAccess ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}>
                    {permissions.contactsAccess && '✓'}
                  </div>
                </div>

                {/* 6. Microphone */}
                <div
                  onClick={() => togglePermission('microphone')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    permissions.microphone ? 'bg-cyan-950/40 border-cyan-700/80 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-xs font-sans">Microphone</div>
                      <div className="text-[10px] text-slate-400">Speech-To-Text</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${permissions.microphone ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}>
                    {permissions.microphone && '✓'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: API KEY & USER IDENTITY SETUP */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-sans text-xs font-bold">Your Name (Persistent Memory)</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tell Archer your name (e.g., Ali Khan)..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-500 outline-none font-sans text-xs"
                />
                <p className="text-[10px] text-slate-500">Archer AI will remember your name across sessions and address you personally.</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <label className="text-white font-sans text-xs font-bold">Custom Gemini API Key (Optional)</label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="AIzaSy... (Leave empty to use built-in server proxy)"
                  className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-500 outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500">
                  When deployed or published, you can provide your own Gemini API key for unlimited quota.
                </p>
              </div>

              <button
                onClick={handleSaveKey}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-sans text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                {keySaved ? <Check className="w-4 h-4 text-black" /> : <Key className="w-4 h-4" />}
                <span>{keySaved ? 'Saved to Memory!' : 'Save Settings'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: CONTACTS BOOK (Call / Message by Name) */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="text-white font-bold font-sans text-xs">Add New Contact</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Name (e.g., Ali)"
                    className="bg-black text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-sans"
                  />
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="Phone (+92...)"
                    className="bg-black text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-sans"
                  />
                </div>
                <button
                  onClick={handleAddContact}
                  disabled={!newContactName.trim() || !newContactPhone.trim()}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-sans text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Contact to Memory</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-[11px]">Saved Contacts:</span>
                {profile.contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white font-sans">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${c.phone}`}
                        className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`sms:${c.phone}`}
                        className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900"
                        title="SMS"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
