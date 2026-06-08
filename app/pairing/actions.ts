'use server';

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// ── Read helpers ─────────────────────────────────────────────────

export async function getProfiles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)
    .not('full_name', 'is', null)
    .order('full_name');

  return data || [];
}

export async function getAllProfiles() {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').order('full_name');
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

export async function getAllPairs() {
  const supabase = await createClient();
  const { data } = await supabase.from('pairs').select('*');
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

// ── Roster: claim a pre-seeded name ──────────────────────────────

export async function getRosterEntries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('student_roster')
    .select('id, full_name')
    .is('claimed_by', null)
    .order('full_name');

  return data || [];
}

export async function claimRosterEntry(rosterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Guard: already claimed a name?
  const { data: alreadyClaimed } = await supabase
    .from('student_roster')
    .select('id, full_name')
    .eq('claimed_by', user.id)
    .maybeSingle();

  if (alreadyClaimed) {
    return { error: `You have already claimed the name "${alreadyClaimed.full_name}".` };
  }

  const { data: claimed, error: updateError } = await supabase
    .from('student_roster')
    .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
    .eq('id', rosterId)
    .is('claimed_by', null)
    .select('full_name')
    .maybeSingle();

  if (updateError) return { error: updateError.message };
  if (!claimed) {
    return { error: 'This name was just claimed by someone else. Please select another.' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: claimed.full_name })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath('/pairing');
  return { success: true as const, fullName: claimed.full_name };
}

// ── Pairing actions ───────────────────────────────────────────────

export async function sendPairRequest(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: pairingWindow } = await supabase
    .from('pairing_window')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (!pairingWindow || new Date() > new Date(pairingWindow.end_date)) {
    return { error: 'Pairing window is closed.' };
  }

  const { data: existingPairs } = await supabase
    .from('pairs')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (existingPairs && existingPairs.length > 0) {
    return { error: 'You are already paired.' };
  }

  const { error } = await supabase
    .from('pair_requests')
    .insert({ sender_id: user.id, receiver_id: receiverId });

  if (error) return { error: error.message };

  // If the receiver already sent a request to us, auto-pair (mutual)
  const { data: reverse } = await supabase
    .from('pair_requests')
    .select('*')
    .eq('sender_id', receiverId)
    .eq('receiver_id', user.id)
    .eq('status', 'requested')
    .maybeSingle();

  if (reverse) {
    await supabase.from('pairs').insert({ user_a: user.id, user_b: receiverId });
    await supabase.from('pair_requests').update({ status: 'matched' }).eq('id', reverse.id);
    await supabase.from('pair_requests')
      .update({ status: 'matched' })
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId);
  }

  revalidatePath('/pairing');
  return { success: true };
}

/**
 * Receiver accepts an incoming pair request.
 * Creates the pair and marks the request as 'matched'.
 */
export async function acceptPairRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch the request — only the receiver can accept it
  const { data: req, error: fetchError } = await supabase
    .from('pair_requests')
    .select('*')
    .eq('id', requestId)
    .eq('receiver_id', user.id)
    .eq('status', 'requested')
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!req) return { error: 'Request not found or already processed.' };

  // Check neither party is already paired
  const { data: existing } = await supabase
    .from('pairs')
    .select('id')
    .or(`user_a.eq.${req.sender_id},user_b.eq.${req.sender_id},user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (existing && existing.length > 0) {
    return { error: 'One of you is already paired with someone else.' };
  }

  const { error: pairError } = await supabase
    .from('pairs')
    .insert({ user_a: req.sender_id, user_b: user.id });

  if (pairError) return { error: pairError.message };

  await supabase
    .from('pair_requests')
    .update({ status: 'matched' })
    .eq('id', requestId);

  revalidatePath('/pairing');
  return { success: true };
}

/**
 * Receiver rejects an incoming pair request.
 */
export async function rejectPairRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('pair_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('receiver_id', user.id)
    .eq('status', 'requested');

  if (error) return { error: error.message };

  revalidatePath('/pairing');
  return { success: true };
}

export async function finalizePairs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .not('full_name', 'is', null);

  if (!profiles) return { error: 'No profiles found' };

  const { data: pairs } = await supabase.from('pairs').select('user_a, user_b');
  const pairedIds = new Set<string>();
  pairs?.forEach(p => { pairedIds.add(p.user_a); pairedIds.add(p.user_b); });

  const unpaired = profiles.filter(p => !pairedIds.has(p.id));

  for (let i = unpaired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unpaired[i], unpaired[j]] = [unpaired[j], unpaired[i]];
  }

  const newPairs = [];
  for (let i = 0; i < unpaired.length - 1; i += 2) {
    newPairs.push({ user_a: unpaired[i].id, user_b: unpaired[i + 1].id });
  }

  if (newPairs.length > 0) {
    await supabase.from('pairs').insert(newPairs);
  }

  await supabase.from('pairing_window').update({ is_active: false }).eq('is_active', true);

  revalidatePath('/pairing');
  revalidatePath('/pairing/admin');
  return { success: true, paired: newPairs.length * 2 };
}
