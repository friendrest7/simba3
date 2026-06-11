import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { allProductCategories, allProducts } from "@/lib/catalog-products";
import type { Product } from "@/lib/data";
import { cleanSearchQuery, productPriceRwf, searchProducts } from "@/lib/product-search";

const PAGE_SIZE = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = cleanSearchQuery(searchParams.get("q") || "");
  const category = searchParams.get("category")?.trim() || "All";
  const priceRange = searchParams.get("price")?.trim() || "All prices";
  const sort = searchParams.get("sort")?.trim() || "featured";
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;

  let sourceProducts = allProducts;
  let sourceCategories = allProductCategories;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const { data } = await supabase
        .from("products")
        .select("id, name, description, category, brand, image_url, price_rwf, unit, stock, branch_id")
        .eq("active", true)
        .limit(500);
      if (data?.length) {
        const databaseProducts: Product[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description || "",
          category: product.category,
          seller: product.brand || "Simba Supermarket",
          image: product.image_url || "/images/product-rice.png",
          price: Number(product.price_rwf) / 1450,
          unit: product.unit || "item",
          stock: product.stock,
          branchId: product.branch_id || undefined,
          rating: 4.8,
          reviews: 0,
          location: "Rwanda",
          availability: product.stock > 0 ? "available" : "sold-out",
        }));
        sourceProducts = [...databaseProducts, ...allProducts];
        sourceCategories = Array.from(new Set(sourceProducts.map((product) => product.category))).sort();
      }
    } catch {
      // The bundled catalog remains available until the Supabase schema is deployed.
    }
  }

  const candidates = sourceProducts.filter((product) => {
    if (category !== "All" && product.category.toLowerCase() !== category.toLowerCase()) return false;
    const rwf = productPriceRwf(product);
    if (priceRange === "Under FRw 2,000") return rwf < 2_000;
    if (priceRange === "FRw 2,000 - 10,000") return rwf >= 2_000 && rwf <= 10_000;
    if (priceRange === "FRw 10,000 - 30,000") return rwf > 10_000 && rwf <= 30_000;
    if (priceRange === "FRw 30,000+") return rwf > 30_000;
    return true;
  });

  const searched = query ? searchProducts(candidates, query) : candidates;
  const sorted = [...searched].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "stock") return b.stock - a.stock;
    if (query) return 0;
    return Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || b.reviews - a.reviews;
  });

  const start = (page - 1) * PAGE_SIZE;
  const results = sorted.slice(start, start + PAGE_SIZE);

  return NextResponse.json(
    {
      products: results,
      categories: ["All", ...sourceCategories],
      total: sorted.length,
      page,
      pageSize: PAGE_SIZE,
      hasMore: start + results.length < sorted.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
