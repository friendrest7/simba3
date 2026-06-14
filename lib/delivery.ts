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
