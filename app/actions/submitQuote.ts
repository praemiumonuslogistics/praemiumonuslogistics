'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { formatAddress } from '../lib/address';
import { flagsForDims } from '../lib/openDeck';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function submitQuoteAction(formData: {
  originStreet: string;
  originCity: string;
  originState: string;
  originZip: string;
  destinationStreet: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  freightType: string;
  weight: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  name?: string;
  role?: string;
  pickupDate?: string;
  commodity?: string;
  lengthFt?: string;
  widthFt?: string;
  heightFt?: string;
  tarpSize?: string;
  chainsRequired?: boolean;
  strapsRequired?: boolean;
  edgeProtectors?: boolean;
  coilRacks?: boolean;
  levelers?: boolean;
  loadingAccess?: string;
  notes?: string;
}) {
  try {
    const origin = formatAddress({
      street: formData.originStreet,
      city: formData.originCity,
      state: formData.originState,
      zip: formData.originZip,
    });
    const destination = formatAddress({
      street: formData.destinationStreet,
      city: formData.destinationCity,
      state: formData.destinationState,
      zip: formData.destinationZip,
    });
    const extraNotes = [
      formData.role ? `Role: ${formData.role}` : '',
      formData.name ? `Contact: ${formData.name}` : '',
      formData.pickupDate ? `Pickup: ${formData.pickupDate}` : '',
      formData.commodity ? `Commodity: ${formData.commodity}` : '',
      formData.lengthFt || formData.widthFt || formData.heightFt
        ? `Dims: ${formData.lengthFt || '?'}L x ${formData.widthFt || '?'}W x ${formData.heightFt || '?'}H ft`
        : '',
      formData.tarpSize ? `Tarp: ${formData.tarpSize}` : '',
      formData.loadingAccess ? `Loading: ${formData.loadingAccess}` : '',
      formData.notes || '',
    ]
      .filter(Boolean)
      .join(' | ');

    const { data: loadData, error: dbError } = await supabase
      .from('loads')
      .insert([
        {
          shipper_name: formData.companyName,
          origin_street: formData.originStreet,
          origin_city: formData.originCity,
          origin_state: formData.originState,
          origin_zip: formData.originZip,
          destination_street: formData.destinationStreet,
          destination_city: formData.destinationCity,
          destination_state: formData.destinationState,
          destination_zip: formData.destinationZip,
          freight_type: formData.freightType,
          equipment_1: formData.freightType,
          commodity: formData.commodity || null,
          weight: formData.weight,
          length_ft: formData.lengthFt ? Number(formData.lengthFt) : null,
          width_ft: formData.widthFt ? Number(formData.widthFt) : null,
          height_ft: formData.heightFt ? Number(formData.heightFt) : null,
          tarp_size: formData.tarpSize || null,
          chains_required: Boolean(formData.chainsRequired),
          straps_required: Boolean(formData.strapsRequired),
          edge_protectors: Boolean(formData.edgeProtectors),
          coil_racks: Boolean(formData.coilRacks),
          levelers: Boolean(formData.levelers),
          loading_access: formData.loadingAccess || null,
          oversize_flag: flagsForDims(Number(formData.widthFt) || 0, Number(formData.heightFt) || 0, formData.freightType)
            .oversize,
          stepdeck_required_flag: flagsForDims(
            Number(formData.widthFt) || 0,
            Number(formData.heightFt) || 0,
            formData.freightType
          ).stepdeckRequired,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          notes: extraNotes || null,
          status: 'QUOTE_REQUESTED',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB Error:', dbError);
    }

    const recipientEmail =
      process.env.AGENT_NOTIFICATION_EMAIL || 'praemiumonuslogistics@gmail.com';

    await resend.emails.send({
      from: 'Praemium Onus Logistics <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `New Freight Quote Request: ${origin} → ${destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #f59e0b; margin-bottom: 4px;">Praemium Onus Logistics</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 0;">Landstar Agent GNV · Quote notification</p>

          <hr style="border-color: #334155; margin: 20px 0;" />

          <table style="width: 100%; border-collapse: collapse; color: #f8fafc;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px;">Company:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.companyName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Contact:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.name || '')} ${escapeHtml(formData.role || '')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Lane:</td>
              <td style="padding: 8px 0; color: #38bdf8;">${escapeHtml(origin)} → ${escapeHtml(destination)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Equipment:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.freightType)} (${formData.weight ? escapeHtml(formData.weight) + ' lbs' : 'Weight unspecified'})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Commodity:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.commodity || 'not given')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Dims:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.lengthFt || '?')}L × ${escapeHtml(formData.widthFt || '?')}W × ${escapeHtml(formData.heightFt || '?')}H ft · tarp ${escapeHtml(formData.tarpSize || 'NONE')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Pickup:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.pickupDate || 'not given')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Contact Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(formData.contactEmail)}" style="color: #fbbf24;">${escapeHtml(formData.contactEmail)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Contact Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${escapeHtml(formData.contactPhone)}" style="color: #fbbf24;">${escapeHtml(formData.contactPhone)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Notes:</td>
              <td style="padding: 8px 0;">${escapeHtml(formData.notes || '')}</td>
            </tr>
          </table>

          <hr style="border-color: #334155; margin: 20px 0;" />
          
          <p style="font-size: 12px; color: #64748b;">
            Praemium Onus Logistics Dispatch Engine. Record saved to database ${loadData?.id ? `(ID: ${loadData.id})` : ''}.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Server Action Error:', err);
    return { success: false, error: err.message || 'Failed to submit quote' };
  }
}
