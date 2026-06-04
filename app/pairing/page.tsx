import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';

import { getProfiles, getPairRequests, getPairs, getPairingWindow } from './actions';
import PairingClient from './PairingClient';

export default async function PairingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profiles, requests, pairs, window] = await Promise.all([
    getProfiles(),
    getPairRequests(),
    getPairs(),
    getPairingWindow(),
  ]);

  const isWindowOpen = window ? new Date() < new Date(window.end_date) : false;

  return (
    <PairingClient
      currentUserId={user.id}
      profiles={profiles}
      requests={requests}
      pairs={pairs}
      windowOpen={isWindowOpen}
      endDate={window?.end_date}
    />
  );
}
