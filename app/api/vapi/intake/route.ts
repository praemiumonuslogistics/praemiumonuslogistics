import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const expected = process.env.VAPI_SERVER_SECRET;
  const header = request.headers.get('x-vapi-secret');
  if (expected && header !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = body?.message || body || {};
  const type = message.type;

  if (type !== 'tool-calls' && type !== 'tool.calls') {
    return NextResponse.json({ ok: true });
  }

  const calls: any[] = message.toolCallList || message.toolCalls || [];
  const results = [];
  for (const call of calls) {
    const toolCallId = call.id || call.toolCallId;
    const fn = call.function || call;
    const name = fn.name || call.name;
    let args = fn.arguments || call.arguments || {};
    if (typeof args === 'string') {
      try {
        args = JSON.parse(args);
      } catch {
        args = {};
      }
    }
    if (name !== 'create_load_intake') {
      results.push({ name, toolCallId, result: 'ignored' });
      continue;
    }
    const result = await insertQuote(args);
    results.push({ name, toolCallId, result });
  }
  return NextResponse.json({ results });
}

async function insertQuote(args: Record<string, string>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 'database not configured';

  const company = str(args.company_name || args.customer_id);
  const originZip = str(args.origin_zip);
  const destZip = str(args.destination_zip);
  if (!company || !originZip || !destZip) {
    return 'Need company, origin ZIP, and destination ZIP before logging the load.';
  }

  const notes = [
    args.contact_name ? `Contact: ${args.contact_name}` : '',
    String(args.emergency).toLowerCase() === 'true' ? 'EMERGENCY HOT LOAD' : '',
    args.pickup_date ? `Pickup: ${args.pickup_date}` : '',
    args.notes || '',
  ]
    .filter(Boolean)
    .join(' | ');

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('loads')
    .insert([
      {
        shipper_name: company,
        customer_id: company,
        origin_city: str(args.origin_city),
        origin_zip: originZip,
        origin_country: str(args.origin_country) || 'US',
        destination_city: str(args.destination_city),
        destination_zip: destZip,
        destination_country: str(args.destination_country) || 'US',
        pickup_date_from: str(args.pickup_date) || null,
        pickup_date_thru: str(args.pickup_date) || null,
        freight_type: str(args.equipment) || null,
        equipment_1: str(args.equipment)?.toUpperCase() || null,
        weight: str(args.weight),
        contact_phone: str(args.callback_phone),
        contact_email: str(args.email),
        notes: notes || null,
        status: 'QUOTE_REQUESTED',
        source: 'vapi',
        yard_line: 0,
      },
    ])
    .select('id')
    .single();

  if (error) return `Could not log load: ${error.message}`;
  return `Logged quote ${data.id} for ${company}. Darrell at GNV will price it. Do not quote a rate.`;
}

function str(value: unknown) {
  if (value == null) return '';
  const text = String(value).trim();
  return text;
}
