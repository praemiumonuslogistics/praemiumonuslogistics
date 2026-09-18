'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitQuoteAction(formData: {
  origin: string;
  destination: string;
  freightType: string;
  weight: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
}) {
  try {
    const { data: loadData, error: dbError } = await supabase
      .from('loads')
      .insert([
        {
          shipper_name: formData.companyName,
          origin_city: formData.origin,
          destination_city: formData.destination,
          status: 'BOOKED',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB Error:', dbError);
    }

    const recipientEmail = process.env.AGENT_NOTIFICATION_EMAIL || 'your-email@example.com';

    await resend.emails.send({
      from: 'Praemium Onus Logistics <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `🚨 New Freight Quote Request: ${formData.origin} ➔ ${formData.destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #f59e0b; margin-bottom: 4px;">Praemium Onus Logistics</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 0;">Landstar Agent Dispatch & Quote Notification</p>
          
          <hr style="border-color: #334155; margin: 20px 0;" />
          
          <table style="width: 100%; border-collapse: collapse; color: #f8fafc;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px;">Shipper Company:</td>
              <td style="padding: 8px 0;">${formData.companyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Lane:</td>
              <td style="padding: 8px 0; color: #38bdf8;">${formData.origin} ➔ ${formData.destination}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Equipment Type:</td>
              <td style="padding: 8px 0;">${formData.freightType} (${formData.weight ? formData.weight + ' lbs' : 'Weight unspecified'})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Contact Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${formData.contactEmail}" style="color: #fbbf24;">${formData.contactEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Contact Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${formData.contactPhone}" style="color: #fbbf24;">${formData.contactPhone}</a></td>
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
