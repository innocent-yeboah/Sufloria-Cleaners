import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import LeadDetailActions from "@/components/admin/LeadDetailActions";
import {
  requireAdminSession,
  formatGbp,
  formatUkDate,
} from "@/lib/admin/auth";
import {
  SERVICE_LABELS,
  type Lead,
  type ServiceInterest,
} from "@/lib/admin/types";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params) {
  return { title: `Lead ${params.id.slice(0, 8)}` };
}

export default async function AdminLeadDetailPage({ params }: Params) {
  const { supabase } = await requireAdminSession();

  const [{ data: lead }, { data: staff }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  if (!lead) notFound();
  const row = lead as Lead;
  const photoPaths = row.photo_paths || [];

  let photoUrls: { path: string; url: string }[] = [];
  if (photoPaths.length) {
    const { data: signed } = await supabase.storage
      .from("quote-photos")
      .createSignedUrls(photoPaths, 60 * 60);
    photoUrls = (signed || [])
      .map((item, index) => ({
        path: item.path || photoPaths[index] || `photo-${index}`,
        url: item.signedUrl || "",
      }))
      .filter((item) => Boolean(item.url));
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/leads" className="text-sm font-semibold text-teal">
          ← Back to leads
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="heading-lg">{row.name}</h1>
            <p className="mt-1 text-sm text-dark/70">
              <a href={`mailto:${row.email}`} className="hover:text-teal">
                {row.email}
              </a>
              {row.phone ? (
                <>
                  {" · "}
                  <a href={`tel:${row.phone}`} className="hover:text-teal">
                    {row.phone}
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge value={row.status} />
            <StatusBadge value={row.priority} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-3 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
            <h2 className="font-heading text-lg font-bold text-navy">
              Enquiry details
            </h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-dark/60">Service</dt>
                <dd className="font-semibold text-navy">
                  {row.service_interest
                    ? SERVICE_LABELS[row.service_interest as ServiceInterest]
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Source</dt>
                <dd className="font-semibold capitalize text-navy">
                  {row.source || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Postcode</dt>
                <dd className="font-semibold text-navy">
                  {row.postcode || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Preferred date</dt>
                <dd className="font-semibold text-navy">
                  {formatUkDate(row.preferred_date)}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Enquiry type</dt>
                <dd className="font-semibold capitalize text-navy">
                  {row.enquiry_type || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Client type</dt>
                <dd className="font-semibold capitalize text-navy">
                  {row.client_type || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Property</dt>
                <dd className="font-semibold text-navy">
                  {[row.property_type, row.property_size]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Quote</dt>
                <dd className="font-semibold text-navy">
                  {formatGbp(row.quote_amount)}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Created</dt>
                <dd className="font-semibold text-navy">
                  {formatUkDate(row.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Contacted</dt>
                <dd className="font-semibold text-navy">
                  {formatUkDate(row.contacted_at)}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Quoted</dt>
                <dd className="font-semibold text-navy">
                  {formatUkDate(row.quoted_at)}
                </dd>
              </div>
              <div>
                <dt className="text-dark/60">Lost reason</dt>
                <dd className="font-semibold text-navy">
                  {row.lost_reason || "—"}
                </dd>
              </div>
            </dl>
            <div>
              <p className="text-sm text-dark/60">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-dark/85">
                {row.message || "—"}
              </p>
            </div>
            {row.notes ? (
              <div>
                <p className="text-sm text-dark/60">Internal notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-dark/85">
                  {row.notes}
                </p>
              </div>
            ) : null}
          </section>

          {photoUrls.length ? (
            <section className="space-y-3 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
              <h2 className="font-heading text-lg font-bold text-navy">
                Quote photos
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photoUrls.map((photo) => (
                  <a
                    key={photo.path}
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-navy/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Quote upload"
                      className="aspect-square w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <LeadDetailActions lead={row} staff={staff || []} />
      </div>
    </div>
  );
}
