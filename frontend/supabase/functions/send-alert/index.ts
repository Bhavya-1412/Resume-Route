// Supabase Edge Function: send-alert
// Deploy: supabase functions deploy send-alert --no-verify-jwt
// Then set secrets:
//   supabase secrets set GMAIL_EMAIL=soniyash4095@gmail.com GMAIL_APP_PASSWORD="uiry pwps bqbc qrtl"
//
// Sends a job-match alert email via Gmail SMTP using denomailer.

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type JobAlert = {
  title: string;
  company: string;
  location?: string;
  score: number;
  url: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { to, jobs } = (await req.json()) as { to: string; jobs: JobAlert[] };
    if (!to || !jobs?.length) {
      return new Response(JSON.stringify({ error: "Missing to or jobs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = Deno.env.get("GMAIL_EMAIL")!;
    const pass = Deno.env.get("GMAIL_APP_PASSWORD")!;

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: user, password: pass },
      },
    });

    const rows = jobs
      .map(
        (j) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee"><b>${j.title}</b><br/><span style="color:#666">${j.company}${j.location ? " · " + j.location : ""}</span></td><td style="padding:8px;text-align:right;border-bottom:1px solid #eee"><span style="background:#e7f3ff;color:#0A66C2;padding:2px 8px;border-radius:999px;font-weight:600">${j.score}% match</span><br/><a href="${j.url}" style="color:#0A66C2">View →</a></td></tr>`,
      )
      .join("");

    const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:auto"><h2 style="color:#0A66C2">ResumeRoute — new strong matches</h2><p>We found ${jobs.length} job${jobs.length > 1 ? "s" : ""} matching 70%+ of your skills.</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="color:#666;font-size:12px;margin-top:24px">You're receiving this because you uploaded a resume to ResumeRoute.</p></div>`;

    await client.send({
      from: `ResumeRoute <${user}>`,
      to,
      subject: `${jobs.length} new strong job match${jobs.length > 1 ? "es" : ""} for you`,
      content: "You have new ResumeRoute job matches.",
      html,
    });
    await client.close();

    return new Response(JSON.stringify({ ok: true, sent: jobs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
