"use client";

import { CheckCircle2, Send, Star } from "lucide-react";
import { useState } from "react";
import { branches } from "@/lib/data";
import { useStore } from "./store-provider";

type ReviewFormProps = {
  defaultOrderId?: string;
  defaultBranchId?: string;
  defaultFulfilmentMethod?: "delivery" | "pickup";
};

export function ReviewForm({
  defaultOrderId = "",
  defaultBranchId,
  defaultFulfilmentMethod = "delivery",
}: ReviewFormProps) {
  const { user, selectedBranchId } = useStore();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [branchId, setBranchId] = useState(defaultBranchId || selectedBranchId);
  const [fulfilmentMethod, setFulfilmentMethod] = useState(defaultFulfilmentMethod);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitted(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message, orderId, branchId, fulfilmentMethod }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Your review could not be submitted.");

      setMessage("");
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your review could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-card mt-6">
      <div>
        <p className="text-[10px] font-black uppercase text-brand">Customer review</p>
        <h3 className="mt-2 text-lg font-black">Share your Simba experience</h3>
        <p className="mt-1 text-xs text-gray-500">
          Your review is saved to your account and sent to the Simba team.
        </p>
      </div>

      <form onSubmit={submitReview} className="mt-6 space-y-5">
        <div>
          <label className="form-label">Rating</label>
          <div className="flex gap-1" role="group" aria-label="Review rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded-md p-1.5 text-amber-500 transition hover:bg-amber-50 dark:hover:bg-amber-950/30"
                aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                aria-pressed={rating === value}
              >
                <Star className={`h-6 w-6 ${value <= rating ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="form-label" htmlFor="review-order-id">Order ID (optional)</label>
            <input
              id="review-order-id"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              className="form-input"
              maxLength={100}
              placeholder="Example: SMB-48219"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="review-fulfilment">Order method</label>
            <select
              id="review-fulfilment"
              value={fulfilmentMethod}
              onChange={(event) => setFulfilmentMethod(event.target.value as "delivery" | "pickup")}
              className="form-input"
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Branch pickup</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="review-branch">Simba branch</label>
            <select
              id="review-branch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className="form-input"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="review-message">Review message</label>
          <textarea
            id="review-message"
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-32 w-full rounded-md border border-line bg-white p-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand dark:bg-white/5"
            maxLength={2000}
            placeholder="Tell us what went well or what we should improve."
          />
          <p className="mt-1 text-right text-[10px] text-gray-400">{message.length}/2000</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Submitting as <strong className="text-ink">{user?.name}</strong> ({user?.email})
          </p>
          <button disabled={submitting || !message.trim()} className="button-primary disabled:opacity-50">
            <Send className="h-4 w-4" />
            {submitting ? "Saving review..." : "Submit review"}
          </button>
        </div>

        {submitted && (
          <p role="status" className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-sm font-bold text-green-700 dark:bg-green-950/40 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4" /> Your review was saved. Thank you.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
