"use client";

import { Check, Palette, X } from "lucide-react";
import { useState } from "react";
import { Accent, useStore } from "./store-provider";

const colors: Array<{ name: Accent; label: string; hex: string }> = [
  { name: "red", label: "Simba red", hex: "#e11d2e" },
  { name: "green", label: "Market green", hex: "#16865c" },
  { name: "blue", label: "Royal blue", hex: "#2563eb" },
  { name: "purple", label: "Vibrant purple", hex: "#7e3af2" },
  { name: "amber", label: "Golden amber", hex: "#d97706" },
  { name: "teal", label: "Fresh teal", hex: "#0d9488" },
];

export function ThemePanel() {
  const [open, setOpen] = useState(false);
  const { accent, setAccent } = useStore();

  return (
    <div className="fixed bottom-5 right-5 z-[85]">
      {open && (
        <div className="mb-3 w-56 rounded-xl border border-line bg-canvas p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-black">Choose interface color</p><p className="mt-1 text-[10px] text-muted">Updates the navbar and buttons</p></div>
            <button onClick={() => setOpen(false)} className="icon-button !h-8 !w-8" title="Close colors"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setAccent(color.name)}
                title={color.label}
                aria-label={`Use ${color.label}`}
                className={`relative grid aspect-square place-items-center rounded-xl border-2 transition hover:scale-105 ${accent === color.name ? "border-ink" : "border-transparent"}`}
                style={{ backgroundColor: color.hex }}
              >
                {accent === color.name && <Check className="h-4 w-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-2xl transition hover:scale-105" title="Change interface color"><Palette className="h-5 w-5" /></button>
    </div>
  );
}
