import fs from "fs";
import path from "path";
import { COMPANY } from "@/lib/constants";

const NAVY = "#0B3D3A";
const TEAL = "#0F5C56";
const GOLD = "#C9A227";
const GOLD_LIGHT = "#E8C547";
const CREAM = "#F0F5F4";
const WHITE = "#FFFFFF";
const INK = "#1A2E2C";
const MUTED = "#5C6F6C";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://sufloriacleaning.com").replace(
    /\/$/,
    ""
  );
}

/** Prefer inline CID logo; fall back to hosted URL. */
export function getBrandLogoAttachment():
  | { filename: string; content: Buffer; contentId: string }
  | null {
  const candidates = [
    "logo-mark.png",
    "logo-seal.png",
    "logo.jpg",
  ];
  for (const filename of candidates) {
    const full = path.join(process.cwd(), "public", "brand", filename);
    try {
      if (fs.existsSync(full)) {
        return {
          filename,
          content: fs.readFileSync(full),
          contentId: "sufloria-logo",
        };
      }
    } catch {
      // try next
    }
  }
  return null;
}

function logoBlock(hasInlineLogo: boolean): string {
  const hosted = `${siteOrigin()}/brand/logo-mark.png`;
  const src = hasInlineLogo ? "cid:sufloria-logo" : hosted;
  return `
    <img
      src="${src}"
      width="88"
      height="88"
      alt="${escapeHtml(COMPANY.name)}"
      style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;width:88px;height:auto;max-width:88px;"
    />
  `;
}

function emailShell(options: {
  title: string;
  preheader: string;
  bodyHtml: string;
  hasInlineLogo: boolean;
}): string {
  const { title, preheader, bodyHtml, hasInlineLogo } = options;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${WHITE};border:3px solid ${GOLD};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:${NAVY};padding:28px 24px 20px;text-align:center;">
              ${logoBlock(hasInlineLogo)}
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD_LIGHT};font-weight:700;">
                ${escapeHtml(COMPANY.name)}
              </p>
              <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:15px;font-style:italic;color:${GOLD};">
                ${escapeHtml(COMPANY.tagline)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:6px;background:linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;color:${INK};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY};border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${WHITE};">
                      ${escapeHtml(COMPANY.name)}
                    </p>
                    <p style="margin:0;font-size:12px;line-height:1.55;color:${GOLD_LIGHT};">
                      <a href="tel:${escapeHtml(COMPANY.phoneHref.replace("tel:", ""))}" style="color:${GOLD_LIGHT};text-decoration:none;">${escapeHtml(COMPANY.phoneDisplayLocal)}</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:${escapeHtml(COMPANY.email)}" style="color:${GOLD_LIGHT};text-decoration:none;">${escapeHtml(COMPANY.email)}</a>
                    </p>
                    <p style="margin:10px 0 0;font-size:11px;color:#9BB5B1;">
                      Derby &amp; surrounding areas · Company No: ${escapeHtml(COMPANY.companyNumber)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};text-align:center;">
          ${escapeHtml(COMPANY.uspHeadline)}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E4EBEA;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${TEAL};width:34%;vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #E4EBEA;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${INK};vertical-align:top;">
        ${value}
      </td>
    </tr>
  `;
}

export function buildBusinessQuoteEmailHtml(input: {
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
  hasInlineLogo: boolean;
}): string {
  const notesHtml = escapeHtml(input.notes).replace(/\n/g, "<br />");
  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${NAVY};">
      New quote request
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:${MUTED};">
      A new enquiry has arrived from the Sufloria website.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${detailRow("Name", escapeHtml(input.name))}
      ${detailRow(
        "Email",
        `<a href="mailto:${escapeHtml(input.email)}" style="color:${TEAL};text-decoration:none;font-weight:700;">${escapeHtml(input.email)}</a>`
      )}
      ${detailRow(
        "Phone",
        `<a href="tel:${escapeHtml(input.phone)}" style="color:${TEAL};text-decoration:none;font-weight:700;">${escapeHtml(input.phone)}</a>`
      )}
      ${detailRow("Service", `<strong>${escapeHtml(input.service)}</strong>`)}
    </table>
    <div style="margin:22px 0 0;padding:16px 18px;background:${CREAM};border-left:4px solid ${GOLD};border-radius:0 10px 10px 0;">
      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${TEAL};font-weight:700;">
        Enquiry details
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:${INK};">
        ${notesHtml}
      </p>
    </div>
    <p style="margin:22px 0 0;">
      <a href="${siteOrigin()}/admin/leads" style="display:inline-block;background:${NAVY};color:${WHITE};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px;border:2px solid ${GOLD};">
        Open in admin
      </a>
    </p>
  `;

  return emailShell({
    title: `New quote — ${input.service}`,
    preheader: `${input.name} requested ${input.service}`,
    bodyHtml: body,
    hasInlineLogo: input.hasInlineLogo,
  });
}

export function buildCustomerQuoteEmailHtml(input: {
  name: string;
  service: string;
  hasInlineLogo: boolean;
}): string {
  const firstName = input.name.trim().split(/\s+/)[0] || input.name;
  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${NAVY};">
      We've received your enquiry
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${INK};">
      Hi ${escapeHtml(firstName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:${INK};">
      Thank you for contacting <strong style="color:${NAVY};">${escapeHtml(COMPANY.name)}</strong>.
      We've received your enquiry about <strong style="color:${NAVY};">${escapeHtml(input.service)}</strong>
      and will get back to you shortly.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 18px;background:${CREAM};border:1px solid ${GOLD};border-radius:12px;">
      <tr>
        <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${TEAL};font-weight:700;">
            Need us sooner?
          </p>
          <p style="margin:0;">
            Call or WhatsApp
            <a href="${escapeHtml(COMPANY.phoneHref)}" style="color:${NAVY};font-weight:700;text-decoration:none;">
              ${escapeHtml(COMPANY.phoneDisplayLocal)}
            </a>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:15px;color:${INK};">
      Kind regards,<br />
      <strong style="color:${NAVY};">${escapeHtml(COMPANY.name)}</strong><br />
      <span style="color:${MUTED};font-size:13px;">${escapeHtml(COMPANY.tagline)}</span>
    </p>
  `;

  return emailShell({
    title: "We've received your enquiry",
    preheader: `Thanks ${firstName} — we've got your ${input.service} enquiry.`,
    bodyHtml: body,
    hasInlineLogo: input.hasInlineLogo,
  });
}
