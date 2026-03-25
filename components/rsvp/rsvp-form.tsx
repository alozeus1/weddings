"use client";

import { useEffect, useState } from "react";

type GuestSearchResult = {
  id: string;
  displayName: string;
};

type GuestSelection = {
  id: string | null;
  displayName: string;
};

type RSVPFormState = {
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

const MIN_SEARCH_CHARS = 2;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState: RSVPFormState = {
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

export function RSVPForm(): React.JSX.Element {
  const [form, setForm] = useState<RSVPFormState>(initialState);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("RSVP submitted successfully.");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestSearchResult[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestSelection | null>(null);
  const [verified, setVerified] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [quickReservationOpen, setQuickReservationOpen] = useState(false);
  const [quickReservationName, setQuickReservationName] = useState("");
  const [quickReservationError, setQuickReservationError] = useState("");

  function update<K extends keyof RSVPFormState>(key: K, value: RSVPFormState[K]): void {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function clearVerificationState(): void {
    setVerified(false);
    setStep(1);
    setStatus("idle");
    setValidationError("");
    setSuccessMessage("RSVP submitted successfully.");
  }

  function isValidEmail(value: string): boolean {
    return EMAIL_PATTERN.test(value.trim());
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

  function startQuickReservation(): void {
    const fullName = quickReservationName.trim();
    if (fullName.length < MIN_SEARCH_CHARS) {
      setQuickReservationError("Please enter your full name to continue.");
      return;
    }

    setSelectedGuest({
      id: null,
      displayName: fullName
    });
    setQuickReservationError("");
    setValidationError("");
    setVerified(true);
    setStep(1);
    setStatus("idle");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedGuest) {
      setStatus("error");
      return;
    }

    const trimmedEmail = form.email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      setStatus("idle");
      return;
    }

    try {
      setStatus("submitting");
      setValidationError("");

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: selectedGuest.id ?? undefined,
          fullName: selectedGuest.id ? undefined : selectedGuest.displayName,
          email: trimmedEmail,
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

      const result = (await response.json()) as { emailSent?: boolean };
      setSuccessMessage(
        result.emailSent === false
          ? "RSVP submitted successfully. We could not send your confirmation email right now."
          : "RSVP submitted successfully. Your confirmation email is on the way."
      );
      setStatus("success");
    } catch (error) {
      console.error("[rsvp] rsvp submit failed", error);
      setStatus("error");
    }
  }

  if (!verified) {
    return (
      <section className="rounded-2xl border border-gold-300/40 bg-white/70 p-5 shadow-card sm:p-7" data-testid="rsvp-form">
        <button
          type="button"
          onClick={() => setQuickReservationOpen((previous) => !previous)}
          className="inline-flex rounded-md bg-gold-500 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-ink shadow-card"
          data-testid="rsvp-not-on-list"
        >
          RSVP
        </button>
        <p className="mt-2 text-xs text-ink/70">Click RSVP to add your reservation.</p>

        {quickReservationOpen ? (
          <section className="mt-3 rounded-xl border border-gold-300/50 bg-white/85 p-4" data-testid="open-rsvp-panel">
            <h4 className="font-display text-2xl text-ink">Add Your Reservation</h4>
            <p className="mt-2 text-sm text-ink/70">You can RSVP right away even if your name is not pre-listed.</p>
            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-medium uppercase tracking-[0.18em] text-ink/80">Full name</span>
              <input
                type="text"
                value={quickReservationName}
                onChange={(event) => {
                  setQuickReservationName(event.target.value);
                  setQuickReservationError("");
                }}
                placeholder="e.g., Jordan Example"
                className="w-full rounded-md border border-gold-300/60 px-3 py-2"
                data-testid="open-rsvp-fullname"
              />
            </label>
            <p className="mt-2 text-xs text-ink/65">Adults-only celebration: please no kids.</p>
            <button
              type="button"
              className="mt-4 rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
              onClick={startQuickReservation}
              data-testid="open-rsvp-start"
            >
              Continue to RSVP
            </button>
            {quickReservationError ? <p className="mt-2 text-sm text-red-700">{quickReservationError}</p> : null}
          </section>
        ) : null}

        <h3 className="mt-6 font-display text-2xl text-ink">Find Your Invitation</h3>
        <p className="mt-2 text-sm text-ink/70">Search by first or last name to locate your RSVP entry.</p>

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
                    setSelectedGuest({
                      id: guest.id,
                      displayName: guest.displayName
                    });
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

        {selectedGuest?.id ? (
          <div className="mt-5 rounded-xl border border-gold-300/50 bg-white/80 p-4">
            <p className="text-sm text-ink/80">
              Selected invitation: <span className="font-semibold text-ink">{selectedGuest.displayName}</span>
            </p>

            <button
              type="button"
              className="mt-4 rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
              onClick={() => {
                setVerified(true);
                setStatus("idle");
                setStep(1);
                setValidationError("");
              }}
              data-testid="rsvp-continue"
            >
              Continue to RSVP
            </button>
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
            setSelectedGuest(null);
            setValidationError("");
            setSuccessMessage("RSVP submitted successfully.");
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
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            required
            testId="rsvp-email"
            onChange={(value) => {
              update("email", value);
              setValidationError("");
            }}
          />

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

          <p className="text-xs text-ink/70 sm:col-span-2">Adults-only celebration: please no kids.</p>
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
            onClick={() => {
              if (step === 1 && !isValidEmail(form.email)) {
                setValidationError("Please enter a valid email address to continue.");
                return;
              }

              setValidationError("");
              setStep((value) => value + 1);
            }}
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

      {validationError ? <p className="mt-3 text-sm text-red-700">{validationError}</p> : null}
      {status === "success" ? <p className="mt-3 text-sm text-green-700">{successMessage}</p> : null}
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
