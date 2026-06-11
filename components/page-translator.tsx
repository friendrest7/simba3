"use client";

import { useEffect } from "react";
import { translateVisibleText } from "@/lib/i18n";
import { useStore } from "./store-provider";

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Record<string, string>>();
const translatedAttributes = ["placeholder", "title", "aria-label"] as const;

function isTranslatable(value: string) {
  const text = value.trim();
  return text.length > 1
    && /[A-Za-z]/.test(text)
    && !/^(https?:|mailto:|tel:)/i.test(text)
    && !/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(text);
}

function collectPageText() {
  const entries: Array<{ value: string; apply: (translation: string) => void }> = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    const parent = node.parentElement;
    if (parent && !["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
      const source = originalText.get(node) ?? node.nodeValue ?? "";
      if (!originalText.has(node)) originalText.set(node, source);
      const trimmed = source.trim();
      if (isTranslatable(trimmed)) {
        entries.push({
          value: trimmed,
          apply: (translation) => {
            const next = source.replace(trimmed, translation);
            if (node.nodeValue !== next) node.nodeValue = next;
          },
        });
      }
    }
    current = walker.nextNode();
  }

  document.querySelectorAll("*").forEach((element) => {
    const saved = originalAttributes.get(element) || {};
    translatedAttributes.forEach((attribute) => {
      const currentValue = element.getAttribute(attribute);
      if (currentValue && saved[attribute] === undefined) saved[attribute] = currentValue;
      const source = saved[attribute];
      if (source && isTranslatable(source)) {
        entries.push({
          value: source,
          apply: (translation) => {
            if (element.getAttribute(attribute) !== translation) element.setAttribute(attribute, translation);
          },
        });
      }
    });
    originalAttributes.set(element, saved);
  });
  return entries;
}

export function PageTranslator() {
  const { language } = useStore();

  useEffect(() => {
    let timer = 0;

    function translatePage() {
      const entries = collectPageText();
      entries.forEach((entry) => entry.apply(translateVisibleText(entry.value, language)));
    }

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(translatePage, 180);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...translatedAttributes] });
    schedule();

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [language]);

  return null;
}
