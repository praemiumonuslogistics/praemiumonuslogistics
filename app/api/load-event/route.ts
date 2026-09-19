import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { formatAddress } from '../../lib/address';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const hash = typeof body?.hash === 'string' ? body.hash.trim() : '';
  const event = body?.event === 'delivery' ? 'delivery' : body?.event === 'pickup' ? 'pickup' : null;

  if (!hash || !event) {
    return NextResponse.json({ ok: false, error: 'hash and event required' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'database not configured' }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const { data: load, error } = await supabase.from('loads').select('*').eq('tracking_hash', hash).maybeSingle();
  if (error || !load) {
    return NextResponse.json({ ok: false, error: 'load not found' }, { status: 404 });
  }

  const origin = formatAddress({
    street: load.origin_street,
    city: load.origin_city,
    state: load.origin_state,
    zip: load.origin_zip,
  });
  const destination = formatAddress({
    street: load.destination_street,
    city: load.destination_city,
    state: load.destination_state,
    zip: load.destination_zip,
  });
  const pro = load.landstar_pro_number || hash;
  const base = 'https://praemiumonuslogistics.vercel.app';
  const isPickup = event === 'pickup';
  const subject = isPickup
    ? `Pickup confirmed · PRO ${pro}`
    : `Delivered · PRO ${pro}`;
  const headline = isPickup ? 'Pickup confirmed. Tracking is live.' : 'Drop-off confirmed. Proof is on file.';
  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;background:#0f172a;color:#f8fafc;border-radius:12px">
      <h2 style="color:#f59e0b;margin:0 0 8px">Praemium Onus Logistics</h2>
      <p style="color:#94a3b8;margin:0 0 16px">Landstar Agent GNV · ${isPickup ? 'Pickup' : 'Delivery'} alert</p>
      <p style="font-size:18px;font-weight:bold">${headline}</p>
      <p>PRO <strong>${escapeHtml(pro)}</strong></p>
      <p>Origin: ${escapeHtml(origin || '—')}</p>
      <p>Destination: ${escapeHtml(destination || '—')}</p>
      <p>
        <a href="${base}/track/shipper/${encodeURIComponent(hash)}" style="color:#fbbf24">Shipper tracking</a>
        &nbsp;·&nbsp;
        <a href="${base}/track/receiver/${encodeURIComponent(hash)}" style="color:#fbbf24">Receiver portal</a>
      </p>
      <p style="font-size:12px;color:#64748b">Do not chase a phone. Proof is in the portal.</p>
    </div>
  `;

  const recipients = uniqueEmails([
    load.contact_email,
    load.receiver_email,
    load.driver_email,
    process.env.AGENT_NOTIFICATION_EMAIL || 'praemiumonuslogistics@gmail.com',
  ]);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'email not configured', recipients });
  }

  const resend = new Resend(apiKey);
  const results: { email: string; id?: string; error?: string }[] = [];
  for (const email of recipients) {
    const sent = await resend.emails.send({
      from: 'Praemium Onus Logistics <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    });
    results.push({ email, id: sent.data?.id, error: sent.error?.message });
  }

  return NextResponse.json({ ok: true, event, recipients: results });
}

function uniqueEmails(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const email = value?.trim().toLowerCase();
    if (!email || !email.includes('@') || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
