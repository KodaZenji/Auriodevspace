export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export interface PairRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'requested' | 'matched' | 'rejected';
  created_at: string;
}

export interface Pair {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
}

export interface PairingWindow {
  id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Added for the roster-claim flow
export interface RosterEntry {
  id: string;
  full_name: string;
  claimed_by: string | null;
  claimed_at: string | null;
}
