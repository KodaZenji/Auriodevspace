// app/pairing/admin/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getProfiles, getPairs, getPairingWindow, finalizePairs } from '../actions';
import AdminClient from './AdminClient';

// Add your admin emails here
const ADMIN_EMAILS = ['peterjosy1@gmail.com'];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Not logged in → go to pairing login
  if (!user) redirect('/login');
  
  // Not admin → go to regular pairing page
  if (!ADMIN_EMAILS.includes(user.email ?? '')) redirect('/pairing');

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
