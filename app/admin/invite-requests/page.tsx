import Link from "next/link";
import { headers } from "next/headers";
import { InviteRequestsPanel } from "@/components/admin/invite-requests-panel";

function isAuthorized(authorization: string, expectedPassword: string): boolean {
  if (!authorization.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf-8");
  const [, providedPassword] = decoded.split(":");
  return providedPassword === expectedPassword;
}

export default async function AdminInviteRequestsPage(): Promise<React.JSX.Element> {
  const password = process.env.ADMIN_PASSWORD || "";
  const authorization = (await headers()).get("authorization") || "";

  if (!password) {
    return (
      <section className="container-shell py-16">
        <h1 className="font-display text-4xl text-ink">Invite Requests</h1>
        <p className="mt-3 text-sm text-ink/70">Set ADMIN_PASSWORD to protect and enable this route.</p>
      </section>
    );
  }

  if (!isAuthorized(authorization, password)) {
    return (
      <section className="container-shell py-16">
        <h1 className="font-display text-4xl text-ink">Unauthorized</h1>
        <p className="mt-3 text-sm text-ink/70">Use HTTP Basic Auth to access this route.</p>
      </section>
    );
  }

  return (
    <section className="container-shell space-y-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Invite Requests</h1>
          <p className="mt-2 text-sm text-ink/70">Review pending invite requests and approve or reject submissions.</p>
        </div>
        <Link
          href="/admin/rsvps"
          className="rounded-md border border-gold-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
        >
          Back to RSVP Dashboard
        </Link>
      </div>

      <InviteRequestsPanel />
    </section>
  );
}
