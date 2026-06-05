'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const router = useRouter();

  async function handleReset() {
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else {
      setMsg('Password updated!');
      setTimeout(() => router.push('/pairing'), 1500);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-center mb-2 text-zinc-900 dark:text-white">
          New Password
        </h1>
        <p className="text-sm text-center text-zinc-500 mb-6">Enter your new password below.</p>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="New password (min 6 chars)"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {msg && (
            <p className={`text-sm ${msg.includes('updated') ? 'text-green-600' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
          <button
            onClick={handleReset}
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
