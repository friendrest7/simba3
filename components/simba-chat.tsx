"use client";

import Image from "next/image";
import Link from "next/link";
import { Bot, ExternalLink, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatProduct = {
  id: string;
  name: string;
  category: string;
  priceRwf: number;
  image: string;
  available: boolean;
  seller: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
};

export function SimbaChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"gemini" | "local" | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm Simba AI. What are you shopping for today?",
    },
  ]);
  const sendMessageRef = useRef<(text: string) => void>(() => undefined);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.reply || "I could not answer that. Please try again.",
        products: Array.isArray(data.products) ? data.products : [],
      }]);
      setMode(data.mode || "local");
    } catch {
      setMessages((current) => [...current, {
        role: "assistant",
        content: "I'm temporarily offline. You can still browse all products in the marketplace.",
      }]);
      setMode("local");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  useEffect(() => {
    function handleSearch(event: Event) {
      const prompt = (event as CustomEvent<string>).detail;
      if (!prompt?.trim()) return;
      setOpen(true);
      setTimeout(() => sendMessageRef.current(prompt), 0);
    }

    window.addEventListener("simba:ask", handleSearch);
    return () => window.removeEventListener("simba:ask", handleSearch);
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "Show me available Simba chips",
    "What can I buy under FRw 10,000?",
    "I need a healthy snack",
  ];

  return (
    <div className="fixed bottom-5 left-5 z-[80]">
      {open && (
        <section className="mb-3 flex h-[min(680px,calc(100vh-110px))] w-[min(410px,calc(100vw-24px))] flex-col overflow-hidden rounded-md border border-line bg-canvas shadow-2xl">
          <header className="flex items-center justify-between bg-brand p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand"><Bot className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-black">Simba AI</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/75">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#79e2ac]" />
                  {mode === "gemini" ? "Powered by Gemini" : mode === "local" ? "Smart catalog mode" : "Ready to help"}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10" title="Close assistant"><X className="h-5 w-5" /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[92%]">
                  <div className={`rounded-md px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#3867d6] text-white" : "bg-black/[.055] text-ink dark:bg-white/10"}`}>
                    {message.content}
                  </div>
                  {!!message.products?.length && (
                    <div className="mt-2 grid gap-2">
                      {message.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="grid grid-cols-[76px_1fr] gap-3 rounded-md border border-line bg-canvas p-2 transition hover:border-[#16865c]"
                        >
                          <span className="relative block h-[76px] overflow-hidden rounded bg-white">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className={product.category === "Simba Favourites" ? "object-contain p-1" : "object-cover"}
                              sizes="76px"
                            />
                          </span>
                          <span className="min-w-0 py-1">
                            <span className="line-clamp-2 block text-xs font-black leading-4">{product.name}</span>
                            <span className="mt-1 block text-[10px] text-muted">by {product.seller}</span>
                            <span className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-brand">FRw {product.priceRwf.toLocaleString("en-US")}</span>
                              <span className={`text-[9px] font-black uppercase ${product.available ? "text-[#16865c]" : "text-muted"}`}>
                                {product.available ? "View product" : "Sold out"}
                              </span>
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs font-bold text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-brand" /> Simba is thinking...
              </div>
            )}
            <div ref={conversationEndRef} />
          </div>

          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-3">
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => sendMessage(suggestion)} className="shrink-0 rounded-full border border-line px-3 py-2 text-[10px] font-bold hover:border-[#16865c] hover:text-[#16865c]">
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-line p-3">
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} className="form-input" placeholder="Tell me what you need..." />
              <button disabled={loading || !input.trim()} className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#16865c] text-white disabled:opacity-45" title="Send message"><Send className="h-4 w-4" /></button>
            </form>
            <Link href="/shop" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-muted hover:text-brand">Open marketplace <ExternalLink className="h-3 w-3" /></Link>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-14 items-center gap-3 rounded-full bg-[#16865c] px-5 font-black text-white shadow-[0_10px_28px_rgba(22,134,92,.35)] transition hover:-translate-y-1"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="text-sm">Ask Simba AI</span>
        {!open && <Sparkles className="h-3.5 w-3.5 text-[#ffe176]" />}
      </button>
    </div>
  );
}
