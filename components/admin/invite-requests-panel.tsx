"use client";

import { useEffect, useState } from "react";

type InviteRequest = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export function InviteRequestsPanel(): React.JSX.Element {
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRequests(): Promise<void> {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/admin/invite-requests?status=pending", {
          cache: "no-store"
        });

        if (!response.ok) {
          setError("Unable to load invite requests.");
          return;
        }

        const payload = (await response.json()) as { requests?: InviteRequest[] };
        if (isMounted) {
          setRequests(payload.requests || []);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load invite requests.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  async function actOnRequest(id: string, action: "approve" | "reject"): Promise<void> {
    setActiveRequestId(id);
    setStatusMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/invite-requests/${id}/${action}`, {
        method: "POST"
      });

      if (!response.ok) {
        setError(`Failed to ${action} request.`);
        return;
      }

      setRequests((previous) => previous.filter((request) => request.id !== id));
      setStatusMessage(action === "approve" ? "Invite request approved." : "Invite request rejected.");
    } catch {
      setError(`Failed to ${action} request.`);
    } finally {
      setActiveRequestId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gold-300/40 bg-white/80 p-5 shadow-card sm:p-6" data-testid="invite-requests-section">
      <div>
        <p className="section-kicker">Admin Review</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Invite Requests</h2>
      </div>

      {loading ? <p className="text-sm text-ink/70">Loading pending requests...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {statusMessage ? <p className="text-sm text-green-700">{statusMessage}</p> : null}

      {!loading && requests.length === 0 ? <p className="text-sm text-ink/70">No pending invite requests.</p> : null}

      {requests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-ink/75">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t border-gold-200/40" data-testid="invite-request-row">
                  <td className="px-3 py-3 text-ink">{request.fullName}</td>
                  <td className="px-3 py-3 text-ink/75">
                    <p>{request.email || "—"}</p>
                    <p>{request.phone || "—"}</p>
                  </td>
                  <td className="px-3 py-3 text-ink/75">{request.message || "—"}</td>
                  <td className="px-3 py-3 text-ink/70">{new Date(request.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => actOnRequest(request.id, "approve")}
                        disabled={activeRequestId === request.id}
                        className="rounded-md bg-gold-500 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ink"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => actOnRequest(request.id, "reject")}
                        disabled={activeRequestId === request.id}
                        className="rounded-md border border-gold-300/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
