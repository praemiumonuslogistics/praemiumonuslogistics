'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export type LoadRecord = {
  landstar_pro_number: string | null;
  origin_city: string | null;
  destination_city: string | null;
  driver_name: string | null;
  status: string | null;
  current_lat: number | null;
  current_lng: number | null;
  last_location_update: string | null;
  bol_url: string | null;
  pod_url: string | null;
  bol_uploaded_at: string | null;
  pod_uploaded_at: string | null;
  tracking_hash: string | null;
};
