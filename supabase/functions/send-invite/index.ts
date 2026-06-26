import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@codepilot-ai.com';
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const resend = new Resend(RESEND_API_KEY);

interface InvitePayload {
  email: string;
  name: string;
  role: string;
  invitedByName: string;
  invitationId: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const payload: InvitePayload = await req.json();
    const { email, name, role, invitedByName, invitationId } = payload;

    if (!email || !name) {
      return new Response(JSON.stringify({ error: 'email and name are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured — skipping email send');
      return new Response(JSON.stringify({ ok: true, skipped: true, message: 'Email not sent: RESEND_API_KEY not configured. Set it in Supabase Edge Function secrets.' }), { headers: { 'Content-Type': 'application/json' } });
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `You've been invited to join CodePilot AI`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0D1117; margin: 0; padding: 40px;">
          <div style="max-width: 480px; margin: 0 auto; background: #161B22; border: 1px solid #30363D; border-radius: 12px; padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 48px; height: 48px; margin: 0 auto 16px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h1 style="color: #F0F6FC; font-size: 24px; margin: 0;">You're invited to <strong style="color: #3B82F6;">CodePilot AI</strong></h1>
            </div>
            <p style="color: #8B949E; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              <strong style="color: #F0F6FC;">${invitedByName}</strong> has invited you to join their team as <strong style="color: #58A6FF;">${role}</strong>.
            </p>
            <div style="background: #0D1117; border: 1px solid #30363D; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #8B949E; font-size: 13px; margin: 0 0 8px;">Team Role</p>
              <p style="color: #F0F6FC; font-size: 15px; margin: 0; font-weight: 600;">${role}</p>
            </div>
            <a href="${APP_URL}/signup?invitation=${invitationId}&email=${encodeURIComponent(email)}"
               style="display: block; text-align: center; background: #3B82F6; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; margin-bottom: 24px;">
              Accept Invitation
            </a>
            <p style="color: #484F58; font-size: 12px; text-align: center; margin: 0;">
              This invitation expires in 30 days. If you weren't expecting this, you can ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('send-invite error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
