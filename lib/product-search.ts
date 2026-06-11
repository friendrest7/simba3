import type { Product } from "./data";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "at", "be", "best", "buy", "can", "compare", "for",
  "from", "help", "i", "in", "is", "it", "looking", "marketplace", "me", "most",
  "my", "of", "on", "or", "please", "product", "products", "related", "search",
  "searched", "show", "simba", "some", "the", "to", "want", "what", "which", "with",
]);

const UI_PREFIX = /^(?:search(?:\s+for)?|find|show(?:\s+me)?|look(?:ing)?\s+for|try)\s*[:\-]?\s*/i;
const UI_SUFFIX = /\s*(?:search|results?|products?)\s*$/i;
const UI_WORDS = new Set(["find", "search", "searched", "show", "try"]);

const TERM_EXPANSIONS: Record<string, string[]> = {
  affordable: ["cheap", "budget"],
  beverage: ["water", "milk"],
  beverages: ["water", "milk"],
  breakfast: ["milk", "bread", "eggs", "yogurt", "fruit"],
  dairy: ["milk", "yogurt", "eggs"],
  drink: ["water", "milk"],
  family: ["family", "multipack", "rice", "bread", "milk"],
  fresh: ["fruit", "vegetables", "milk", "bread"],
  healthy: ["fruit", "vegetables", "almonds", "yogurt", "whole wheat", "water"],
  lunch: ["bread", "chips", "fruit", "yogurt"],
  produce: ["fruit", "vegetables"],
  snack: ["snacks", "chips", "almonds", "fruit", "yogurt"],
  snacks: ["snacks", "chips", "almonds", "fruit", "yogurt"],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseAmount(value: string) {
  const compact = value.toLowerCase().replace(/[\s,]/g, "");
  const multiplier = compact.endsWith("k") ? 1_000 : 1;
  const amount = Number.parseFloat(compact.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount * multiplier : null;
}

function getBudget(query: string) {
  const normalized = query.toLowerCase();
  const between = normalized.match(/between\s+(?:frw|rwf)?\s*([\d,. ]+k?)\s+and\s+(?:frw|rwf)?\s*([\d,. ]+k?)/);
  if (between) {
    return { min: parseAmount(between[1]), max: parseAmount(between[2]) };
  }

  const maximum = normalized.match(/(?:under|below|less than|up to|max(?:imum)?|budget(?: of)?)\s*(?:frw|rwf)?\s*([\d,. ]+k?)/);
  return { min: null, max: maximum ? parseAmount(maximum[1]) : null };
}

export function cleanSearchQuery(query: string) {
  const originalMentionsSimbaProduct = /\bsimba\s+(?:chips?|crisps?|snacks?|chutney|smoked|salt|vinegar|favourites?|multipacks?)\b/i.test(query);
  const cleaned = query
    .replace(/[“”"'`]+/g, " ")
    .replace(UI_PREFIX, "")
    .replace(UI_SUFFIX, "")
    .replace(/\btry\s*:\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const uniqueWords = words.filter((word, index) => {
    const normalizedWord = normalize(word);
    if (!normalizedWord) return false;
    if (UI_WORDS.has(normalizedWord)) return false;
    if (normalizedWord === "simba" && !originalMentionsSimbaProduct) return false;
    return words.findIndex((candidate) => normalize(candidate) === normalizedWord) === index;
  });
  return uniqueWords.join(" ").trim();
}

function queryTerms(query: string) {
  const cleaned = cleanSearchQuery(query);
  const keepSimba = /\bsimba\b/.test(normalize(cleaned));
  const baseTerms = normalize(cleaned)
    .split(/\s+/)
    .filter((term) => term.length > 1 && (!STOP_WORDS.has(term) || (term === "simba" && keepSimba)) && !/^\d+$/.test(term));
  const expandedTerms = baseTerms.flatMap((term) => TERM_EXPANSIONS[term] || []);
  return Array.from(new Set([...baseTerms, ...expandedTerms]));
}

export function productPriceRwf(product: Product) {
  return Math.round(product.price * 1450);
}

export function searchProducts(items: Product[], query: string, limit?: number) {
  const cleanedQuery = cleanSearchQuery(query);
  const terms = queryTerms(cleanedQuery);
  const budget = getBudget(cleanedQuery);
  const wantsBudget = /\b(affordable|budget|cheap|cheapest|low price)\b/i.test(cleanedQuery) || budget.max !== null;
  const wantsAvailable = /\b(available|in stock|ready)\b/i.test(cleanedQuery);

  const ranked = items.flatMap((product) => {
    const priceRwf = productPriceRwf(product);
    if (budget.min !== null && priceRwf < budget.min) return [];
    if (budget.max !== null && priceRwf > budget.max) return [];
    if (wantsAvailable && (product.stock <= 0 || product.availability === "sold-out")) return [];

    const name = normalize(product.name);
    const category = normalize(product.category);
    const seller = normalize(product.seller);
    const badge = normalize(product.badge || "");
    const description = normalize(product.description);
    const unit = normalize(product.unit);
    let score = 0;

    for (const term of terms) {
      if (name.includes(term)) score += 9;
      if (category.includes(term)) score += 6;
      if (badge.includes(term)) score += 4;
      if (unit.includes(term)) score += 3;
      if (description.includes(term)) score += 2;
      if (seller.includes(term)) score += 1;
    }

    if (!score && !wantsBudget) return [];
    if (product.stock > 0 && product.availability !== "sold-out") score += 1;
    if (budget.max !== null) score += 3;
    return [{ product, score, priceRwf }];
  });

  ranked.sort((a, b) => {
    if (wantsBudget && a.score === b.score) return a.priceRwf - b.priceRwf;
    return b.score - a.score
      || Number(b.product.stock > 0) - Number(a.product.stock > 0)
      || b.product.rating - a.product.rating;
  });

  const results = ranked.map(({ product }) => product);
  return typeof limit === "number" ? results.slice(0, limit) : results;
}
