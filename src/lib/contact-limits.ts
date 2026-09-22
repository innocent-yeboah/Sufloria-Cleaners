export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  phone: 30,
  message: 3000,
  companyWebsite: 200,
  minSubmitSeconds: 2,
  rateLimitMax: 5,
  rateLimitWindowMs: 10 * 60 * 1000,
} as const;

export const HONEYPOT_FIELD = "sfc_hp_field";
