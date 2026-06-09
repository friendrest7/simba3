"use client";

import { Building2, CheckCircle2, MapPin, XCircle } from "lucide-react";
import { branches, getBranchStock, Product } from "@/lib/data";
import { useStore } from "./store-provider";

export function BranchAvailability({ product }: { product: Product }) {
  const { selectedBranchId, setSelectedBranchId } = useStore();

  return (
    <section className="mt-8 border-t border-line pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-black"><Building2 className="h-4 w-4 text-brand" /> Available by Simba branch</p>
          <p className="mt-1 text-xs text-muted">Choose where you want this order fulfilled.</p>
        </div>
        <span className="text-[10px] font-black uppercase text-muted">{branches.length} locations</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {branches.map((branch) => {
          const stock = getBranchStock(product, branch.id);
          const selected = branch.id === selectedBranchId;
          return (
            <button
              key={branch.id}
              onClick={() => setSelectedBranchId(branch.id)}
              className={`flex items-center justify-between gap-3 rounded-md border p-3 text-left transition ${selected ? "border-brand bg-brand/5" : "border-line hover:border-brand/50"}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-black">{branch.name}</span>
                <span className="mt-1 flex items-center gap-1 text-[10px] text-muted"><MapPin className="h-3 w-3" /> {branch.city}, {branch.province}</span>
              </span>
              <span className={`flex shrink-0 items-center gap-1 text-[10px] font-black ${stock ? "text-[#16865c]" : "text-[#d94b1b]"}`}>
                {stock ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {stock ? `${stock} in stock` : "Unavailable"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
