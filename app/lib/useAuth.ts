'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from './supabaseBrowser';

export type Profile = {
  id: string;
  company_name: string;
  role: 'SHIPPER' | 'CARRIER' | 'AGENT';
  phone_number: string | null;
  deck_type?: string | null;
  deck_length_ft?: number | null;
  ramp_available?: boolean | null;
  tarp_sizes?: string | null;
  strap_count?: number | null;
  chain_count?: number | null;
};

export function dashboardPath(role?: string | null) {
  if (role === 'CARRIER') return '/dashboard/carrier';
  if (role === 'AGENT') return '/agent/dashboard';
  return '/dashboard/shipper';
}

export function useAuth() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    async function load(nextUser: User | null) {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase!.from('profiles').select('*').eq('id', nextUser.id).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        return;
      }
      const meta = nextUser.user_metadata || {};
      const role = String(meta.role || 'SHIPPER').toUpperCase();
      const row = {
        id: nextUser.id,
        company_name: String(meta.company_name || 'Unnamed company'),
        role: (role === 'CARRIER' || role === 'AGENT' ? role : 'SHIPPER') as Profile['role'],
        phone_number: meta.phone_number ? String(meta.phone_number) : null,
      };
      await supabase!.from('profiles').upsert(row);
      setProfile(row);
    }

    supabase.auth.getSession().then(({ data }) => {
      load(data.session?.user ?? null).finally(() => setReady(true));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = getSupabase();
    await supabase?.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return { ready, user, profile, signOut };
}
