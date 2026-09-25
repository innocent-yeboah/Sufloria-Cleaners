export const COMPANY = {
  name: "Sufloria Cleaners",
  shortName: "Sufloria",
  legalName: "Sufloria Cleaners",
  tagline: "A Higher Standard of Clean",
  uspHeadline: "More Than Cleaning. We Get Properties Ready.",
  heroHeadline: "Professional Property Cleaning Services in Derby",
  heroSubheadline:
    "Specialist cleaning for end-of-tenancy properties, new-build handovers, commercial premises, Airbnb/holiday lets and homes across Derby and surrounding areas.",
  email: "contact@sufloriacleaners.com",
  phone: "+44 7386 544703",
  phoneHref: "tel:+447386544703",
  phoneDisplayLocal: "07386 544703",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447386544703",
  companyNumber: "17450467",
  registeredOffice: ["Derby", "United Kingdom"] as const,
  address: {
    streetAddress: "Derby",
    addressLocality: "Derby",
    postalCode: "",
    addressCountry: "GB",
  },
  hours: {
    weekdays: "Monday – Friday: 8:00 AM – 6:00 PM",
    saturday: "Saturday: 9:00 AM – 4:00 PM",
    sunday: "Sunday: By arrangement",
  },
} as const;

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const LEGAL_LINKS = [
  { href: "/policies", label: "Company Policies" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/accessibility", label: "Accessibility" },
] as const;

export const SERVICE_OPTIONS = [
  "End of Tenancy Cleaning",
  "Residential Move-In Cleaning",
  "After Builders Cleaning",
  "Sparkle & Handover Cleaning",
  "Deep Cleaning",
  "Commercial & Office Cleaning",
  "Airbnb & Holiday Let Cleaning",
  "Carpet Cleaning",
  "Oven & Appliance Cleaning",
  "Decluttering & Hoarding Cleaning",
] as const;

export type ServiceSlug =
  | "end-of-tenancy"
  | "move-in"
  | "after-builders"
  | "sparkle-handover"
  | "deep-cleaning"
  | "commercial"
  | "airbnb"
  | "carpet"
  | "oven-appliance"
  | "decluttering-hoarding";

export interface Service {
  slug: ServiceSlug;
  title: string;
  shortTitle: string;
  leadKey:
    | "end_of_tenancy"
    | "move_in"
    | "after_builders"
    | "sparkle_handover"
    | "deep_cleaning"
    | "commercial"
    | "airbnb"
    | "carpet"
    | "oven_appliance"
    | "decluttering";
  summary: string;
  description: string;
  features: string[];
  audience: string;
  image: string;
  imageAlt: string;
  /** CSS object-position for professional crop in landscape frames */
  imagePosition?: string;
}

export const SERVICES: Service[] = [
  {
    slug: "end-of-tenancy",
    title: "End of Tenancy Cleaning",
    shortTitle: "End of tenancy",
    leadKey: "end_of_tenancy",
    summary: "Inventory-ready presentation for agents, landlords and tenants.",
    description:
      "When a tenant leaves, the property still has a job to do. Sufloria prepares rental homes in Derby for inventory, the next viewing, or the next occupant — with attention to kitchens, bathrooms, floors and the details that show up on inspection.",
    features: [
      "Kitchens, bathrooms and high-touch areas",
      "Floors, skirting and presentation details",
      "Quoted to the property, not a one-size list",
      "Suitable for agents, landlords and tenants",
    ],
    audience: "Letting agents, landlords, property managers and tenants",
    image: "/services/end-of-tenancy.jpg",
    imageAlt: "Bright, prepared rental bedroom ready for a new tenancy",
  },
  {
    slug: "move-in",
    title: "Residential Move-In Cleaning",
    shortTitle: "Move-in",
    leadKey: "move_in",
    summary: "A fresh, hygienic home ready for new occupants.",
    description:
      "Moving in should feel like a beginning. We refresh vacant or newly acquired homes so the first night already feels cared for — not leftover from the last chapter.",
    features: [
      "Whole-property refresh before occupation",
      "Kitchens, bathrooms and sleeping areas",
      "Ideal after purchase, let or renovation",
    ],
    audience: "Homeowners, buyers, landlords and tenants",
    image: "/services/move-in.jpg",
    imageAlt: "Clean modern kitchen ready for move-in",
  },
  {
    slug: "after-builders",
    title: "After Builders Cleaning",
    shortTitle: "After builders",
    leadKey: "after_builders",
    summary: "Dust, debris and finishing cleans before handover.",
    description:
      "Construction and refurbishment leave a different kind of dirt. Sufloria’s after-builders cleans help Derby developers, housebuilders and trades present a plot that is ready to be seen — and ready to be lived in.",
    features: [
      "Post-construction dust and debris removal",
      "Plot cleans ahead of inspection or sale",
      "Works alongside sparkle and handover cleans",
    ],
    audience: "Housebuilders, developers and construction companies",
    image: "/services/after-builders.jpg",
    imageAlt:
      "Kitchen mid-refurbishment with dust, tools and debris — the kind of site Sufloria prepares after builders leave",
    imagePosition: "center 32%",
  },
  {
    slug: "sparkle-handover",
    title: "Sparkle & Handover Cleaning",
    shortTitle: "Sparkle & handover",
    leadKey: "sparkle_handover",
    summary: "Final presentation for plots, show homes and sales offices.",
    description:
      "Handover is the last impression. A sparkle clean is the finishing pass that gets a new-build or refurbished property presentation-ready for clients, sales teams and keys being handed over.",
    features: [
      "Final sparkle before keys and photos",
      "Show homes and sales offices",
      "Part of a complete property-readiness sequence",
    ],
    audience: "Developers, housebuilders and sales teams",
    image: "/services/sparkle-handover.jpg",
    imageAlt: "Presentation-ready bathroom after a sparkle clean",
  },
  {
    slug: "deep-cleaning",
    title: "Deep Cleaning",
    shortTitle: "Deep cleaning",
    leadKey: "deep_cleaning",
    summary: "A thorough reset when a standard clean is not enough.",
    description:
      "Some properties need more than a maintenance clean. Deep cleaning is for homes and workplaces that need a proper reset — before a sale, after a long let, or when a space has been neglected.",
    features: [
      "Detailed kitchen and bathroom work",
      "Build-up, neglected areas and high-touch points",
      "Quoted according to the condition of the property",
    ],
    audience: "Homeowners, landlords, buyers and sellers",
    image: "/services/deep-cleaning.jpg",
    imageAlt:
      "Before and after deep clean — soiled kitchen tiles restored to a high shine with professional equipment",
    imagePosition: "center center",
  },
  {
    slug: "commercial",
    title: "Commercial & Office Cleaning",
    shortTitle: "Commercial",
    leadKey: "commercial",
    summary: "Dependable cleaning for workplaces and commercial premises.",
    description:
      "Workplaces need a partner, not a one-off. Sufloria supports offices, communal areas and commercial premises in Derby with one-off resets and ongoing cleaning conversations — quoted to the building.",
    features: [
      "Offices, communal areas and workspaces",
      "One-off or ongoing commercial support",
      "Clear communication from quote to completion",
    ],
    audience: "Businesses, property managers and commercial clients",
    image: "/services/commercial.jpg",
    imageAlt: "Clean, bright commercial office interior",
  },
  {
    slug: "airbnb",
    title: "Airbnb & Holiday Let Cleaning",
    shortTitle: "Airbnb",
    leadKey: "airbnb",
    summary: "Changeovers between guests, to a consistent standard.",
    description:
      "Guest turnover is only as good as the changeover. We prepare Derby holiday lets and Airbnb properties so the next arrival walks into a space that feels looked after.",
    features: [
      "Changeover cleaning between guests",
      "Presentation for the next booking",
      "Quoted to the property and turnaround",
    ],
    audience: "Airbnb hosts and holiday-let operators",
    image: "/services/airbnb.jpg",
    imageAlt: "Guest-ready holiday let living space",
  },
  {
    slug: "carpet",
    title: "Carpet Cleaning",
    shortTitle: "Carpet",
    leadKey: "carpet",
    summary: "Carpets that lift the whole property turnaround.",
    description:
      "Carpets hold on to the last occupancy. Professional carpet cleaning is often the difference between a property that looks vacated and one that looks ready.",
    features: [
      "Carpets as part of a full turnaround",
      "Quoted with the rest of the property or on its own",
    ],
    audience: "Landlords, agents, homeowners and businesses",
    image: "/services/carpet.jpg",
    imageAlt:
      "Professional carpet cleaning with high-pressure equipment lifting dirt from a patterned rug",
    imagePosition: "center 40%",
  },
  {
    slug: "oven-appliance",
    title: "Oven & Appliance Cleaning",
    shortTitle: "Oven & appliances",
    leadKey: "oven_appliance",
    summary: "Detail work that changes how a kitchen presents.",
    description:
      "Ovens and appliances are where inventories and viewings linger. We clean them as a standalone job or as part of a wider property-ready clean.",
    features: [
      "Ovens, hobs and kitchen appliances",
      "Useful at end of tenancy and before move-in",
    ],
    audience: "Landlords, tenants, agents and homeowners",
    image: "/services/oven-appliance.jpg",
    imageAlt: "Clean oven and kitchen appliances",
  },
  {
    slug: "decluttering-hoarding",
    title: "Decluttering & Hoarding Cleaning",
    shortTitle: "Decluttering",
    leadKey: "decluttering",
    summary: "Specialist cleans, carried out with care and respect.",
    description:
      "Some jobs are about more than dirt. Decluttering and hoarding cleans need professionalism, patience and respect for the people and the property. We approach this work quietly and without spectacle.",
    features: [
      "Respectful, professional specialist cleaning",
      "Quoted after we understand the property",
      "Can sit alongside a wider deep or void clean",
    ],
    audience: "Families, landlords, housing providers and support organisations",
    image: "/services/decluttering-hoarding.jpg",
    imageAlt: "Room being restored after a declutter",
  },
];

export const SERVICE_AREAS = {
  primary: "Derby",
  headline: "Derby and surrounding areas",
  summary:
    "Sufloria Cleaners is based in Derby and works with agents, landlords, developers, businesses and homeowners across the city and nearby towns.",
  note: "If you are just outside our usual area, ask us — we will tell you honestly whether we can help.",
  regions: ["Derby", "Derbyshire", "Surrounding areas"],
} as const;

export const AUDIENCES = [
  "Letting and estate agents",
  "Property managers",
  "Landlords and property investors",
  "Housebuilders and developers",
  "Airbnb and holiday-let hosts",
  "Businesses and offices",
  "Homeowners, buyers and sellers",
] as const;

export const MEDALS = [
  { label: "Professional standards", icon: "diamond" },
  { label: "Reliable service", icon: "shield" },
  { label: "A cleaner, greener tomorrow", icon: "leaf" },
] as const;

export const CLIENT_TYPES = [
  "Letting or estate agent",
  "Landlord or investor",
  "Property manager",
  "Developer or housebuilder",
  "Airbnb or holiday-let host",
  "Business",
  "Homeowner",
  "Other",
] as const;

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
