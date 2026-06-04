'use client';

import { useState } from 'react';
import { sendPairRequest } from './actions';
import { Profile, PairRequest, Pair } from '@/types/pairing';
import { Heart, Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import ProfileSetup from './ProfileSetup';

interface Props {
  currentUserId: string;
  profiles: Profile[];
  requests: PairRequest[];
  pairs: Pair[];
  windowOpen: boolean;
  endDate?: string;
  needsSetup: boolean;
}

export default function PairingClient({
  currentUserId,
  profiles,
  requests,
  pairs,
  windowOpen,
  endDate,
  needsSetup,
}: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // ... rest of your existing PairingClient code stays exactly the same ...

  const myPair = pairs.find(
    (p) => p.user_a === currentUserId || p.user_b === currentUserId
  );

  const myPartner = myPair
    ? profiles.find(
        (p) =>
          p.id === (myPair.user_a === currentUserId ? myPair.user_b : myPair.user_a)
      )
    : null;

  const sentTo = new Set(
    requests.filter((r) => r.sender_id === currentUserId).map((r) => r.receiver_id)
  );

  const receivedFrom = new Map(
    requests
      .filter((r) => r.receiver_id === currentUserId && r.status === 'requested')
      .map((r) => [r.sender_id, r])
  );

  async function handleRequest(id: string) {
    setPending(id);
    setMsg('');
    const res = await sendPairRequest(id);
    if (res.error) setMsg(res.error);
    else setMsg('Request sent!');
    setPending(null);
    window.location.reload();
  }

  return (
    <>
      {needsSetup && <ProfileSetup userId={currentUserId} />}

      <div className="min-h-screen p-6 max-w-3xl mx-auto">
        {/* ... everything below stays exactly the same ... */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Class Pairing
          </h1>

          {myPair ? (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-300">
                You are paired with <strong>{myPartner?.full_name || myPartner?.email}</strong>
              </span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              {windowOpen ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Window closes {endDate ? new Date(endDate).toLocaleDateString() : 'soon'}
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Pairing window is closed</span>
              )}
            </div>
          )}

          {msg && (
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{msg}</p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Classmates
          </h2>

          {profiles.length === 0 && (
            <p className="text-zinc-500 text-center py-8">No classmates yet.</p>
          )}

          {profiles.map((profile) => {
            const isSent = sentTo.has(profile.id);
            const incoming = receivedFrom.get(profile.id);
            const isPaired = myPair !== null;

            return (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {profile.full_name || profile.email}
                    </p>
                    <p className="text-xs text-zinc-500">{profile.email}</p>
                  </div>
                </div>

                <div>
                  {isPaired ? (
                    <span className="text-xs text-zinc-400">Paired</span>
                  ) : incoming ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      They chose you!
                    </span>
                  ) : isSent ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Requested
                    </span>
                  ) : windowOpen ? (
                    <button
                      onClick={() => handleRequest(profile.id)}
                      disabled={pending === profile.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                    >
                      {pending === profile.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Heart className="w-3.5 h-3.5" />
                      )}
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
