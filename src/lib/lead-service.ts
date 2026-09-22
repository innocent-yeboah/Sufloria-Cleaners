import { SERVICES } from "@/lib/constants";

export function mapWebsiteServiceToLead(service: string): string {
  const match = SERVICES.find(
    (item) => item.title === service || item.shortTitle === service
  );
  return match?.leadKey ?? "other";
}
