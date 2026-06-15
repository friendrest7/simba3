"use client";

import { Check, Palette, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Accent, useStore } from "./store-provider";

const colors: Array<{ name: Accent; label: string; hex: string }> = [
  { name: "red", label: "Simba red", hex: "#e11d2e" },
  { name: "green", label: "Market green", hex: "#16865c" },
  { name: "blue", label: "Royal blue", hex: "#2563eb" },
  { name: "purple", label: "Vibrant purple", hex: "#7e3af2" },
  { name: "amber", label: "Golden amber", hex: "#d97706" },
  { name: "teal", label: "Fresh teal", hex: "#0d9488" },
  { name: "orange", label: "Bright orange", hex: "#ea580c" },
  { name: "pink", label: "Modern pink", hex: "#db2777" },
  { name: "rose", label: "Warm rose", hex: "#f43f5e" },
  { name: "fuchsia", label: "Bold fuchsia", hex: "#c026d3" },
  { name: "violet", label: "Deep violet", hex: "#6d28d9" },
  { name: "indigo", label: "Rich indigo", hex: "#4f46e5" },
  { name: "cyan", label: "Clear cyan", hex: "#0891b2" },
  { name: "sky", label: "Sky blue", hex: "#0284c7" },
  { name: "emerald", label: "Emerald green", hex: "#059669" },
  { name: "lime", label: "Fresh lime", hex: "#4d7c0f" },
  { name: "yellow", label: "Sun yellow", hex: "#ca8a04" },
  { name: "brown", label: "Earth brown", hex: "#92400e" },
  { name: "slate", label: "Cool slate", hex: "#475569" },
  { name: "black", label: "Classic black", hex: "#18181b" },
];

export function ThemePanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { accent, setAccent, t } = useStore();

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-2 right-3 z-[85] sm:right-4">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-line bg-canvas p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-black">{t("chooseColor")}</p><p className="mt-1 text-[10px] text-muted">{t("colorHelp")}</p></div>
            <button onClick={() => setOpen(false)} className="icon-button !h-8 !w-8" title={t("closeColors")}><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
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
      <button
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-lg transition hover:scale-105"
        title={t("changeColor")}
        aria-label={t("changeColor")}
      >
        <Palette className="h-4 w-4" />
      </button>
    </div>
  );
}
