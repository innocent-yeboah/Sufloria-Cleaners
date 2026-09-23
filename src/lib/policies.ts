import { COMPANY } from "@/lib/constants";

export type PolicyBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export type PolicySection = {
  id: string;
  number: string;
  title: string;
  summary: string;
  blocks: PolicyBlock[];
};

const legalName = COMPANY.legalName;
const email = COMPANY.email;
const phoneIntl = COMPANY.phone;

export const POLICY_INTRO = `These policies apply alongside any written quotation or contract. For privacy and website terms, see our legal pages in the footer.`;

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "booking-cancellation",
    number: "01",
    title: "Booking & Cancellation Policy",
    summary:
      "How bookings are confirmed, access works, and how cancellations are handled.",
    blocks: [
      {
        type: "h3",
        text: "How a booking is confirmed",
      },
      {
        type: "p",
        text: "A booking is confirmed when we accept your request in writing (email or message) and you agree the scope, date, time, access arrangements, and price (or rate).",
      },
      {
        type: "p",
        text: "For contract work, confirmation follows our written quotation and your signed or emailed acceptance of the schedule and terms.",
      },
      {
        type: "h3",
        text: "Access to the property",
      },
      {
        type: "p",
        text: "You (or your agent) must provide safe, timely access at the agreed time. This may include keys, codes, concierge arrangements, or an on-site contact.",
      },
      {
        type: "p",
        text: "If we cannot gain access after a reasonable attempt, the visit may be treated as a late cancellation and charged as set out below, unless we agree otherwise.",
      },
      {
        type: "h3",
        text: "Cancellation and rescheduling (one-off cleans)",
      },
      {
        type: "ul",
        items: [
          "More than 48 hours’ notice: free to cancel or reschedule subject to availability.",
          "24–48 hours’ notice: up to 50% of the agreed fee may be charged.",
          "Less than 24 hours’ notice or no access: up to 100% of the agreed fee may be charged.",
        ],
      },
      {
        type: "p",
        text: "We will always try to rebook first where that is practical for both parties.",
      },
      {
        type: "h3",
        text: "Cancellation (contract clients)",
      },
      {
        type: "p",
        text: "Ongoing contracts may be ended by either party with the notice period stated in your agreement (typically 30 days in writing), unless a different period is agreed.",
      },
      {
        type: "p",
        text: "Missed visits caused by client access issues may still be chargeable under the contract schedule.",
      },
    ],
  },
  {
    id: "payment-terms",
    number: "02",
    title: "Payment Terms",
    summary:
      "When invoices are due for residential, turnover, and commercial work.",
    blocks: [
      {
        type: "h3",
        text: "One-off residential & turnover cleans",
      },
      {
        type: "ul",
        items: [
          "Payment is due on completion unless we have agreed otherwise in writing.",
          "We may request a deposit or full pre-payment for first-time clients or larger jobs.",
          "Accepted methods: bank transfer and other methods confirmed at booking.",
        ],
      },
      {
        type: "h3",
        text: "Contract & commercial clients",
      },
      {
        type: "ul",
        items: [
          "Invoices are typically issued monthly in arrears (or as stated in your agreement).",
          "Standard payment terms: 14–30 days from invoice date, as agreed in writing.",
          "Late payment may incur interest and recovery costs under the Late Payment of Commercial Debts (Interest) Act 1998 where applicable.",
        ],
      },
      {
        type: "h3",
        text: "Pricing",
      },
      {
        type: "p",
        text: "Prices on our website are available upon request. Final quotes reflect property size, condition, location, access, frequency, and any add-ons.",
      },
      {
        type: "p",
        text: "We will confirm the price before work starts. Changes to scope may change the price — we will discuss this with you first where practicable.",
      },
    ],
  },
  {
    id: "service-guarantee",
    number: "03",
    title: "Service Guarantee & Complaints Policy",
    summary: "Our satisfaction guarantee and how we handle concerns.",
    blocks: [
      {
        type: "h3",
        text: "Satisfaction guarantee",
      },
      {
        type: "p",
        text: "If any area of a clean falls short of the agreed standard, we will return to put it right at no extra cost, provided you report it within 48 hours of the clean.",
      },
      {
        type: "p",
        text: "The re-visit covers the areas reported and agreed — not a full re-clean of the property unless we agree that is necessary.",
      },
      {
        type: "h3",
        text: "How to raise a complaint",
      },
      {
        type: "p",
        text: `Contact us by email at ${email} or by phone on ${phoneIntl} as soon as possible, with the booking date, address, and a clear description of the issue (photos help).`,
      },
      {
        type: "ul",
        items: [
          "We aim to acknowledge complaints within 2 working days.",
          "We aim to propose a resolution (re-clean, credit, or other remedy) within 5 working days.",
        ],
      },
      {
        type: "h3",
        text: "Refunds",
      },
      {
        type: "p",
        text: "Refunds or credits are considered where we cannot remedy the issue with a re-visit, or where we agree a refund is the fair outcome. Partial refunds may apply if only part of the service was affected.",
      },
      {
        type: "h3",
        text: "Escalation",
      },
      {
        type: "p",
        text: "If you are not satisfied with our response, ask for the matter to be reviewed by a senior member of the team. We will confirm the outcome in writing.",
      },
    ],
  },
  {
    id: "health-safety",
    number: "04",
    title: "Health & Safety Policy",
    summary:
      "Our commitment to safe working for staff, clients, and visitors.",
    blocks: [
      {
        type: "h3",
        text: "Statement of commitment",
      },
      {
        type: "p",
        text: `${legalName} is committed to providing a safe and healthy working environment for our employees and anyone affected by our work, so far as is reasonably practicable, in line with the Health and Safety at Work etc. Act 1974 and related UK regulations.`,
      },
      {
        type: "h3",
        text: "Chemicals & equipment (COSHH)",
      },
      {
        type: "ul",
        items: [
          "Cleaning chemicals are selected, stored, labelled, and used in accordance with COSHH assessments and manufacturer instructions.",
          "Safety data sheets are available to staff and, on request, to clients for products used on site.",
          "Equipment is maintained and used only by trained operatives.",
        ],
      },
      {
        type: "h3",
        text: "PPE and manual handling",
      },
      {
        type: "p",
        text: "Suitable personal protective equipment is provided and must be worn where required. Staff are trained in safe manual handling and to request assistance for heavy or awkward loads.",
      },
      {
        type: "h3",
        text: "Site-specific risk assessment",
      },
      {
        type: "p",
        text: "Higher-risk or unfamiliar sites may require a site-specific risk assessment before work begins. Clients must tell us about known hazards (e.g. fragile surfaces, asbestos surveys, restricted access).",
      },
      {
        type: "h3",
        text: "Lone working & incident reporting",
      },
      {
        type: "ul",
        items: [
          "Lone working is managed with check-in procedures and clear escalation if a worker cannot be reached.",
          "All accidents, near misses, and property damage must be reported promptly to a supervisor and recorded.",
        ],
      },
    ],
  },
  {
    id: "insurance-liability",
    number: "05",
    title: "Insurance & Liability Policy",
    summary: "Cover we hold and how damage claims are handled.",
    blocks: [
      {
        type: "h3",
        text: "Cover held",
      },
      {
        type: "ul",
        items: [
          "Public Liability Insurance — cover for third-party injury or property damage arising from our work.",
          "Employer’s Liability Insurance — as required for our employees.",
          "Certificates of insurance are available on request.",
        ],
      },
      {
        type: "h3",
        text: "Reporting damage",
      },
      {
        type: "p",
        text: "Please report any suspected damage as soon as possible and within 48 hours of the clean, with photos and a description. Do not discard damaged items until we have had a chance to inspect where reasonable.",
      },
      {
        type: "h3",
        text: "Limits of liability",
      },
      {
        type: "p",
        text: "Our liability is limited to the cover and terms of our insurance policies and applicable law. We are not liable for pre-existing damage, wear and tear, or loss arising from incorrect information, unsafe access, or client instructions that we reasonably follow.",
      },
      {
        type: "p",
        text: "We recommend you keep valuables secure and inform us of fragile or high-value items before we start.",
      },
    ],
  },
  {
    id: "staff-conduct",
    number: "06",
    title: "Staff Conduct, Uniform & ID Policy",
    summary:
      "How our team present themselves and behave on your premises.",
    blocks: [
      {
        type: "h3",
        text: "Identification",
      },
      {
        type: "ul",
        items: [
          "Operatives wear company uniform and carry ID badges while on client sites.",
          "You may ask to see ID on arrival. If someone cannot identify themselves, refuse entry and contact us immediately.",
        ],
      },
      {
        type: "h3",
        text: "Conduct on client premises",
      },
      {
        type: "ul",
        items: [
          "Treat people, property, and information with respect.",
          "No smoking, vaping, alcohol, or illegal substances on client premises.",
          "Personal mobile use is limited to work-related needs while on shift.",
          "Do not use client equipment, Wi-Fi, or facilities except as agreed for the job.",
        ],
      },
      {
        type: "h3",
        text: "Punctuality & professionalism",
      },
      {
        type: "p",
        text: "We aim to arrive within the agreed window and to notify you promptly if delayed. Work is carried out to the agreed checklist and standard.",
      },
      {
        type: "h3",
        text: "Confidentiality",
      },
      {
        type: "p",
        text: "Staff must not disclose client information, access codes, or business details obtained during work. DBS checks are used where required for the role or site.",
      },
    ],
  },
  {
    id: "terms-conditions",
    number: "07",
    title: "Terms & Conditions of Service",
    summary: `Core terms that apply to services provided by ${legalName}.`,
    blocks: [
      {
        type: "h3",
        text: "Agreement",
      },
      {
        type: "p",
        text: COMPANY.companyNumber
          ? `By booking or accepting a quotation from ${legalName} (Company No: ${COMPANY.companyNumber}), you agree to these terms together with the policies on this page and any written schedule specific to your booking or contract.`
          : `By booking or accepting a quotation from ${legalName}, you agree to these terms together with the policies on this page and any written schedule specific to your booking or contract.`,
      },
      {
        type: "h3",
        text: "Our obligations",
      },
      {
        type: "ul",
        items: [
          "Provide cleaning services with reasonable care and skill.",
          "Supply trained staff, suitable equipment, and appropriate products unless otherwise agreed.",
          "Work to the agreed scope, timing, and access arrangements.",
        ],
      },
      {
        type: "h3",
        text: "Your obligations",
      },
      {
        type: "ul",
        items: [
          "Provide accurate information about the property and requirements.",
          "Ensure safe access and a suitable working environment.",
          "Pay invoices in line with agreed payment terms.",
          "Notify us promptly of any issues under our Service Guarantee.",
        ],
      },
      {
        type: "h3",
        text: "Changes and force majeure",
      },
      {
        type: "p",
        text: "Either party may propose changes to scope or schedule; material changes should be confirmed in writing. We are not liable for delays or failure caused by events beyond reasonable control (e.g. severe weather, utility failure, or restricted access).",
      },
      {
        type: "h3",
        text: "Governing law",
      },
      {
        type: "p",
        text: "These terms are governed by the laws of England and Wales. Nothing in these terms excludes liability that cannot be excluded by law (including for death or personal injury caused by negligence).",
      },
      {
        type: "h3",
        text: "Contact",
      },
      {
        type: "p",
        text: `Questions about these terms: ${email} · ${phoneIntl}.`,
      },
    ],
  },
];

export { email as POLICY_EMAIL, phoneIntl as POLICY_PHONE_INTL };
