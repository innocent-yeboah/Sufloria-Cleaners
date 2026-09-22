import { COMPANY } from "@/lib/constants";

export const POLICY_SECTIONS = [
  {
    id: "quality",
    title: "Quality and care",
    body: `Every Sufloria job is quoted to the property and completed with attention to the finishing details. We communicate clearly from enquiry through to completion so agents, landlords, developers and homeowners know what to expect.`,
  },
  {
    id: "health-safety",
    title: "Health and safety",
    body: `We take a practical, professional approach to working in occupied and vacant properties. Please tell us about access, pets, parking and any hazards when you request a quote.`,
  },
  {
    id: "environment",
    title: "A cleaner, greener tomorrow",
    body: `Where the job allows, we prefer products and methods that are kinder to people, properties and the environment. Requirements can be discussed when we quote.`,
  },
  {
    id: "data",
    title: "Your information",
    body: `Quote requests, photos and contact details are used to prepare a quotation and deliver the work. See our Privacy Policy for how ${COMPANY.name} handles personal data.`,
  },
] as const;
