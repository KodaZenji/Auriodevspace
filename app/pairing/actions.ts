'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function getProfiles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)
    .order('full_name');

  return data || [];
}

export async function getPairRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('pair_requests')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  return data || [];
}

export async function getPairs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('pairs')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  return data || [];
}

export async function getPairingWindow() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('pairing_window')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function sendPairRequest(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if window is open
  const { data: window } = await supabase
    .from('pairing_window')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (!window || new Date() > new Date(window.end_date)) {
    return { error: 'Pairing window is closed' };
  }

  // Check if already paired
  const { data: existingPairs } = await supabase
    .from('pairs')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (existingPairs && existingPairs.length > 0) {
    return { error: 'You are already paired' };
  }

  // Insert request
  const { error } = await supabase
    .from('pair_requests')
    .insert({ sender_id: user.id, receiver_id: receiverId });

  if (error) return { error: error.message };

  // Check for mutual request
  const { data: reverse } = await supabase
    .from('pair_requests')
    .select('*')
    .eq('sender_id', receiverId)
    .eq('receiver_id', user.id)
    .eq('status', 'requested')
    .single();

  if (reverse) {
    // Create pair
    await supabase.from('pairs').insert({
      user_a: user.id,
      user_b: receiverId,
    });

    // Update both requests to matched
    await supabase
      .from('pair_requests')
      .update({ status: 'matched' })
      .eq('id', reverse.id);

    await supabase
      .from('pair_requests')
      .update({ status: 'matched' })
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId);
  }

  revalidatePath('/pairing');
  return { success: true };
}

export async function finalizePairs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get all profiles
  const { data: profiles } = await supabase.from('profiles').select('id');
  if (!profiles) return { error: 'No profiles found' };

  // Get all paired users
  const { data: pairs } = await supabase.from('pairs').select('user_a, user_b');
  const pairedIds = new Set<string>();
  pairs?.forEach(p => { pairedIds.add(p.user_a); pairedIds.add(p.user_b); });

  // Filter unpaired
  const unpaired = profiles.filter(p => !pairedIds.has(p.id));

  // Shuffle
  for (let i = unpaired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unpaired[i], unpaired[j]] = [unpaired[j], unpaired[i]];
  }

  // Pair sequentially
  const newPairs = [];
  for (let i = 0; i < unpaired.length - 1; i += 2) {
    newPairs.push({
      user_a: unpaired[i].id,
      user_b: unpaired[i + 1].id,
    });
  }

  if (newPairs.length > 0) {
    await supabase.from('pairs').insert(newPairs);
  }

  // Close window
  await supabase
    .from('pairing_window')
    .update({ is_active: false })
    .eq('is_active', true);

  revalidatePath('/pairing');
  return { success: true, paired: newPairs.length * 2 };
}
