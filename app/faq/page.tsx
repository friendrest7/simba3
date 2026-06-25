import { FAQAccordion } from "@/components/faq-accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ – Simba Supermarket",
  description: "Frequently asked questions about Simba Supermarket Rwanda.",
};

const sections = [
  {
    title: "Shopping & Products",
    items: [
      {
        question: "What products does Simba Supermarket carry?",
        answer:
          "Simba Supermarket stocks over 789 products across 11 categories including fresh produce, dairy, beverages, household essentials, and more — all sourced from trusted suppliers in Rwanda and beyond.",
      },
      {
        question: "Are prices displayed in Rwandan Francs (RWF)?",
        answer: "Yes. All prices on the Simba marketplace are displayed in Rwandan Francs (RWF) with no hidden fees.",
      },
      {
        question: "Can I check product availability before ordering?",
        answer: "Yes. Every product page shows real-time branch stock status. If an item is out of stock you can join the waitlist and we will notify you when it is restocked.",
      },
    ],
  },
  {
    title: "Orders & Delivery",
    items: [
      {
        question: "Which areas does Simba deliver to?",
        answer:
          "We deliver across all Kigali districts. Delivery fees are calculated automatically based on your selected district during checkout.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Most orders are delivered within the same day or next business day depending on your chosen time slot and location.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Sign in and visit your dashboard to see live five-stage tracking: Placed → Confirmed → Packed → Out for Delivery → Delivered.",
      },
      {
        question: "Can I collect my order at a Simba branch?",
        answer: "Yes. During checkout select 'Collect at Simba' and choose your preferred branch.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept MTN Mobile Money, Airtel Money, and cash on delivery. All mobile money payments are handled securely with a reference number for tracking.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes. Payments are processed through official MTN MoMo and Airtel Money APIs. Simba never stores your mobile money PIN.",
      },
    ],
  },
  {
    title: "Account & Returns",
    items: [
      {
        question: "Do I need an account to shop?",
        answer:
          "No. You can browse and add items to a guest cart without an account. An account is required to complete checkout, track orders, and save favourites.",
      },
      {
        question: "How do I return or exchange a product?",
        answer:
          "Contact our support team within 48 hours of delivery. Eligible items that are unopened and undamaged can be returned at any Simba branch.",
      },
      {
        question: "How do I contact Simba Supermarket?",
        answer:
          "You can reach us via the contact details on our About page, or use the Ask Simba AI assistant for instant help with your order.",
      },
    ],
  },
];

export default function FAQPage() {
  return <FAQAccordion sections={sections} />;
}
