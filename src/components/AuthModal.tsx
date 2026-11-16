import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string | null;
  isRecovering?: boolean;
}

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mailadres of wachtwoord klopt niet.';
  if (m.includes('email not confirmed')) return 'Bevestig eerst je e-mailadres via de link in je mail.';
  if (m.includes('already registered')) return 'Er bestaat al een account met dit e-mailadres. Log in.';
  if (m.includes('password should be at least')) return 'Je wachtwoord moet minimaal 6 tekens lang zijn.';
  if (m.includes('rate limit')) return 'Te veel pogingen. Wacht even en probeer het opnieuw.';
  return message;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message, isRecovering = false }) => {
  const [localMode, setMode] = useState<Mode>('login');
  const mode: Mode = isRecovering ? 'reset' : localMode;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsBusy(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setInfo('Als dit e-mailadres bij een account hoort, krijg je een mail met een link om een nieuw wachtwoord in te stellen.');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword('');
        onClose();
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setPassword('');
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          // E-mail confirmation is turned off: the user is logged in straight away.
          setPassword('');
          onClose();
        } else {
          setInfo('Bijna klaar! Klik op de bevestigingslink in je mail en log daarna hier in.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setError(translateAuthError(String(err?.message || err)));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-neutral-300">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-black">
            {{ login: 'Inloggen', signup: 'Account aanmaken', forgot: 'Wachtwoord vergeten', reset: 'Nieuw wachtwoord' }[mode]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && <p className="text-xs text-neutral-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode !== 'reset' && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              E-mailadres
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          )}
          {mode !== 'forgot' && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              {mode === 'reset' ? 'Nieuw wachtwoord' : 'Wachtwoord'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          )}

          {mode === 'login' && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setInfo(null);
                }}
                className="text-xs underline text-neutral-600 hover:text-black"
              >
                Wachtwoord vergeten?
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          {info && <p className="text-xs text-green-700">{info}</p>}

          <button
            type="submit"
            disabled={isBusy}
            className="editorial-btn w-full px-4 py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {{ login: 'Inloggen', signup: 'Account aanmaken', forgot: 'Stuur herstelmail', reset: 'Wachtwoord opslaan' }[mode]}
            </span>
          </button>
        </form>

        {mode === 'reset' ? null : mode === 'forgot' ? (
          <p className="text-xs text-neutral-500 mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setInfo(null);
              }}
              className="underline text-black"
            >
              Terug naar inloggen
            </button>
          </p>
        ) : (
        <p className="text-xs text-neutral-500 mt-4 text-center">
          {mode === 'login' ? 'Nog geen account?' : 'Heb je al een account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setInfo(null);
            }}
            className="underline text-black"
          >
            {mode === 'login' ? 'Maak er een aan' : 'Log in'}
          </button>
        </p>
        )}
      </div>
    </div>
  );
};
