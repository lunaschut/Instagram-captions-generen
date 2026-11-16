import { createClient } from '@supabase/supabase-js';

// The Supabase URL and publishable key are meant to be public (they ship in the
// browser bundle). Data is protected by Row Level Security in the database:
// every user can only read and change their own saved captions.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bpcdympkomhkixyeadpg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_oGjmzdN4sdpfJsVHPazjxw_R_R9DNjV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
