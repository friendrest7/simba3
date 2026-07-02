import { NextResponse } from "next/server";
import QRCode from "qrcode";

/**
 * GET /api/qr-static
 *
 * Returns a base64 PNG data-URI of the Simba store payment QR code.
 * The QR encodes the MoMo / MTN payment number 0796198326 in the
 * Rwanda standard tel-URI format so any mobile payment app can scan it.
 *
 * This endpoint is public — the store number is not secret.
 * Response is cached for 24 hours via Cache-Control.
 */

const SIMBA_PAYMENT_PHONE = "0796198326";
// Standard tel-URI; most Rwanda mobile banking apps recognise this format
const QR_PAYLOAD = `tel:${SIMBA_PAYMENT_PHONE}`;

let cachedDataUrl: string | null = null;

export async function GET() {
  if (!cachedDataUrl) {
    cachedDataUrl = await QRCode.toDataURL(QR_PAYLOAD, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 360,
      margin: 2,
      color: { dark: "#16865c", light: "#ffffff" },
    });
  }

  return NextResponse.json(
    { qrDataUrl: cachedDataUrl, phone: SIMBA_PAYMENT_PHONE },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    },
  );
}
