"use client";

import { useState } from "react";

type RSVPFormState = {
  name: string;
  email: string;
  phone: string;
  attending: "yes" | "no";
  plusOneName: string;
  mealCategory: string;
  protein: string;
  soup: string;
  dietary: string;
  message: string;
};

const initialState: RSVPFormState = {
  name: "",
  email: "",
  phone: "",
  attending: "yes",
  plusOneName: "",
  mealCategory: "Main",
  protein: "Chicken",
  soup: "Seafood Okra",
  dietary: "",
  message: ""
};

export function RSVPForm(): React.JSX.Element {
  const [form, setForm] = useState<RSVPFormState>(initialState);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update<K extends keyof RSVPFormState>(key: K, value: RSVPFormState[K]): void {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus("submitting");

    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setStep(1);
    setForm(initialState);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gold-300/40 bg-white/70 p-5 shadow-card sm:p-7" data-testid="rsvp-form">
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
          <Input label="Full Name" value={form.name} onChange={(value) => update("name", value)} required testId="rsvp-name" />
          <Input type="email" label="Email" value={form.email} onChange={(value) => update("email", value)} required testId="rsvp-email" />
          <Input label="Phone" value={form.phone} onChange={(value) => update("phone", value)} required testId="rsvp-phone" />
        </div>
      ) : null}

      {step === 2 ? (
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
          <Input label="Plus One Name" value={form.plusOneName} onChange={(value) => update("plusOneName", value)} />
          <Input label="Meal Category" value={form.mealCategory} onChange={(value) => update("mealCategory", value)} />
          <Input label="Protein" value={form.protein} onChange={(value) => update("protein", value)} />
          <Input label="Soup" value={form.soup} onChange={(value) => update("soup", value)} />
          <Input label="Dietary Notes" value={form.dietary} onChange={(value) => update("dietary", value)} />
        </div>
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
