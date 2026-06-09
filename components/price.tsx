"use client";

import { formatPrice } from "@/lib/data";
import { useStore } from "./store-provider";

export function Price({ value, className = "" }: { value: number; className?: string }) {
  const { currency } = useStore();
  return <span className={className}>{formatPrice(value, currency)}</span>;
}
