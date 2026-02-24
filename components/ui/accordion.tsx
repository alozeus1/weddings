"use client";

import { useState } from "react";
import type { FAQItem } from "@/types/content";

export function Accordion({ items }: { items: FAQItem[] }): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article key={item.question} className="border-b border-gold-300/50 pb-5 pt-4">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 text-left"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span className="text-sm font-medium uppercase tracking-wide text-ink sm:text-base">{item.question}</span>
              <span className="text-gold-600">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/70 sm:text-base">{item.answer}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
