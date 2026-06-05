'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  userEmail: string;
}

export default function ProfileSetup({ userId, userEmail }: Props) {
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save() {
    if (!name.trim()) return;
    setLoading(true);

    // ✅ upsert — works whether the row exists or not
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email: userEmail, full_name: name.trim() },
        { onConflict: 'id' }
      );

    setLoading(false);

    if (!error) router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">Welcome!</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Enter your full name so classmates know who you are.
        </p>
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={save}
          disabled={loading || !name.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue to Pairing'}
        </button>
      </div>
    </div>
  );
}
