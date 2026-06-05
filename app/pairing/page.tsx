import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getProfiles, getPairRequests, getPairs, getPairingWindow } from './actions';
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
      userEmail={user.email ?? ''}   // ✅
      profiles={profiles}
      requests={requests}
      pairs={pairs}
      windowOpen={isWindowOpen}
      endDate={window?.end_date}
      needsSetup={needsSetup}
    />
  );
}
