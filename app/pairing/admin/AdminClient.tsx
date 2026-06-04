'use client';

import { useState } from 'react';
import { finalizePairs } from '../actions';
import { Profile, Pair, PairingWindow } from '@/types/pairing';
import { Shield, Users, Calendar, Clock, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  profiles: Profile[];
  pairs: Pair[];
  window: PairingWindow | null;
  currentUserId: string;
}

export default function AdminClient({ profiles, pairs, window, currentUserId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const pairedIds = new Set<string>();
  pairs.forEach((p) => { pairedIds.add(p.user_a); pairedIds.add(p.user_b); });

  const unpaired = profiles.filter((p) => !pairedIds.has(p.id) && p.id !== currentUserId);
  const isWindowOpen = window ? new Date() < new Date(window.end_date) : false;

  async function handleFinalize() {
    if (!confirm('This will close the window and auto-pair remaining students. Continue?')) return;
    setLoading(true);
    const res = await finalizePairs();
    setResult(res.error || `Finalized! ${res.paired} students auto-paired.`);
    setLoading(false);
    if (!res.error) window.location.reload();
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-purple-500" />
        Admin Panel
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{profiles.length + 1}</p>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
            <Users className="w-3 h-3" /> Total Students
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-2xl font-bold text-green-600">{pairs.length}</p>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
            <Users className="w-3 h-3" /> Pairs Formed
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">{unpaired.length}</p>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3" /> Unpaired
          </p>
        </div>
      </div>

      {/* Window Status */}
      <div className="mb-8 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Pairing Window
        </h2>
        {window ? (
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              Start: <strong>{new Date(window.start_date).toLocaleString()}</strong>
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              End: <strong>{new Date(window.end_date).toLocaleString()}</strong>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {isWindowOpen ? (
                <span className="text-green-600 dark:text-green-400 font-medium">Open</span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-medium">Closed</span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-zinc-500">No pairing window set. Create one in Supabase.</p>
        )}
      </div>

      {/* Finalize */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
        <h2 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Finalize Pairing
        </h2>
        <p className="text-sm text-amber-800 dark:text-amber-400 mb-4">
          This will close the pairing window and automatically assign remaining unpaired students.
        </p>
        <button
          onClick={handleFinalize}
          disabled={loading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Finalizing...' : 'Finalize & Auto-Pair'}
        </button>
        {result && <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{result}</p>}
      </div>

      {/* All Pairs */}
      <div className="mt-8">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">All Pairs</h2>
        {pairs.length === 0 ? (
          <p className="text-zinc-500 text-sm">No pairs yet.</p>
        ) : (
          <div className="space-y-2">
            {pairs.map((pair) => {
              const a = profiles.find((p) => p.id === pair.user_a);
              const b = profiles.find((p) => p.id === pair.user_b);
              return (
                <div
                  key={pair.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {(a?.full_name || a?.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {a?.full_name || a?.email}
                  </span>
                  <span className="text-zinc-400">↔</span>
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">
                    {(b?.full_name || b?.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {b?.full_name || b?.email}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
