import { NextResponse } from "next/server";
import { allProductCategories, allProducts } from "@/lib/catalog-products";
import { productPriceRwf, searchProducts } from "@/lib/product-search";

const PAGE_SIZE = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "All";
  const priceRange = searchParams.get("price")?.trim() || "All prices";
  const sort = searchParams.get("sort")?.trim() || "featured";
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;

  const candidates = allProducts.filter((product) => {
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
      categories: ["All", ...allProductCategories],
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
