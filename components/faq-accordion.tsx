"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQSection = {
  title: string;
  items: FAQItem[];
};

interface FAQAccordionProps {
  sections: FAQSection[];
}

export function FAQAccordion({ sections }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:px-10">
      <div className="text-center">
        <span className="eyebrow">Common Questions</span>
        <h2 className="section-title mt-2">Frequently Asked Questions</h2>
      </div>

      <div className="mt-12 space-y-4">
        {sections.map((section, sectionIndex) => (
          <div key={section.title} className="rounded-xl border border-line bg-canvas overflow-hidden">
            <button
              onClick={() => toggleSection(sectionIndex)}
              className="flex w-full items-center justify-between p-5 text-left font-black transition hover:bg-brand/5"
            >
              <span>{section.title}</span>
              {openIndex === sectionIndex ? (
                <ChevronUp className="h-5 w-5 text-brand" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted" />
              )}
            </button>

            {openIndex === sectionIndex && (
              <div className="border-t border-line bg-white dark:bg-black/20 p-5 pt-0">
                <div className="space-y-6 py-5">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-sm font-bold text-ink">{item.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
