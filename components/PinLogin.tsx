import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Lock, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { comparePin } from '../utils/pinCrypto';

interface PinLoginProps {
  onLoginSuccess: (user: any) => void;
  onAccessRequestClick?: () => void;
  lang?: 'bs' | 'en';
}

export const PinLogin: React.FC<PinLoginProps> = ({ 
  onLoginSuccess, 
  onAccessRequestClick,
  lang = 'en'
}) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 300000; // 5 minutes

  const messages = {
    bs: {
      title: 'Otključaj Ekspediciju',
      subtitle: 'Unesite 6-znamenkasti PIN koji ste dobili',
      pinLabel: 'PIN Kod',
      submit: 'Otključaj',
      submitting: 'Provjeravanje...',
      noAccess: 'Prema dostupnost nije odobrena. Molite zatražite pristup.',
      invalidPin: 'Nevaljani PIN ili pristup nije odobren.',
      errorGeneric: 'Greška pri otključavanju. Pokušajte ponovo.',
      requestAccess: 'Zatražite pristup',
      noPin: 'Molite unesite PIN.',
      lockout: 'Previše pokušaja. Pokušajte ponovno za 5 minuta.',
      bypassAdmin: '(Zaobilazak za admin)',
    },
    en: {
      title: 'Unlock Expedition',
      subtitle: 'Enter the 6-digit PIN you received',
      pinLabel: 'Access PIN',
      submit: 'Unlock',
      submitting: 'Verifying...',
      noAccess: 'Access not approved. Please request access.',
      invalidPin: 'Invalid PIN or access not approved.',
      errorGeneric: 'Error unlocking. Please try again.',
      requestAccess: 'Request Access',
      noPin: 'Please enter a PIN.',
      lockout: 'Too many attempts. Try again in 5 minutes.',
      bypassAdmin: '(Admin bypass)',
    }
  };

  const t = messages[lang];

  // Check for lockout on mount
  useEffect(() => {
    const lockoutTime = localStorage.getItem('kvs_pin_lockout_time');
    if (lockoutTime) {
      const elapsed = Date.now() - parseInt(lockoutTime);
      if (elapsed < LOCKOUT_DURATION) {
        setLocked(true);
        const remaining = Math.ceil((LOCKOUT_DURATION - elapsed) / 1000);
        console.warn(`Locked out. Try again in ${remaining} seconds.`);
        
        // Auto-unlock after duration
        const timeout = setTimeout(() => {
          setLocked(false);
          localStorage.removeItem('kvs_pin_lockout_time');
          setAttempts(0);
          setPin('');
        }, LOCKOUT_DURATION - elapsed);
        
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (locked) {
      setError(t.lockout);
      return;
    }

    if (pin.length !== 6) {
      setError(`${lang === 'bs' ? 'PIN mora imati 6 znamenki.' : 'PIN must be 6 digits.'}`);
      return;
    }

    setLoading(true);

    try {
      // Fetch all approved users (non-production: compare hashes)
      // In production, this would be a secure server-side verification
      const { data: divers, error: queryError } = await supabase
        .from('divers')
        .select('id, name, email, is_pro, access_status, access_pin_hash, status')
        .eq('access_status', 'approved');

      if (queryError) {
        console.error('Query error:', queryError);
        setError(t.errorGeneric);
        setLoading(false);
        return;
      }

      // Find matching user by comparing PIN
      let matchedUser = null;

      if (divers) {
        for (const diver of divers) {
          // Admin recovery PIN (999999) - for is_pro users only with validated email
          const ADMIN_EMAILS = ['mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com'];
          if (diver.is_pro && diver.email && ADMIN_EMAILS.includes(diver.email.toLowerCase()) && pin === '999999') {
            console.log('✅ Admin recovery key accepted');
            matchedUser = diver;
            break;
          }

          // Regular PIN verification for all users
          if (!diver.access_pin_hash) continue;

          // Compare entered PIN against stored hash
          try {
            const isValidPin = await comparePin(pin, diver.access_pin_hash);
            if (isValidPin) {
              matchedUser = diver;
              break;
            }
          } catch (hashError) {
            console.warn('Hash comparison error:', hashError);
            // Continue to next user
          }
        }
      }

      if (matchedUser) {
        // Successful login
        console.log('PIN login successful:', matchedUser.name);
        
        // Update last_login timestamp (fire and forget)
        supabase
          .from('divers')
          .update({ last_login: new Date().toISOString() })
          .eq('id', matchedUser.id)
          .then(
            () => console.log('Updated last_login'),
            (err: any) => console.warn('Could not update last_login:', err)
          );

        // Clear lockout and attempts
        localStorage.removeItem('kvs_pin_lockout_time');
        localStorage.removeItem('kvs_pin_attempts');
        
        // Call success handler
        onLoginSuccess({
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          isAdmin: matchedUser.is_pro,
          accessStatus: matchedUser.access_status,
        });
      } else {
        // Failed login
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('kvs_pin_attempts', newAttempts.toString());

        if (newAttempts >= MAX_ATTEMPTS) {
          // Lock out user
          setLocked(true);
          localStorage.setItem('kvs_pin_lockout_time', Date.now().toString());
          setError(t.lockout);
        } else {
          setError(`${t.invalidPin} (${newAttempts}/${MAX_ATTEMPTS})`);
        }

        setPin('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-cyan-700 dark:text-cyan-300 mb-2">
            {t.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
          
          {locked ? (
            // Locked State
            <div className="text-center space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  {t.lockout}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {lang === 'bs' 
                    ? 'Možete pokušati ponovno za nekoliko minuta.' 
                    : 'You can try again in a few minutes.'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Message */}
              {error && (
                <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-[15px] border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.pinLabel}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pin}
                  onChange={handlePinChange}
                  disabled={loading}
                  maxLength={6}
                  className="w-full px-4 py-4 text-center text-3xl font-black bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[15px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900 transition disabled:opacity-50 tracking-widest"
                  placeholder="••••••"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {pin.length}/6 {lang === 'bs' ? 'znamenki' : 'digits'}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold rounded-[15px] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t.submit}
                  </>
                )}
              </button>

              {/* Request Access Link */}
              <button
                type="button"
                onClick={onAccessRequestClick}
                className="w-full text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold underline py-2 transition"
              >
                {t.requestAccess}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>🤿 KVS-SCUBA Maldives 2026</p>
          <p className="text-gray-400 dark:text-gray-600">
            {lang === 'bs' ? 'Ekspedicija Ronjenja' : 'Expedition Portal'}
          </p>
        </div>
      </div>
    </div>
  );
};
