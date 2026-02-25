"use client";

import { useEffect, useState } from "react";

type GuestSearchResult = {
  id: string;
  displayName: string;
};

type RSVPFormState = {
  passphrase: string;
  attending: "yes" | "no";
  plusOneEnabled: boolean;
  plusOneName: string;
  mealCategory: string;
  protein: string;
  soup: string;
  dietary: string;
  message: string;
  // Option A scaffold for future identity checks.
  email: string;
  phoneLast4: string;
};

type InviteRequestFormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

const MIN_SEARCH_CHARS = 2;

const initialState: RSVPFormState = {
  passphrase: "",
  attending: "yes",
  plusOneEnabled: false,
  plusOneName: "",
  mealCategory: "Main",
  protein: "Chicken",
  soup: "Seafood Okra",
  dietary: "",
  message: "",
  email: "",
  phoneLast4: ""
};

const initialInviteRequestFormState: InviteRequestFormState = {
  fullName: "",
  email: "",
  phone: "",
  message: ""
};

export function RSVPForm(): React.JSX.Element {
  const [form, setForm] = useState<RSVPFormState>(initialState);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestSearchResult[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestSearchResult | null>(null);
  const [verified, setVerified] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "loading" | "error">("idle");
  const [verifyError, setVerifyError] = useState("");
  const [requestInviteOpen, setRequestInviteOpen] = useState(false);
  const [inviteRequestForm, setInviteRequestForm] = useState<InviteRequestFormState>(initialInviteRequestFormState);
  const [inviteRequestStatus, setInviteRequestStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [inviteRequestError, setInviteRequestError] = useState("");

  function update<K extends keyof RSVPFormState>(key: K, value: RSVPFormState[K]): void {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function clearVerificationState(): void {
    setVerified(false);
    setStep(1);
    setStatus("idle");
    setVerifyStatus("idle");
    setVerifyError("");
  }

  async function readErrorBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    try {
      return await response.text();
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const trimmed = searchQuery.trim();
    setSearchError("");

    if (trimmed.length < MIN_SEARCH_CHARS) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await fetch(`/api/guests/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          const errorBody = await readErrorBody(response);
          console.error("[rsvp] guest search request failed", {
            status: response.status,
            body: errorBody
          });

          if (response.status === 429) {
            setSearchError("Too many searches right now. Please wait a moment.");
          } else {
            setSearchError("Unable to search guest list right now.");
          }
          setSearchResults([]);
          return;
        }

        const data = (await response.json()) as { results?: GuestSearchResult[] };
        setSearchResults(data.results ?? []);
      } catch (error) {
        console.error("[rsvp] guest search request failed", error);
        if ((error as { name?: string }).name !== "AbortError") {
          setSearchError("Unable to search guest list right now.");
          setSearchResults([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  async function verifyInvitation(): Promise<void> {
    if (!selectedGuest) {
      setVerifyStatus("error");
      setVerifyError("Select your invitation first.");
      return;
    }

    if (!form.passphrase.trim()) {
      setVerifyStatus("error");
      setVerifyError("Enter the passphrase to continue.");
      return;
    }

    setVerifyStatus("loading");
    setVerifyError("");

    try {
      const response = await fetch("/api/guests/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: selectedGuest.id,
          passphrase: form.passphrase
        })
      });

      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) {
        console.error("[rsvp] guest verification failed", {
          status: response.status,
          body: result
        });
        setVerifyStatus("error");
        setVerifyError("Verification failed. Check the passphrase and try again.");
        return;
      }

      setVerified(true);
      setVerifyStatus("idle");
      setStatus("idle");
      setStep(1);
    } catch (error) {
      console.error("[rsvp] guest verification request failed", error);
      setVerifyStatus("error");
      setVerifyError("Verification failed. Please try again.");
    }
  }

  async function submitInviteRequest(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setInviteRequestStatus("submitting");
    setInviteRequestError("");

    try {
      const response = await fetch("/api/invite-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteRequestForm)
      });

      if (!response.ok) {
        const errorBody = await readErrorBody(response);
        console.error("[rsvp] invite request submit failed", {
          status: response.status,
          body: errorBody
        });
        setInviteRequestStatus("error");
        setInviteRequestError("Unable to submit request right now. Please try again.");
        return;
      }

      setInviteRequestStatus("success");
      setInviteRequestForm(initialInviteRequestFormState);
    } catch (error) {
      console.error("[rsvp] invite request submit failed", error);
      setInviteRequestStatus("error");
      setInviteRequestError("Unable to submit request right now. Please try again.");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedGuest) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestId: selectedGuest.id,
        passphrase: form.passphrase,
        attending: form.attending,
        plusOneEnabled: form.plusOneEnabled,
        plusOneName: form.plusOneName,
        mealCategory: form.mealCategory,
        protein: form.protein,
        soup: form.soup,
        dietary: form.dietary,
        message: form.message
      })
    });

    if (!response.ok) {
      const errorBody = await readErrorBody(response);
      console.error("[rsvp] rsvp submit failed", {
        status: response.status,
        body: errorBody
      });
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  if (!verified) {
    return (
      <section className="rounded-2xl border border-gold-300/40 bg-white/70 p-5 shadow-card sm:p-7" data-testid="rsvp-form">
        <h3 className="font-display text-2xl text-ink">Find Your Invitation</h3>
        <p className="mt-2 text-sm text-ink/70">Search by first or last name to locate your private RSVP entry.</p>

        <label className="mt-4 block space-y-2 text-sm">
          <span className="font-medium uppercase tracking-[0.18em] text-ink/80">Search your name</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              clearVerificationState();
              setSelectedGuest(null);
            }}
            placeholder="e.g., Godwill or Ocheme"
            className="w-full rounded-md border border-gold-300/60 px-3 py-2"
            data-testid="rsvp-guest-search"
          />
        </label>
        <p className="mt-2 text-xs text-ink/65">Type just your first name or last name. We’ll find your invitation.</p>

        {searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_SEARCH_CHARS ? (
          <p className="mt-2 text-xs text-ink/65">Enter at least 2 characters to search.</p>
        ) : null}

        {searchLoading ? <p className="mt-2 text-xs text-ink/65">Searching...</p> : null}
        {searchError ? <p className="mt-2 text-sm text-red-700">{searchError}</p> : null}

        {searchQuery.trim().length >= MIN_SEARCH_CHARS && !searchLoading && !searchError && searchResults.length === 0 ? (
          <p className="mt-2 text-sm text-ink/70">No invitation matches found.</p>
        ) : null}

        {searchResults.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {searchResults.map((guest) => (
              <li key={guest.id}>
                <button
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selectedGuest?.id === guest.id ? "border-gold-500 bg-gold-100/40" : "border-gold-300/50 bg-white"
                  }`}
                  onClick={() => {
                    setSelectedGuest(guest);
                    clearVerificationState();
                  }}
                  data-testid="rsvp-guest-result"
                >
                  {guest.displayName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => setRequestInviteOpen((previous) => !previous)}
          className="mt-4 text-sm font-medium text-ink underline underline-offset-2"
          data-testid="rsvp-not-on-list"
        >
          Not on the list?
        </button>

        {requestInviteOpen ? (
          <section className="mt-3 rounded-xl border border-gold-300/50 bg-white/85 p-4" data-testid="request-invite-panel">
            <h4 className="font-display text-2xl text-ink">Request an Invite</h4>
            <form className="mt-3 space-y-3" onSubmit={submitInviteRequest}>
              <Input
                label="Full name"
                value={inviteRequestForm.fullName}
                onChange={(value) => setInviteRequestForm((previous) => ({ ...previous, fullName: value }))}
                required
                testId="invite-request-fullname"
              />
              <Input
                type="email"
                label="Email (optional)"
                value={inviteRequestForm.email}
                onChange={(value) => setInviteRequestForm((previous) => ({ ...previous, email: value }))}
                testId="invite-request-email"
              />
              <Input
                label="Phone (optional)"
                value={inviteRequestForm.phone}
                onChange={(value) => setInviteRequestForm((previous) => ({ ...previous, phone: value }))}
                testId="invite-request-phone"
              />
              <label className="block space-y-2 text-sm">
                <span className="font-medium uppercase tracking-[0.18em] text-ink/80">How do you know the couple? (optional)</span>
                <textarea
                  className="h-24 w-full rounded-md border border-gold-300/60 px-3 py-2"
                  value={inviteRequestForm.message}
                  onChange={(event) => setInviteRequestForm((previous) => ({ ...previous, message: event.target.value }))}
                  data-testid="invite-request-message"
                />
              </label>
              <button
                type="submit"
                disabled={inviteRequestStatus === "submitting"}
                className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
                data-testid="invite-request-submit"
              >
                {inviteRequestStatus === "submitting" ? "Sending..." : "Send Request"}
              </button>
            </form>

            {inviteRequestStatus === "success" ? (
              <p className="mt-3 text-sm text-green-700">Thanks! Your request was sent to the couple for review.</p>
            ) : null}
            {inviteRequestStatus === "error" ? <p className="mt-3 text-sm text-red-700">{inviteRequestError}</p> : null}
          </section>
        ) : null}

        {selectedGuest ? (
          <div className="mt-5 rounded-xl border border-gold-300/50 bg-white/80 p-4">
            <p className="text-sm text-ink/80">
              Selected invitation: <span className="font-semibold text-ink">{selectedGuest.displayName}</span>
            </p>
            <label className="mt-3 block space-y-2 text-sm">
              <span className="font-medium uppercase tracking-[0.18em] text-ink/80">Passphrase</span>
              <input
                type="password"
                value={form.passphrase}
                onChange={(event) => update("passphrase", event.target.value)}
                className="w-full rounded-md border border-gold-300/60 px-3 py-2"
                data-testid="rsvp-passphrase"
              />
            </label>
            <p className="mt-2 text-xs text-ink/65">This helps keep RSVPs private.</p>

            <button
              type="button"
              className="mt-4 rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
              onClick={verifyInvitation}
              disabled={verifyStatus === "loading"}
              data-testid="rsvp-verify"
            >
              {verifyStatus === "loading" ? "Verifying..." : "Verify Invitation"}
            </button>

            {verifyStatus === "error" ? <p className="mt-2 text-sm text-red-700">{verifyError}</p> : null}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gold-300/40 bg-white/70 p-5 shadow-card sm:p-7" data-testid="rsvp-form">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-ink/80">
          RSVP for <span className="font-semibold text-ink">{selectedGuest?.displayName}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setVerified(false);
            setStatus("idle");
            setStep(1);
          }}
          className="rounded-md border border-gold-300/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
        >
          Change Guest
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`h-2 flex-1 rounded-full ${item <= step ? "bg-gold-500" : "bg-gold-300/40"}`}
            aria-label={`Step ${item}`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium uppercase tracking-[0.18em] text-ink/80">Attending</span>
            <select
              className="w-full rounded-md border border-gold-300/60 px-3 py-2"
              value={form.attending}
              onChange={(event) => update("attending", event.target.value as "yes" | "no")}
              data-testid="rsvp-attending"
            >
              <option value="yes">Yes, with joy</option>
              <option value="no">Unable to attend</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-md border border-gold-300/50 bg-white/70 px-3 py-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={form.plusOneEnabled}
              onChange={(event) => update("plusOneEnabled", event.target.checked)}
              disabled={form.attending === "no"}
              data-testid="rsvp-plusone-toggle"
            />
            Bringing a plus one
          </label>

          {form.plusOneEnabled && form.attending === "yes" ? (
            <Input label="Plus One Name" value={form.plusOneName} onChange={(value) => update("plusOneName", value)} />
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        form.attending === "yes" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Meal Category" value={form.mealCategory} onChange={(value) => update("mealCategory", value)} />
            <Input label="Protein" value={form.protein} onChange={(value) => update("protein", value)} />
            <Input label="Soup" value={form.soup} onChange={(value) => update("soup", value)} />
            <Input label="Dietary Notes" value={form.dietary} onChange={(value) => update("dietary", value)} />
          </div>
        ) : (
          <p className="text-sm text-ink/70">Meal details are not required for guests marked as unable to attend.</p>
        )
      ) : null}

      {step === 3 ? (
        <label className="block space-y-2 text-sm">
          <span className="font-medium uppercase tracking-[0.18em] text-ink/80">Message</span>
          <textarea
            className="h-28 w-full rounded-md border border-gold-300/60 px-3 py-2"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            data-testid="rsvp-message"
          />
        </label>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            className="rounded-md border border-gold-300/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </button>
        ) : null}

        {step < 3 ? (
          <button
            type="button"
            className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            onClick={() => setStep((value) => value + 1)}
            data-testid="rsvp-next"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            disabled={status === "submitting"}
            data-testid="rsvp-submit"
          >
            {status === "submitting" ? "Sending..." : "Submit RSVP"}
          </button>
        )}
      </div>

      {status === "success" ? <p className="mt-3 text-sm text-green-700">RSVP submitted successfully.</p> : null}
      {status === "error" ? <p className="mt-3 text-sm text-red-700">Unable to submit RSVP. Please try again.</p> : null}
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  testId
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  testId?: string;
}): React.JSX.Element {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium uppercase tracking-[0.18em] text-ink/80">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gold-300/60 px-3 py-2"
        data-testid={testId}
      />
    </label>
  );
}
