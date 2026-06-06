import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  getProfiles, getPairRequests, getPairs,
  getPairingWindow, getRosterEntries,
} from './actions';
import PairingClient from './PairingClient';

export default async function PairingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const needsSetup = !myProfile?.full_name;

  const [profiles, requests, pairs, pairingWindow] = await Promise.all([
    getProfiles(),
    getPairRequests(),
    getPairs(),
    getPairingWindow(),
  ]);

  // Only fetch the unclaimed roster when the user still needs to claim their name.
  // No point fetching it for students who are already set up.
  const rosterEntries = needsSetup ? await getRosterEntries() : [];

  const isWindowOpen = pairingWindow
    ? new Date() < new Date(pairingWindow.end_date)
    : false;

  return (
    <PairingClient
      currentUserId={user.id}
      profiles={profiles}
      requests={requests}
      pairs={pairs}
      windowOpen={isWindowOpen}
      endDate={pairingWindow?.end_date}
      needsSetup={needsSetup}
      rosterEntries={rosterEntries}
    />
  );
}
