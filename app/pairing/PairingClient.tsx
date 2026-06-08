'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendPairRequest, acceptPairRequest, rejectPairRequest } from './actions';
import { Profile, PairRequest, Pair } from '@/types/pairing';
import { Heart, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProfileSetup from './ProfileSetup';

interface RosterOption {
  id: string;
  full_name: string;
}

interface Props {
  currentUserId: string;
  profiles: Profile[];
  requests: PairRequest[];
  pairs: Pair[];
  windowOpen: boolean;
  endDate?: string;
  needsSetup: boolean;
  rosterEntries: RosterOption[];
}

export default function PairingClient({
  currentUserId,
  profiles,
  requests,
  pairs,
  windowOpen,
  endDate,
  needsSetup,
  rosterEntries,
}: Props) {
  const router  = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [msg,     setMsg]     = useState('');

  // ── Realtime subscription ────────────────────────────────────────
  // Listens for any change on pair_requests or pairs and refreshes
  // the server component so all clients see updates without a manual reload.
  // Requires both tables to have Replication enabled in Supabase dashboard.
  useEffect(() => {
    const channel = supabase
      .channel('pairing-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pair_requests' },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pairs' },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // ── Relationship helpers ─────────────────────────────────────────

  const myPair = pairs.find(
    p => p.user_a === currentUserId || p.user_b === currentUserId
  );
  const myPartner = myPair
    ? profiles.find(p =>
        p.id === (myPair.user_a === currentUserId ? myPair.user_b : myPair.user_a)
      )
    : null;

  // ── Action handlers ──────────────────────────────────────────────

  async function handleRequest(receiverId: string) {
    setPending(receiverId);
    setMsg('');
    const res = await sendPairRequest(receiverId);
    if (res.error) setMsg(res.error);
    setPending(null);
    // No manual reload needed — Realtime will trigger router.refresh()
  }

  async function handleAccept(requestId: string) {
    setPending(requestId);
    setMsg('');
    const res = await acceptPairRequest(requestId);
    if (res.error) setMsg(res.error);
    setPending(null);
  }

  async function handleReject(requestId: string) {
    setPending(requestId);
    setMsg('');
    const res = await rejectPairRequest(requestId);
    if (res.error) setMsg(res.error);
    setPending(null);
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <>
      {needsSetup && (
        <ProfileSetup userId={currentUserId} rosterEntries={rosterEntries} />
      )}

      <div className="min-h-screen p-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Class Pairing
          </h1>

          {myPair ? (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200
                            dark:border-green-800 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 dark:text-green-300">
                You are paired with{' '}
                <strong>{myPartner?.full_name || myPartner?.email || 'your partner'}</strong>
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="w-4 h-4" />
              {windowOpen
                ? <span>Window closes {endDate ? new Date(endDate).toLocaleDateString() : 'soon'}</span>
                : <span className="text-red-500">Pairing window is closed</span>}
            </div>
          )}

          {msg && <p className="mt-2 text-sm text-red-500">{msg}</p>}
        </div>

        {/* Classmates */}
        <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Classmates
        </h2>

        {profiles.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">
            No classmates have claimed their names yet.
          </p>
        )}

        <div className="space-y-3">
          {profiles.map(profile => {
            const outRequest = requests.find(
              r => r.sender_id === currentUserId && r.receiver_id === profile.id
            );
            const inRequest = requests.find(
              r => r.sender_id === profile.id &&
                   r.receiver_id === currentUserId &&
                   r.status === 'requested'
            );
            const isDirectlyPaired = pairs.some(
              p => (p.user_a === currentUserId && p.user_b === profile.id) ||
                   (p.user_b === currentUserId && p.user_a === profile.id)
            );

            return (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900
                           border border-zinc-200 dark:border-zinc-800 rounded-xl"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500
                                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(profile.full_name || profile.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                      {profile.full_name || profile.email}
                    </p>
                    <p className="text-xs text-zinc-400">{profile.email}</p>
                  </div>
                </div>

                {/* Action / status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isDirectlyPaired ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Paired
                    </span>

                  ) : myPair ? (
                    null

                  ) : inRequest ? (
                    // RECEIVER — Accept / Reject buttons
                    <>
                      <button
                        onClick={() => handleAccept(inRequest.id)}
                        disabled={pending === inRequest.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold
                                   rounded-lg bg-green-600 hover:bg-green-700 text-white
                                   transition disabled:opacity-50"
                      >
                        {pending === inRequest.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <CheckCircle className="w-3 h-3" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(inRequest.id)}
                        disabled={pending === inRequest.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold
                                   rounded-lg bg-red-50 hover:bg-red-100 text-red-600
                                   border border-red-200 transition disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>

                  ) : outRequest ? (
                    // SENDER — show request status
                    outRequest.status === 'requested' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : outRequest.status === 'matched' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Accepted
                      </span>
                    ) : outRequest.status === 'rejected' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    ) : null

                  ) : windowOpen ? (
                    <button
                      onClick={() => handleRequest(profile.id)}
                      disabled={pending === profile.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                                 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                                 transition disabled:opacity-50"
                    >
                      {pending === profile.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Heart className="w-3.5 h-3.5" />}
                      Pair
                    </button>

                  ) : (
                    <span className="text-xs text-zinc-400">Closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
