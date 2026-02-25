import Link from "next/link";
import { InviteRequestsPanel } from "@/components/admin/invite-requests-panel";
import { listGuestRSVPs } from "@/lib/storage";

function formatStatus(status: "pending" | "yes" | "no"): string {
  if (status === "yes") {
    return "Coming";
  }

  if (status === "no") {
    return "Not coming";
  }

  return "Pending";
}

function formatMeal(mealCategory: string | null, protein: string | null, soup: string | null): string {
  const values = [mealCategory, protein, soup].filter((value): value is string => Boolean(value));
  return values.length > 0 ? values.join(" / ") : "—";
}

export default async function AdminRsvpsPage(): Promise<React.JSX.Element> {
  const password = process.env.ADMIN_PASSWORD || "";
  if (!password) {
    return (
      <section className="container-shell py-16">
        <h1 className="font-display text-4xl">RSVP Dashboard</h1>
        <p className="mt-3 text-sm text-ink/70">Set ADMIN_PASSWORD to protect and enable this route.</p>
      </section>
    );
  }

  const guests = await listGuestRSVPs();

  return (
    <section className="container-shell space-y-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">RSVP Dashboard</h1>
          <p className="mt-2 text-sm text-ink/70">Track responses and export a CSV snapshot for planning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/invite-requests"
            className="rounded-md border border-gold-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
          >
            Invite Requests
          </Link>
          <Link
            href="/admin/rsvps/export"
            className="rounded-md bg-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink"
          >
            Export CSV
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold-300/40 bg-white/80 shadow-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gold-100/40 text-xs uppercase tracking-[0.16em] text-ink/80">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Meal</th>
              <th className="px-4 py-3">Plus One</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="border-t border-gold-200/40">
                <td className="px-4 py-3 text-ink">{guest.fullName}</td>
                <td className="px-4 py-3 text-ink/80">{formatStatus(guest.status)}</td>
                <td className="px-4 py-3 text-ink/80">{formatMeal(guest.mealCategory, guest.protein, guest.soup)}</td>
                <td className="px-4 py-3 text-ink/80">{guest.plusOneName || "—"}</td>
                <td className="px-4 py-3 text-ink/70">{new Date(guest.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteRequestsPanel />
    </section>
  );
}
