"use client";

/**
 * Requests a presigned download URL from /api/download (which re-verifies
 * the purchase server-side) then sends the browser to it. The signed URL's
 * attachment disposition triggers the file download.
 */

import { useState } from "react";

type Props = {
  fileKey: string;
  label?: string;
};

export function DownloadButton({ fileKey, label = "Download" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileKey }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start the download.");
        setLoading(false);
        return;
      }
      // Presigned URL forces an attachment download.
      window.location.href = data.url;
      // Brief delay before re-enabling so a double-click doesn't double-log.
      setTimeout(() => setLoading(false), 1500);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startDownload}
        disabled={loading}
        className="inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-70 disabled:cursor-wait"
      >
        <span>{loading ? "Preparing…" : label}</span>
        {!loading && <span aria-hidden>↓</span>}
      </button>
      {error && (
        <p className="mt-2 text-xs text-[#ff6b5e]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
