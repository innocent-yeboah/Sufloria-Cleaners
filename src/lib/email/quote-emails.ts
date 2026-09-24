import fs from "fs";
import path from "path";
import { COMPANY } from "@/lib/constants";

const NAVY = "#0B3D3A";
const TEAL = "#0F5C56";
const GOLD = "#C9A227";
const GOLD_SOFT = "#D4AF37";
const PAGE = "#EEF2F1";
const WHITE = "#FFFFFF";
const INK = "#142824";
const MUTED = "#5A6E6A";
const RULE = "#D7E0DE";

/** Max inline logo size (bytes). Larger files use hosted URL only. */
const MAX_INLINE_LOGO_BYTES = 220_000;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseEmailRecipients(raw: string | undefined | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(raw || "").split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const angled = trimmed.match(/<([^>]+)>/);
    const email = (angled ? angled[1] : trimmed).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://sufloriacleaning.com").replace(
    /\/$/,
    ""
  );
}

export function getBrandLogoAttachment():
  | { filename: string; content: Buffer; contentId: string }
  | null {
  const candidates = ["logo.jpg", "logo-mark.png", "logo-seal.png"];
  for (const filename of candidates) {
    const full = path.join(process.cwd(), "public", "brand", filename);
    try {
      if (!fs.existsSync(full)) continue;
      const content = fs.readFileSync(full);
      if (content.length > MAX_INLINE_LOGO_BYTES) continue;
      return {
        filename,
        content,
        contentId: "sufloria-logo",
      };
    } catch {
      // try next
    }
  }
  return null;
}

function logoImg(hasInlineLogo: boolean, width = 64): string {
  const hosted = `${siteOrigin()}/brand/logo-mark.png`;
  const src = hasInlineLogo ? "cid:sufloria-logo" : hosted;
  return `<img src="${src}" width="${width}" alt="${escapeHtml(COMPANY.name)}" style="display:block;border:0;outline:none;text-decoration:none;width:${width}px;height:auto;max-width:${width}px;" />`;
}

