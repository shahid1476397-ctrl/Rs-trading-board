import React, { useState, useEffect } from 'react';
import { HUDTheme, THEMES } from '../types/marklv';
import { ShieldAlert, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface ConfirmModalProps {
  theme: HUDTheme;
  actionTitle: string;
  actionDescription: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  theme,
  actionTitle,
  actionDescription,
  onConfirm,
  onCancel,
}) => {
  const [securityToken, setSecurityToken] = useState<string>('');
  const [enteredToken, setEnteredToken] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // Generate high-entropy 6-character hex token like Mark LV's confirm.py
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    setSecurityToken(randomHex);
    sound.playAlert();
  }, []);

  const handleVerify = () => {
    if (enteredToken.trim().toUpperCase() === securityToken) {
      sound.playExecuteSuccess();
      onConfirm();
    } else {
      sound.playAlert();
      setErrorMsg('CRYPTOGRAPHIC TOKEN MISMATCH. AUTHORIZATION REFUSED.');
    }
  };

  const themeColors = THEMES[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-950 border-2 border-rose-500 rounded-lg p-5 shadow-2xl shadow-rose-950/50 flex flex-col gap-4 relative hud-bracket">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-rose-900/60">
          <div className="p-2 rounded bg-rose-950/80 border border-rose-600 text-rose-400 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold text-rose-400 uppercase tracking-widest">
              SECURITY GATE: IRREVERSIBLE ACTION
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Module: core/confirm.py [UI-Issued Security Gate]
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-200 flex flex-col gap-1">
            <span className="font-bold text-white uppercase">{actionTitle}</span>
            <span className="text-slate-300 text-[11px] leading-relaxed">
              {actionDescription}
            </span>
          </div>
        </div>

        {/* Security Token Display */}
        <div className="flex flex-col gap-1.5 p-3 bg-black border border-slate-800 rounded">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">AUTHORIZATION TOKEN:</span>
            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-bold tracking-widest border border-rose-800 rounded text-sm">
              {securityToken}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Type the token below or tap 'Authorize' to satisfy the security constraint:
          </span>
          <div className="flex items-center gap-2 mt-1">
            <KeyRound className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={enteredToken}
              onChange={(e) => {
                setEnteredToken(e.target.value);
                setErrorMsg('');
              }}
              placeholder={`Enter "${securityToken}" to authorize`}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              autoFocus
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-white uppercase tracking-wider focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>

        {errorMsg && (
          <span className="text-xs font-mono text-rose-400 font-bold animate-shake">
            {errorMsg}
          </span>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playBlip(600);
              onCancel();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs transition-all"
          >
            Abort Directive
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEnteredToken(securityToken);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded"
              title="Quick autofill token"
            >
              Fill Token
            </button>
            <button
              onClick={handleVerify}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs rounded transition-all shadow-lg shadow-rose-900/50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Fire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
