import "server-only";

export type ReviewEmailDetails = {
  reviewId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  message: string;
  orderReference?: string;
  branchInfo?: string;
  fulfilmentMethod?: "delivery" | "pickup";
  submittedAt: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-RW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Africa/Kigali",
    timeZoneName: "short",
  }).format(new Date(value));
}

export async function sendReviewNotification(details: ReviewEmailDetails) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ADMIN_REVIEW_EMAIL;
  const missing = [
    !apiKey && "RESEND_API_KEY",
    !from && "EMAIL_FROM",
    !to && "ADMIN_REVIEW_EMAIL",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Review email is not configured. Missing: ${missing.join(", ")}`);
  }

  const starLabel = `${details.rating} ${details.rating === 1 ? "Star" : "Stars"}`;
  const submittedAt = formatSubmittedAt(details.submittedAt);
  const fulfilment = details.fulfilmentMethod
    ? details.fulfilmentMethod[0].toUpperCase() + details.fulfilmentMethod.slice(1)
    : undefined;
  const rows = [
    ["Customer name", details.customerName],
    ["Customer email", details.customerEmail],
    ["Rating", starLabel],
    ["Order ID", details.orderReference],
    ["Fulfilment", fulfilment],
    ["Branch", details.branchInfo],
    ["Date and time", submittedAt],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const textDetails = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top">${escapeHtml(value)}</td>
    </tr>`).join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `simba-review-${details.reviewId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: details.customerEmail,
      subject: `New Simba Review - ${starLabel}`,
      text: `${textDetails}\n\nReview message:\n${details.message}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#202124">
        <div style="background:#d94b1b;padding:22px;color:white">
          <strong style="font-size:20px">New Simba Review - ${escapeHtml(starLabel)}</strong>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">${htmlRows}</table>
          <h2 style="font-size:16px;margin:24px 0 8px">Review message</h2>
          <div style="white-space:pre-wrap;line-height:1.6;background:#f7f7f5;padding:16px;border-radius:6px">${escapeHtml(details.message)}</div>
        </div>
      </div>`,
      tags: [
        { name: "event", value: "review" },
        { name: "rating", value: String(details.rating) },
      ],
    }),
  });

  if (!response.ok) {
    const providerError = await response.text();
    throw new Error(`Resend returned ${response.status}: ${providerError}`);
  }
}
