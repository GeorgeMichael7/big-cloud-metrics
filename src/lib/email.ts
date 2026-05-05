/**
 * Email utilities using Resend.
 * All emails are sent from the address configured in EMAIL_FROM env var.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Big Cloud Metrics <noreply@bigcloudmetrics.com>";

// ── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Inter, Arial, sans-serif; background:#0F172A; color:#F1F5F9; margin:0; padding:0; }
    .container { max-width:600px; margin:0 auto; padding:32px 24px; }
    .logo { font-size:20px; font-weight:700; color:#60A5FA; margin-bottom:32px; }
    .card { background:#1E293B; border-radius:12px; padding:24px; margin-bottom:16px; }
    .heading { font-size:22px; font-weight:700; color:#F1F5F9; margin:0 0 8px 0; }
    .sub { font-size:14px; color:#94A3B8; margin:0 0 24px 0; }
    .stat { display:inline-block; background:#0F172A; border-radius:8px; padding:12px 20px; margin:4px; }
    .stat-value { font-size:28px; font-weight:800; color:#60A5FA; }
    .stat-label { font-size:12px; color:#64748B; }
    .alert { background:#7F1D1D; border-left:4px solid #EF4444; border-radius:8px; padding:16px; }
    .footer { margin-top:32px; font-size:12px; color:#475569; text-align:center; }
    .btn { display:inline-block; background:#3B82F6; color:white; text-decoration:none;
           padding:12px 24px; border-radius:8px; font-weight:600; margin-top:16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">☁️ Big Cloud Metrics AI</div>
    ${content}
    <div class="footer">Pill Cloud Specialty Pharmacy of Long Island<br/>This is an automated message — do not reply.</div>
  </div>
</body>
</html>`;
}

// ── Send Functions ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  name: string,
  password: string,
  role: string
) {
  const html = baseTemplate(`
    <div class="card">
      <div class="heading">Welcome to Big Cloud Metrics AI, ${name}! 👋</div>
      <div class="sub">Your account has been created by the administrator.</div>
      <p>Your login credentials:</p>
      <div class="card" style="background:#0F172A;">
        <strong>Email:</strong> ${to}<br/>
        <strong>Temporary Password:</strong> <code style="color:#60A5FA;">${password}</code><br/>
        <strong>Role:</strong> ${role}
      </div>
      <p>Please log in and change your password immediately.</p>
      <a href="${process.env.NEXTAUTH_URL}/login" class="btn">Log In Now →</a>
    </div>`);

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Big Cloud Metrics AI — Your Account is Ready",
    html,
  });
}

export async function sendDailySummaryEmail(
  to: string[],
  date: string,
  teamStats: { metric: string; total: number; target: number | null }[],
  topPerformers: { name: string; metric: string; value: number }[]
) {
  const statsHtml = teamStats
    .map(
      (s) => `
      <div class="stat">
        <div class="stat-value">${s.total}</div>
        <div class="stat-label">${s.metric}${s.target ? ` / ${s.target}` : ""}</div>
      </div>`
    )
    .join("");

  const topHtml = topPerformers
    .map((p) => `<li><strong>${p.name}</strong> — ${p.metric}: ${p.value}</li>`)
    .join("");

  const html = baseTemplate(`
    <div class="card">
      <div class="heading">Daily Summary — ${date}</div>
      <div class="sub">Here's how the team performed today.</div>
      <div>${statsHtml}</div>
    </div>
    ${topPerformers.length > 0 ? `
    <div class="card">
      <strong>🏆 Top Performers Today</strong>
      <ul style="color:#94A3B8; margin-top:12px;">${topHtml}</ul>
    </div>` : ""}
    <a href="${process.env.NEXTAUTH_URL}/manager" class="btn">View Full Dashboard →</a>`);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `📊 Daily Summary — ${date} | Big Cloud Metrics AI`,
    html,
  });
}

export async function sendMidDayAlertEmail(
  to: string[],
  belowTarget: { metric: string; current: number; target: number; pct: number }[]
) {
  if (belowTarget.length === 0) return;

  const alertsHtml = belowTarget
    .map(
      (a) => `
      <div class="alert" style="margin-bottom:8px;">
        <strong>${a.metric}</strong>: ${a.current} / ${a.target} (${a.pct}% complete)
      </div>`
    )
    .join("");

  const html = baseTemplate(`
    <div class="card">
      <div class="heading">⚠️ Mid-Day Performance Alert</div>
      <div class="sub">The following metrics are significantly below target at 1:00 PM.</div>
      ${alertsHtml}
      <p style="color:#94A3B8; font-size:14px;">Consider redirecting team focus for the afternoon shift.</p>
      <a href="${process.env.NEXTAUTH_URL}/manager" class="btn">View Dashboard →</a>
    </div>`);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Mid-Day Alert — Action Needed | Big Cloud Metrics AI`,
    html,
  });
}

export async function sendShiftReminderEmail(to: string[], name: string) {
  const html = baseTemplate(`
    <div class="card">
      <div class="heading">⏰ 30-Minute Reminder, ${name}!</div>
      <div class="sub">The shift ends at 6:00 PM — make sure all your metrics are logged.</div>
      <p>Don't let your hard work go uncounted. Log any remaining metrics now.</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">Log My Metrics →</a>
    </div>`);

  return resend.emails.send({
    from: FROM,
    to: [to[0]],
    subject: "⏰ Shift Ends in 30 Minutes — Log Your Metrics!",
    html,
  });
}