function emailShell(options: {
  title: string;
  preheader: string;
  eyebrow: string;
  bodyHtml: string;
  hasInlineLogo: boolean;
}): string {
  const { title, preheader, eyebrow, bodyHtml, hasInlineLogo } = options;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${PAGE};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${WHITE};border:1px solid ${RULE};">
          <!-- Top brand bar -->
          <tr>
            <td style="height:4px;background-color:${NAVY};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="height:3px;background-color:${GOLD};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 36px 22px;background-color:${WHITE};border-bottom:1px solid ${RULE};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="width:72px;">
                    ${logoImg(hasInlineLogo, 56)}
                  </td>
                  <td valign="middle" style="padding-left:16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;letter-spacing:0.02em;color:${NAVY};">
                      ${escapeHtml(COMPANY.name)}
                    </p>
                    <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;color:${MUTED};">
                      ${escapeHtml(COMPANY.tagline)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Eyebrow -->
          <tr>
            <td style="padding:28px 36px 0;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${GOLD};">
                ${escapeHtml(eyebrow)}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:12px 36px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:8px 36px 28px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${RULE};">
                <tr>
                  <td style="padding-top:22px;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:${NAVY};">The Sufloria Team</p>
                    <p style="margin:0 0 14px;font-size:13px;color:${MUTED};">${escapeHtml(COMPANY.uspHeadline)}</p>
                    <p style="margin:0;font-size:13px;line-height:1.6;color:${TEAL};">
                      <a href="${escapeHtml(COMPANY.phoneHref)}" style="color:${TEAL};text-decoration:none;font-weight:700;">${escapeHtml(COMPANY.phoneDisplayLocal)}</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="mailto:${escapeHtml(COMPANY.email)}" style="color:${TEAL};text-decoration:none;">${escapeHtml(COMPANY.email)}</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="${siteOrigin()}" style="color:${TEAL};text-decoration:none;">sufloriacleaning.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 36px;background-color:${NAVY};font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD_SOFT};">
                ${escapeHtml(COMPANY.name)}
              </p>
              <p style="margin:0;font-size:12px;line-height:1.55;color:#B7C9C5;">
                Professional property cleaning across Derby and surrounding areas.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#8FA6A1;">
                © ${year} ${escapeHtml(COMPANY.legalName.toUpperCase())}. Registered in England &amp; Wales.
                Company No: ${escapeHtml(COMPANY.companyNumber)}. All rights reserved.
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:3px;background-color:${GOLD};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string, last = false): string {
  const border = last ? "none" : `1px solid ${RULE}`;
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:${border};width:32%;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 0;border-bottom:${border};vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${INK};">
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
    <h1 style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:${NAVY};">
      New website enquiry
    </h1>
    <p style="margin:0 0 22px;font-size:15px;color:${MUTED};">
      A prospective client has submitted a quote request. Review the details below and respond promptly.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
      ${detailRow("Client", escapeHtml(input.name))}
      ${detailRow(
        "Email",
        `<a href="mailto:${escapeHtml(input.email)}" style="color:${NAVY};text-decoration:none;font-weight:700;">${escapeHtml(input.email)}</a>`
      )}
      ${detailRow(
        "Phone",
        `<a href="tel:${escapeHtml(input.phone)}" style="color:${NAVY};text-decoration:none;font-weight:700;">${escapeHtml(input.phone)}</a>`
      )}
      ${detailRow("Service", `<span style="font-weight:700;color:${NAVY};">${escapeHtml(input.service)}</span>`, true)}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0;background-color:${PAGE};border-left:3px solid ${GOLD};">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
            Brief
          </p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:${INK};">
            ${notesHtml}
          </p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 8px;">
      <tr>
        <td style="background-color:${NAVY};">
          <a href="${siteOrigin()}/admin/leads" style="display:inline-block;padding:13px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.04em;text-decoration:none;color:${WHITE};">
            Review lead in admin
          </a>
        </td>
      </tr>
    </table>
  `;

  return emailShell({
    title: `New enquiry — ${input.service}`,
    preheader: `${input.name} requested ${input.service}`,
    eyebrow: "Operations notification",
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
  const whatsapp = `https://wa.me/${COMPANY.whatsapp}`;
  const body = `
    <h1 style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:${NAVY};">
      Enquiry received
    </h1>
    <p style="margin:0 0 14px;font-size:15px;color:${INK};">
      Dear ${escapeHtml(firstName)},
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:${INK};">
      Thank you for contacting <strong>${escapeHtml(COMPANY.name)}</strong>.
      We have received your enquiry regarding <strong>${escapeHtml(input.service)}</strong>
      and a member of our team will review the details shortly.
    </p>
    <p style="margin:0 0 22px;font-size:15px;color:${INK};">
      We aim to respond within one business day with clear next steps and a tailored quotation where appropriate.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;border:1px solid ${RULE};">
      <tr>
        <td style="padding:18px 20px;background-color:${PAGE};">
          <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${GOLD};">
            What happens next
          </p>
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${INK};">
            1. We review your property details and service requirements.
          </p>
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${INK};">
            2. We confirm suitability, timing, and any site access notes.
          </p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${INK};">
            3. We send your quotation and booking options.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 18px;font-size:15px;color:${INK};">
      If your requirement is urgent, please call or message us directly and we will prioritise your request.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
      <tr>
        <td style="background-color:${NAVY};padding:0;">
          <a href="${escapeHtml(COMPANY.phoneHref)}" style="display:inline-block;padding:13px 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;color:${WHITE};">
            Call ${escapeHtml(COMPANY.phoneDisplayLocal)}
          </a>
        </td>
        <td style="width:10px;">&nbsp;</td>
        <td style="background-color:${WHITE};border:1px solid ${NAVY};padding:0;">
          <a href="${escapeHtml(whatsapp)}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;color:${NAVY};">
            WhatsApp
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:22px 0 0;font-size:15px;color:${INK};">
      Yours sincerely,
    </p>
  `;

  return emailShell({
    title: "Enquiry confirmation — Sufloria Cleaners",
    preheader: `Dear ${firstName}, we have received your ${input.service} enquiry.`,
    eyebrow: "Client confirmation",
    bodyHtml: body,
    hasInlineLogo: input.hasInlineLogo,
  });
}
