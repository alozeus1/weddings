"use client";

import { useState } from "react";

export function UploadForm(): React.JSX.Element {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!file) {
      return;
    }

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedByName", name);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setName("");
    setFile(null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-gold-300/40 bg-white/80 p-5 shadow-card sm:p-7" data-testid="upload-form">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-ink/80">Your Name (optional)</span>
        <input
          type="text"
          className="w-full rounded-md border border-gold-300/60 px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
          data-testid="upload-name"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-ink/80">Photo</span>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full rounded-md border border-gold-300/60 px-3 py-2"
          data-testid="upload-file"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
        disabled={status === "uploading"}
        data-testid="upload-submit"
      >
        {status === "uploading" ? "Uploading..." : "Upload Photo"}
      </button>

      <p className="text-sm text-ink/70">Uploads are reviewed before appearing in the Live Gallery.</p>

      {status === "success" ? <p className="text-sm text-green-700">Uploaded. Thank you for sharing this moment.</p> : null}
      {status === "error" ? <p className="text-sm text-red-700">Upload failed. Please try again.</p> : null}
    </form>
  );
}
