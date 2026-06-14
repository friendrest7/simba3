"use client";

import { useEffect, useState } from "react";

function nextMidnight() {
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

export function FlashSaleCountdown() {
  const [remaining, setRemaining] = useState(() => nextMidnight() - Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, nextMidnight() - Date.now())), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const totalSeconds = Math.floor(remaining / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor(totalSeconds % 3_600 / 60);
  const seconds = totalSeconds % 60;
  return <span aria-live="polite" className="font-mono text-xl font-black sm:text-2xl">{[hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(" : ")}</span>;
}
