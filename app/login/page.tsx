'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type View = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const [view, setView]         = useState<View>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok?: boolean } | null>(null);
  const router = useRouter();

  function reset() { setMsg(null); setPassword(''); }

  async function handleLogin() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg({ text: error.message });
    else router.push('/pairing');
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true); setMsg(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMsg({ text: error.message });
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({ id: data.user.id, email }, { onConflict: 'id' });
      router.push('/pairing');
    }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email) { setMsg({ text: 'Enter your email above first' }); return; }
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://kemjeelabs.xyz/reset-password',
    });
    if (error) setMsg({ text: error.message });
    else setMsg({ text: 'Reset link sent! Check your inbox.', ok: true });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-white">
          {view === 'login'  && 'Class Pairing'}
          {view === 'signup' && 'Create Account'}
          {view === 'forgot' && 'Reset Password'}
        </h1>
        <p className="text-sm text-center text-zinc-500 mb-6">
          {view === 'login'  && 'Log in to pair up'}
          {view === 'signup' && 'Join your class'}
          {view === 'forgot' && "We'll email you a reset link"}
        </p>

        {/* Fields */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {view !== 'forgot' && (
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          )}

          {/* Message */}
          {msg && (
            <p className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>
              {msg.text}
            </p>
          )}

          {/* Primary button */}
          <button
            onClick={
              view === 'login'  ? handleLogin  :
              view === 'signup' ? handleSignUp :
              handleForgot
            }
            disabled={loading || !email || (view !== 'forgot' && !password)}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Loading...' :
              view === 'login'  ? 'Log In' :
              view === 'signup' ? 'Create Account' :
              'Send Reset Link'
            }
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-5 space-y-2 text-center text-sm text-zinc-500">
          {view === 'login' && (
            <>
              <p>
                No account?{' '}
                <button onClick={() => { setView('signup'); reset(); }} className="text-blue-600 hover:underline font-medium">
                  Sign Up
                </button>
              </p>
              <p>
                <button onClick={() => { setView('forgot'); reset(); }} className="text-zinc-400 hover:underline text-xs">
                  Forgot password?
                </button>
              </p>
            </>
          )}

          {view === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setView('login'); reset(); }} className="text-blue-600 hover:underline font-medium">
                Log In
              </button>
            </p>
          )}

          {view === 'forgot' && (
            <p>
              <button onClick={() => { setView('login'); reset(); }} className="text-blue-600 hover:underline font-medium">
                ← Back to Log In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
