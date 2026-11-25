// Sends account emails (verify your email, reset your password) through Resend.
// Set RESEND_API_KEY, and EMAIL_FROM once a sending domain is verified.
// Without a key, test sites write the link to the server log instead, so a
// tester can still finish signing up; the live site refuses, so nobody is
// left waiting for an email that will never arrive.

export interface AccountEmail {
  to: string;
  subject: string;
  heading: string;
  message: string;
  action: { label: string; url: string };
}

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function renderEmail(email: AccountEmail) {
  const text = `${email.heading}\n\n${email.message}\n\n${email.action.label}: ${email.action.url}\n\nIf you did not ask for this, you can ignore this email.\n\nBuggle Learn`;
  const html = `<!doctype html><html><body style="margin:0;background:#f6f5fb;font-family:Arial,Helvetica,sans-serif;color:#17243c">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-weight:bold;font-size:18px;margin:0 0 24px">Buggle Learn</p>
<div style="background:#ffffff;border-radius:16px;padding:28px">
<h1 style="font-size:22px;margin:0 0 12px">${escape(email.heading)}</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px">${escape(email.message)}</p>
<a href="${escape(email.action.url)}" style="display:inline-block;background:#17243c;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:999px">${escape(email.action.label)}</a>
<p style="font-size:13px;line-height:1.6;color:#526174;margin:24px 0 0">If the button does not work, copy this link into your browser:<br>${escape(email.action.url)}</p>
</div>
<p style="font-size:13px;color:#526174;margin:20px 0 0">If you did not ask for this, you can ignore this email.</p>
</div></body></html>`;
  return { text, html };
}

export async function sendAccountEmail(email: AccountEmail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.VERCEL_ENV === "production")
      throw new Error("Email sending is not configured.");
    console.warn(`[email not sent: no RESEND_API_KEY] ${email.subject}: ${email.action.url}`);
    return;
  }
  const { text, html } = renderEmail(email);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Buggle Learn <onboarding@resend.dev>",
      to: [email.to],
      subject: email.subject,
      text,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Email could not be sent (status ${response.status}).`);
}
