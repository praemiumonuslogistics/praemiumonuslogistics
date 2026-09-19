'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export type LoadRecord = {
  id?: string;
  landstar_pro_number: string | null;
  shipper_name?: string | null;
  origin_street?: string | null;
  origin_city: string | null;
  origin_state?: string | null;
  origin_zip?: string | null;
  destination_street?: string | null;
  destination_city: string | null;
  destination_state?: string | null;
  destination_zip?: string | null;
  driver_name: string | null;
  driver_phone?: string | null;
  driver_email?: string | null;
  receiver_name?: string | null;
  receiver_email?: string | null;
  receiver_phone?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  status: string | null;
  current_lat: number | null;
  current_lng: number | null;
  last_location_update: string | null;
  bol_url: string | null;
  pod_url: string | null;
  bol_uploaded_at: string | null;
  pod_uploaded_at: string | null;
  pickup_photo_urls?: string[] | null;
  pickup_confirmed_at?: string | null;
  delivered_at?: string | null;
  tracking_hash: string | null;
};

export function trackingStarted(load: LoadRecord) {
  return Boolean(
    load.pickup_confirmed_at ||
      load.status === 'IN_TRANSIT' ||
      load.status === 'DELIVERED'
  );
}
