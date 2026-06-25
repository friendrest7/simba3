export const kigaliDistricts = ["Gasabo", "Kicukiro", "Nyarugenge"] as const;
export type KigaliDistrict = (typeof kigaliDistricts)[number];

export const deliveryZones: Record<KigaliDistrict, {
  zone: string;
  feeRwf: number;
  estimatedHours: number;
}> = {
  Nyarugenge: { zone: "Kigali Central", feeRwf: 2_000, estimatedHours: 4 },
  Gasabo: { zone: "Kigali North & East", feeRwf: 2_500, estimatedHours: 6 },
  Kicukiro: { zone: "Kigali South", feeRwf: 2_500, estimatedHours: 6 },
};

export const deliveryTimeSlots = [
  "09:00 - 12:00",
  "12:00 - 15:00",
  "15:00 - 18:00",
  "18:00 - 20:00",
] as const;

/** Straight-line distance in km between two GPS points (Haversine). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Distance-based delivery fee.
 * Base: 500 RWF + 300 RWF/km, rounded to nearest 100, capped at 8 000 RWF.
 * Free on orders ≥ 60 000 RWF.
 */
export function distanceBasedFee(distanceKm: number, subtotalRwf: number): number {
  if (subtotalRwf >= 60_000) return 0;
  const raw = 500 + Math.round(distanceKm) * 300;
  return Math.min(Math.round(raw / 100) * 100, 8_000);
}

/** Estimated delivery hours based on distance. */
export function distanceEstimatedHours(distanceKm: number): number {
  return distanceKm <= 5 ? 3 : distanceKm <= 15 ? 5 : 8;
}

export function getDeliveryQuote(district: string, fulfilment: "delivery" | "pickup", subtotalRwf: number) {
  if (fulfilment === "pickup") {
    return { zone: "Branch pickup", feeRwf: 0, estimatedHours: 2 };
  }

  const districtQuote = deliveryZones[district as KigaliDistrict] || deliveryZones.Nyarugenge;
  return {
    ...districtQuote,
    feeRwf: subtotalRwf >= 60_000 ? 0 : districtQuote.feeRwf,
  };
}

export function estimatedDeliveryDate(estimatedHours: number) {
  const date = new Date(Date.now() + estimatedHours * 60 * 60 * 1000);
  return date.toISOString();
}
