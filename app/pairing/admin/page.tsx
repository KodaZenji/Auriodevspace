import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';

import { getProfiles, getPairs, getPairingWindow, finalizePairs } from '../actions';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profiles, pairs, window] = await Promise.all([
    getProfiles(),
    getPairs(),
    getPairingWindow(),
  ]);

  return (
    <AdminClient
      profiles={profiles}
      pairs={pairs}
      window={window}
      currentUserId={user.id}
    />
  );
}
