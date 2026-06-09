"use client";

import { useEffect, useRef } from "react";
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
  const languageRef = useRef(language);

  useEffect(() => {
    languageRef.current = language;
    let timer = 0;
    let cancelled = false;

    async function translatePage() {
      const activeLanguage = languageRef.current;
      const entries = collectPageText();
      if (activeLanguage === "en") {
        entries.forEach((entry) => entry.apply(entry.value));
        return;
      }

      const storageKey = `simba-page-translations-${activeLanguage}`;
      let cache: Record<string, string> = {};
      try {
        cache = JSON.parse(localStorage.getItem(storageKey) || "{}");
      } catch {
        localStorage.removeItem(storageKey);
      }

      const unique = [...new Set(entries.map((entry) => entry.value))];
      const missing = unique.filter((text) => !cache[text]);
      for (let index = 0; index < missing.length; index += 60) {
        const batch = missing.slice(index, index + 60);
        try {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: activeLanguage, texts: batch }),
          });
          const data = await response.json();
          if (Array.isArray(data.translations)) {
            batch.forEach((text, itemIndex) => {
              cache[text] = typeof data.translations[itemIndex] === "string" ? data.translations[itemIndex] : text;
            });
          }
        } catch {
          batch.forEach((text) => { cache[text] = text; });
        }
      }
      if (cancelled || activeLanguage !== languageRef.current) return;
      localStorage.setItem(storageKey, JSON.stringify(cache));
      entries.forEach((entry) => entry.apply(cache[entry.value] || entry.value));
    }

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(translatePage, 180);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...translatedAttributes] });
    schedule();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [language]);

  return null;
}
