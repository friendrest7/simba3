import { NextResponse } from "next/server";

const languageNames: Record<string, string> = {
  fr: "French",
  sw: "Kiswahili",
  am: "Amharic",
  tr: "Turkish",
  zh: "Simplified Chinese",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const language = typeof body?.language === "string" ? body.language : "";
  const texts = Array.isArray(body?.texts)
    ? body.texts
      .filter((text: unknown): text is string => typeof text === "string" && text.trim().length > 0 && text.length <= 500)
      .slice(0, 80)
    : [];

  if (!languageNames[language] || !texts.length) {
    return NextResponse.json({ translations: texts });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ translations: texts, mode: "fallback" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0,
        max_completion_tokens: 4_000,
        messages: [
          {
            role: "system",
            content: `Translate ecommerce interface text from English into ${languageNames[language]}. Preserve Simba, product names, email addresses, currency codes, numbers, URLs, and placeholders such as #SMB-48219. Return only a valid JSON array of translated strings in exactly the same order and length. Do not add Markdown or explanations.`,
          },
          { role: "user", content: JSON.stringify(texts) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Groq returned ${response.status}`);
    const data = await response.json();
    const content = String(data.choices?.[0]?.message?.content || "").replace(/^```json\s*|\s*```$/g, "");
    const translations = JSON.parse(content);
    if (!Array.isArray(translations) || translations.length !== texts.length || translations.some((item) => typeof item !== "string")) {
      throw new Error("Invalid translation response.");
    }
    return NextResponse.json({ translations, mode: "groq" });
  } catch {
    return NextResponse.json({ translations: texts, mode: "fallback" });
  }
}
