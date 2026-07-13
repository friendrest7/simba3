"use client";

import { useEffect, useMemo } from "react";
import { Building2, CheckCircle2, MapPin, Sparkles, XCircle } from "lucide-react";
import { branches, getBranchRecommendations, Product } from "@/lib/data";
import { useStore } from "./store-provider";

export function BranchAvailability({ product }: { product: Product }) {
  const { selectedBranchId, setSelectedBranchId } = useStore();
  const recommendations = useMemo(() => getBranchRecommendations(product, selectedBranchId), [product, selectedBranchId]);
  const selectedStock = recommendations.find((item) => item.isSelected)?.stock ?? 0;
  const recommendedBranch = recommendations.find((item) => item.isAvailable) || null;

  useEffect(() => {
    if (selectedStock > 0 || !recommendedBranch || recommendedBranch.branch.id === selectedBranchId) return;
    setSelectedBranchId(recommendedBranch.branch.id);
  }, [recommendedBranch, selectedBranchId, selectedStock, setSelectedBranchId]);

  return (
    <section className="mt-8 border-t border-line pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-black"><Building2 className="h-4 w-4 text-brand" /> Available by Simba branch</p>
          <p className="mt-1 text-xs text-muted">We recommend the nearest branch that can fulfil this item.</p>
        </div>
        <span className="text-[10px] font-black uppercase text-muted">{branches.length} locations</span>
      </div>

      {!selectedStock && recommendedBranch && (
        <div className="mt-4 rounded-md border border-[#16865c]/20 bg-[#16865c]/10 p-3 text-sm text-[#116344]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <p className="font-black">Nearest available branch suggested</p>
          </div>
          <p className="mt-1 text-xs">{recommendedBranch.branch.name} in {recommendedBranch.branch.city} is {recommendedBranch.distanceKm.toFixed(1)} km away and has {recommendedBranch.stock} in stock.</p>
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {recommendations.map(({ branch, stock, distanceKm, isSelected, isAvailable, reason }) => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranchId(branch.id)}
            className={`flex items-center justify-between gap-3 rounded-md border p-3 text-left transition ${isSelected ? "border-brand bg-brand/5" : "border-line hover:border-brand/50"}`}
          >
            <span className="min-w-0">
              <span className="block truncate text-xs font-black">{branch.name}</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] text-muted"><MapPin className="h-3 w-3" /> {branch.city}, {branch.province} · {distanceKm.toFixed(1)} km</span>
              <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#16865c]">{reason}</span>
            </span>
            <span className={`flex shrink-0 items-center gap-1 text-[10px] font-black ${isAvailable ? "text-[#16865c]" : "text-[#d94b1b]"}`}>
              {isAvailable ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {isAvailable ? `${stock} in stock` : "Unavailable"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
