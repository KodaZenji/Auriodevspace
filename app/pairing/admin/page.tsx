import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getAllProfiles, getAllPairs, getPairingWindow } from '../actions';
import AdminClient from './AdminClient';

// Add admin emails here — anyone not on this list is sent to /pairing
const ADMIN_EMAILS = ['peterjosy1@gmail.com'];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!ADMIN_EMAILS.includes(user.email ?? '')) redirect('/pairing');

  const [profiles, pairs, pairingWindow] = await Promise.all([
    getAllProfiles(),   // admin sees everyone, including themselves
    getAllPairs(),      // admin sees all pairs
    getPairingWindow(),
  ]);

  return (
    <AdminClient
      profiles={profiles}
      pairs={pairs}
      pairingWindow={pairingWindow}   // FIXED: renamed from "window" to "pairingWindow"
      currentUserId={user.id}
    />
  );
}
