import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aiiyhewywbomkrxzszvt.supabase.co';

const supabasePublishableKey = 'sb_publishable_azMzKfn3g1z2MDjdYkBDzg_F_lXQEjS';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
