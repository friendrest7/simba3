import { NextResponse } from "next/server";
import { Product } from "@/lib/data";
import { allProducts } from "@/lib/catalog-products";
import { productPriceRwf, searchProducts } from "@/lib/product-search";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant")
    && typeof message.content === "string"
    && message.content.trim().length > 0
    && message.content.length <= 2_000;
}

function clientProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    priceRwf: productPriceRwf(product),
    image: product.image,
    available: product.stock > 0 && product.availability !== "sold-out",
    seller: product.seller,
  };
}

function serviceReply(message: string) {
  const query = message.toLowerCase();

  if (query.includes("delivery") || query.includes("track") || query.includes("driver")) {
    return "Open Track in the navigation to view your order status, driver, delivery milestones, and estimated arrival time.";
  }
  if (query.includes("checkout") || query.includes("payment") || query.includes("pay")) {
    return "Add products to your basket, open the cart, and continue to secure checkout. You can pay by mobile money, card, or cash where available.";
  }
  if (query.includes("branch") || query.includes("location") || query.includes("store")) {
    return "Choose your Simba branch from the branch selector. Product availability is checked against the branch you select.";
  }
  if (query.includes("sign in") || query.includes("account") || query.includes("login")) {
    return "Use Sign in to access your account. Staff members are directed to their assigned workspace after authentication.";
  }
  return null;
}

function localReply(message: string, matches: Product[]) {
  const supportAnswer = serviceReply(message);
  if (supportAnswer) return supportAnswer;

  if (matches.length) {
    const recommendations = matches
      .map((product) => `${product.name} at FRw ${productPriceRwf(product).toLocaleString("en-US")}`)
      .join(", ");
    return `The closest catalog matches are ${recommendations}. Open a product card for availability and details.`;
  }

  return "I could not find a close catalog match yet. Tell me the product type, budget, or intended use, such as breakfast, healthy snacks, or groceries under FRw 10,000.";
}

function geminiContents(messages: ChatMessage[], matchedProducts: Product[]) {
  const firstUserIndex = messages.findIndex((message) => message.role === "user");
  const conversation = (firstUserIndex >= 0 ? messages.slice(firstUserIndex) : messages).slice(-6);
  const grounding = matchedProducts.length
    ? JSON.stringify(matchedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      priceRwf: productPriceRwf(product),
      unit: product.unit,
      seller: product.seller,
      available: product.stock > 0 && product.availability !== "sold-out",
      description: product.description,
    })))
    : "[]";

  return conversation.map((message, index) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{
      text: index === conversation.length - 1
        ? `${message.content}\n\nMATCHED_PRODUCTS_FROM_SIMBA_CATALOG: ${grounding}`
        : message.content,
    }],
  }));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages)
    ? body.messages
      .filter(isChatMessage)
      .slice(-8)
      .map((message: ChatMessage) => ({ role: message.role, content: message.content }))
    : [];
  const latest = messages.at(-1)?.content?.trim();

  if (!latest) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const recentUserQuery = messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content)
    .join(" ");
  const matchedProducts = searchProducts(allProducts, recentUserQuery || latest, 4);
  const responseProducts = matchedProducts.map(clientProduct);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: localReply(latest, matchedProducts),
      products: responseProducts,
      mode: "local",
    });
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: [
                "You are Simba AI, the conversational product search assistant for Simba Supermarket Rwanda.",
                "The application searches its catalog before asking you to respond.",
                "Treat MATCHED_PRODUCTS_FROM_SIMBA_CATALOG as the complete and authoritative search result for the current request.",
                "Only recommend products in that list. Never invent a product, price, stock status, seller, or promotion.",
                "Use exact product names and prices from the list. Prefer available products.",
                "If the list is empty for a product request, ask one short clarifying question instead of suggesting outside products.",
                "For service questions: Track opens delivery status and ETA; checkout supports mobile money, card, and cash where available; branch selection controls availability.",
                "Reply in friendly plain text without Markdown and stay under 90 words.",
              ].join(" "),
            }],
          },
          contents: geminiContents(messages, matchedProducts),
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 320,
          },
        }),
        signal: AbortSignal.timeout(12_000),
      },
    );

    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    return NextResponse.json({
      reply: reply || localReply(latest, matchedProducts),
      products: responseProducts,
      mode: reply ? "gemini" : "local",
    });
  } catch {
    return NextResponse.json({
      reply: localReply(latest, matchedProducts),
      products: responseProducts,
      mode: "local",
    });
  }
}
