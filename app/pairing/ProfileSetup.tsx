'use client';

import { useState } from 'react';
import { claimRosterEntry } from './actions';
import { useRouter } from 'next/navigation';
import { UserCheck, Loader2 } from 'lucide-react';

interface RosterOption {
  id: string;
  full_name: string;
}

export default function ProfileSetup({
  userId,
  rosterEntries,
}: {
  userId: string;
  rosterEntries: RosterOption[];
}) {
  const [selected, setSelected] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const router = useRouter();

  async function handleClaim() {
    if (!selected) return;
    setLoading(true);
    setError('');

    const res = await claimRosterEntry(selected);

    if ('error' in res && res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // Refresh the server component so needsSetup becomes false
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 p-7 rounded-2xl shadow-2xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Claim your name</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-5">
          Select your name from the class list to confirm your identity.
          Each name can only be claimed once — choose carefully.
        </p>

        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700
                     bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white mb-1
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">— Select your name —</option>
          {rosterEntries.map(entry => (
            <option key={entry.id} value={entry.id}>
              {entry.full_name}
            </option>
          ))}
        </select>

        {rosterEntries.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            All names have been claimed. Contact your instructor.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 mb-4 mt-2">{error}</p>
        )}

        <button
          onClick={handleClaim}
          disabled={loading || !selected}
          className="w-full mt-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white
                     font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Claiming…</>
            : 'Confirm Identity'}
        </button>

        <p className="text-xs text-zinc-400 mt-3 text-center">
          Your name cannot be changed after this step.
        </p>
      </div>
    </div>
  );
}
