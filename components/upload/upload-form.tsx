"use client";

import { useState } from "react";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

type SignUploadResponse = {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
  tags: string;
  allowedFormats: string;
  context: string | null;
};

export function UploadForm(): React.JSX.Element {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validateFile(nextFile: File): string | null {
    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      return "File size must be 10MB or less.";
    }

    if (!ALLOWED_MIME_TYPES.includes(nextFile.type)) {
      return "Please upload a JPEG, PNG, WEBP, or HEIC image.";
    }

    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select an image to upload.");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setStatus("uploading");
      setErrorMessage(null);

      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uploadedByName: name })
      });

      if (!signResponse.ok) {
        throw new Error("Failed to sign upload");
      }

      const signData = (await signResponse.json()) as SignUploadResponse;
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);
      uploadPayload.append("api_key", signData.apiKey);
      uploadPayload.append("timestamp", String(signData.timestamp));
      uploadPayload.append("folder", signData.folder);
      uploadPayload.append("signature", signData.signature);
      uploadPayload.append("tags", signData.tags);
      uploadPayload.append("allowed_formats", signData.allowedFormats);

      if (signData.context) {
        uploadPayload.append("context", signData.context);
      }

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: "POST",
        body: uploadPayload
      });

      if (!cloudinaryResponse.ok) {
        throw new Error("Cloudinary upload failed");
      }

      setStatus("success");
      setName("");
      setFile(null);
    } catch {
      setStatus("error");
      setErrorMessage("Upload failed. Please try again.");
    }
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
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          required
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] || null;
            if (!selectedFile) {
              setFile(null);
              setErrorMessage(null);
              return;
            }

            const validationError = validateFile(selectedFile);
            if (validationError) {
              event.currentTarget.value = "";
              setFile(null);
              setErrorMessage(validationError);
              return;
            }

            setFile(selectedFile);
            setErrorMessage(null);
          }}
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

      <p className="text-sm text-ink/70">Max file size: 10MB. Accepted formats: JPEG, PNG, WEBP, HEIC.</p>

      {status === "success" ? <p className="text-sm text-green-700">Uploaded. Thank you for sharing this moment.</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
    </form>
  );
}
