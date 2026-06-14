import "server-only";
import { randomUUID } from "node:crypto";

export type MobileMoneyProvider = "mtn_momo" | "airtel_money";
export type ProviderPaymentStatus = "pending" | "successful" | "failed";

type PaymentRequest = {
  provider: MobileMoneyProvider;
  amountRwf: number;
  phone: string;
  orderNumber: string;
  callbackUrl: string;
};

type PaymentResult = {
  providerReference: string;
  status: ProviderPaymentStatus;
  raw: unknown;
  demo: boolean;
};

function normalizeMsisdn(phone: string) {
  return phone.replace(/\D/g, "").replace(/^250/, "250");
}

function mtnConfiguration() {
  return {
    baseUrl: process.env.MTN_MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com",
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    apiUser: process.env.MTN_MOMO_API_USER,
    apiKey: process.env.MTN_MOMO_API_KEY,
    targetEnvironment: process.env.MTN_MOMO_TARGET_ENVIRONMENT || "sandbox",
  };
}

async function mtnAccessToken() {
  const config = mtnConfiguration();
  if (!config.subscriptionKey || !config.apiUser || !config.apiKey) return null;
  const basic = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MTN MoMo authentication failed (${response.status}).`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("MTN MoMo did not return an access token.");
  return data.access_token;
}

async function requestMtnPayment(request: PaymentRequest): Promise<PaymentResult> {
  const config = mtnConfiguration();
  const accessToken = await mtnAccessToken();
  if (!accessToken || !config.subscriptionKey) return demoPayment(request.provider);
  const reference = randomUUID();
  const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "X-Reference-Id": reference,
      "X-Target-Environment": config.targetEnvironment,
      "X-Callback-Url": request.callbackUrl,
    },
    body: JSON.stringify({
      amount: String(request.amountRwf),
      currency: "RWF",
      externalId: request.orderNumber,
      payer: { partyIdType: "MSISDN", partyId: normalizeMsisdn(request.phone) },
      payerMessage: `Simba order ${request.orderNumber}`,
      payeeNote: `Payment for ${request.orderNumber}`,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MTN MoMo payment request failed (${response.status}).`);
  return { providerReference: reference, status: "pending", raw: { accepted: true }, demo: false };
}

function airtelConfiguration() {
  return {
    baseUrl: process.env.AIRTEL_MONEY_BASE_URL || "https://openapiuat.airtel.africa",
    clientId: process.env.AIRTEL_MONEY_CLIENT_ID,
    clientSecret: process.env.AIRTEL_MONEY_CLIENT_SECRET,
  };
}

async function airtelAccessToken() {
  const config = airtelConfiguration();
  if (!config.clientId || !config.clientSecret) return null;
  const response = await fetch(`${config.baseUrl}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Airtel Money authentication failed (${response.status}).`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Airtel Money did not return an access token.");
  return data.access_token;
}

async function requestAirtelPayment(request: PaymentRequest): Promise<PaymentResult> {
  const config = airtelConfiguration();
  const accessToken = await airtelAccessToken();
  if (!accessToken) return demoPayment(request.provider);
  const reference = randomUUID();
  const response = await fetch(`${config.baseUrl}/merchant/v1/payments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Country": "RW",
      "X-Currency": "RWF",
    },
    body: JSON.stringify({
      reference: request.orderNumber,
      subscriber: { country: "RW", currency: "RWF", msisdn: normalizeMsisdn(request.phone) },
      transaction: { amount: request.amountRwf, country: "RW", currency: "RWF", id: reference },
    }),
    cache: "no-store",
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Airtel Money payment request failed (${response.status}).`);
  return { providerReference: reference, status: "pending", raw, demo: false };
}

function demoPayment(provider: MobileMoneyProvider): PaymentResult {
  return {
    providerReference: `demo-${provider}-${Date.now()}`,
    status: "pending",
    raw: { demo: true, reason: "Provider credentials are not configured in this environment." },
    demo: true,
  };
}

export function requestMobileMoneyPayment(request: PaymentRequest) {
  return request.provider === "mtn_momo" ? requestMtnPayment(request) : requestAirtelPayment(request);
}

export async function getMobileMoneyStatus(provider: MobileMoneyProvider, reference: string): Promise<PaymentResult> {
  if (reference.startsWith("demo-")) {
    return { providerReference: reference, status: "successful", raw: { demo: true }, demo: true };
  }

  if (provider === "mtn_momo") {
    const config = mtnConfiguration();
    const accessToken = await mtnAccessToken();
    if (!accessToken || !config.subscriptionKey) return demoPayment(provider);
    const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay/${reference}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": config.subscriptionKey,
        "X-Target-Environment": config.targetEnvironment,
      },
      cache: "no-store",
    });
    const raw = await response.json().catch(() => ({})) as { status?: string };
    if (!response.ok) throw new Error(`MTN MoMo status request failed (${response.status}).`);
    const value = raw.status?.toUpperCase();
    return {
      providerReference: reference,
      status: value === "SUCCESSFUL" ? "successful" : value === "FAILED" ? "failed" : "pending",
      raw,
      demo: false,
    };
  }

  const config = airtelConfiguration();
  const accessToken = await airtelAccessToken();
  if (!accessToken) return demoPayment(provider);
  const response = await fetch(`${config.baseUrl}/standard/v1/payments/${reference}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Country": "RW",
      "X-Currency": "RWF",
    },
    cache: "no-store",
  });
  const raw = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(`Airtel Money status request failed (${response.status}).`);
  const serialized = JSON.stringify(raw).toUpperCase();
  return {
    providerReference: reference,
    status: serialized.includes("SUCCESS") ? "successful" : serialized.includes("FAIL") ? "failed" : "pending",
    raw,
    demo: false,
  };
}
