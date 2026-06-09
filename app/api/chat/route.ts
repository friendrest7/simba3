import { NextResponse } from "next/server";
import { products } from "@/lib/data";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant")
    && typeof message.content === "string"
    && message.content.trim().length > 0
    && message.content.length <= 2_000;
}

const catalog = products.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  priceRwf: Math.round(product.price * 1450),
  image: product.image,
  available: product.stock > 0 && product.availability !== "sold-out",
  seller: product.seller,
}));

type CatalogProduct = (typeof catalog)[number];

function findProducts(message: string) {
  const query = message.toLowerCase();
  const matches = catalog.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.seller}`.toLowerCase();
    return query.split(/\s+/).some((word) => word.length > 3 && searchable.includes(word));
  }).slice(0, 3);

  if (query.includes("cheap") || query.includes("budget") || query.includes("under")) {
    return [...catalog]
      .filter((product) => product.available)
      .sort((a, b) => a.priceRwf - b.priceRwf)
      .slice(0, 3);
  }

  return matches;
}

function localReply(message: string, matches: CatalogProduct[]) {
  const query = message.toLowerCase();

  if (query.includes("delivery") || query.includes("track")) {
    return "You can follow your driver live from the client dashboard. Open Track order in the navigation to see the map, ETA, and delivery milestones.";
  }
  if (query.includes("cheap") || query.includes("budget") || query.includes("under")) {
    return `Best budget picks: ${matches.map((item) => `${item.name} (FRw ${item.priceRwf.toLocaleString("en-US")})`).join(", ")}.`;
  }
  if (matches.length) {
    return `I found ${matches.map((item) => `${item.name} at FRw ${item.priceRwf.toLocaleString("en-US")} (${item.available ? "available" : "sold out"})`).join(", ")}. Open a product card to see more.`;
  }
  return 'Tell me what you are shopping for, your budget, or the kind of product you prefer. For example: "I need a healthy snack under FRw 10,000."';
}

function productsForReply(message: string, reply: string) {
  const normalizedReply = reply.toLowerCase();
  const mentioned = catalog.filter((product) =>
    normalizedReply.includes(product.name.toLowerCase())
  );
  return (mentioned.length ? mentioned : findProducts(message)).slice(0, 3);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages)
    ? body.messages
      .filter(isChatMessage)
      .slice(-8)
      .map((message: ChatMessage) => ({ role: message.role, content: message.content }))
    : [];
  const latest = messages.at(-1)?.content?.trim();

  if (!latest) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const matchedProducts = findProducts(latest);
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: localReply(latest, matchedProducts),
      products: matchedProducts,
      mode: "local",
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0.45,
        max_completion_tokens: 420,
        messages: [
          {
            role: "system",
            content: `You are Simba AI, a warm, conversational shopping assistant for Simba Supermarket Rwanda. Ask one brief follow-up question when a request is ambiguous. Help users discover products, compare prices in Rwandan francs (RWF/FRw), understand branch availability, checkout, authentication, and delivery tracking in Rwanda. Prefer available products unless the user explicitly asks about a sold-out item. When recommending products, always use their exact catalog names so the interface can show their images. Reply in plain text without Markdown. Never invent products or prices. Current catalog: ${JSON.stringify(catalog)}`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) throw new Error(`Groq returned ${response.status}`);
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || localReply(latest, matchedProducts);

    return NextResponse.json({
      reply,
      products: productsForReply(latest, reply),
      mode: "groq",
    });
  } catch {
    return NextResponse.json({
      reply: localReply(latest, matchedProducts),
      products: matchedProducts,
      mode: "local",
    });
  }
}
