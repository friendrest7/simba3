"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, QrCode, Smartphone } from "lucide-react";

/**
 * SimbaQrPanel
 *
 * Displays the static Simba store payment QR code for phone 0796198326.
 * Fetches the QR data-URI from /api/qr-static on first render.
 * Used in the checkout sidebar when the "QR Code" payment method is selected,
 * and can be embedded anywhere a store-payment QR is needed.
 */
export function SimbaQrPanel({ compact = false }: { compact?: boolean }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/qr-static")
      .then((r) => r.json())
      .then((data) => {
        if (data?.qrDataUrl) setQrDataUrl(data.qrDataUrl);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (compact) {
    return (
      <div className="rounded-xl border border-[#16865c]/30 bg-[#16865c]/5 p-4">
        <div className="flex items-center gap-3">
          <QrCode className="h-5 w-5 shrink-0 text-[#16865c]" />
          <div>
            <p className="text-sm font-black text-[#16865c]">Pay via QR · Simba Store</p>
            <p className="mt-0.5 text-xs text-muted">Scan with MTN MoMo or Airtel Money</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          {loading ? (
            <span className="grid h-40 w-40 place-items-center rounded-xl border border-line bg-canvas">
              <Loader2 className="h-7 w-7 animate-spin text-[#16865c]" />
            </span>
          ) : error ? (
            <span className="grid h-40 w-40 place-items-center rounded-xl border border-line bg-canvas text-center text-[10px] text-muted px-2">
              QR unavailable
            </span>
          ) : (
            <Image
              src={qrDataUrl!}
              alt="Simba store payment QR code"
              className="h-40 w-40 rounded-xl border border-[#16865c]/20 shadow-sm"
              width={160}
              height={160}
            />
          )}
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs font-black text-ink">0796 198 326</p>
          <p className="mt-0.5 text-[10px] text-muted">Simba Supermarket Rwanda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#16865c]/30 bg-gradient-to-b from-[#16865c]/8 to-[#16865c]/3 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16865c] text-white shadow">
          <QrCode className="h-5 w-5" />
        </span>
        <div>
          <p className="font-black text-[#16865c]">Simba Pay — QR Code</p>
          <p className="text-xs text-muted">Scan · Pay · Done</p>
        </div>
      </div>

      {/* QR image */}
      <div className="mt-5 flex justify-center">
        {loading ? (
          <span className="grid h-56 w-56 place-items-center rounded-2xl border border-line bg-canvas">
            <Loader2 className="h-10 w-10 animate-spin text-[#16865c]" />
          </span>
        ) : error ? (
          <span className="grid h-56 w-56 place-items-center rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            QR code unavailable. Please contact the store.
          </span>
        ) : (
          <Image
            src={qrDataUrl!}
            alt="Simba store payment QR code — scan to pay"
            className="h-56 w-56 rounded-2xl border-2 border-[#16865c]/30 shadow-md"
            width={224}
            height={224}
          />
        )}
      </div>

      {/* Store details */}
      <div className="mt-5 rounded-xl border border-[#16865c]/20 bg-canvas p-4 text-center">
        <p className="text-lg font-black tracking-wide text-ink">0796 198 326</p>
        <p className="mt-1 text-xs font-bold text-[#16865c]">Simba Supermarket Rwanda</p>
      </div>

      {/* Instructions */}
      <ol className="mt-4 space-y-2 text-xs text-muted">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#16865c] text-[9px] font-black text-white">1</span>
          Open MTN MoMo or Airtel Money on your phone
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#16865c] text-[9px] font-black text-white">2</span>
          Tap <strong className="text-ink">Scan QR</strong> and point your camera at the code above
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#16865c] text-[9px] font-black text-white">3</span>
          Enter the exact order total and confirm the payment
        </li>
      </ol>

      {/* Accepted apps */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-line p-3">
        <Smartphone className="h-4 w-4 shrink-0 text-muted" />
        <p className="text-[11px] text-muted">
          Accepted: <strong className="text-[#b89100]">MTN MoMo</strong> &amp;{" "}
          <strong className="text-red-600">Airtel Money</strong>
        </p>
      </div>
    </div>
  );
}
