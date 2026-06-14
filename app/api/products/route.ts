import { NextResponse } from "next/server";
import {
  allProductCategories,
  allProducts,
  allProductSubcategories,
  catalogMetadata,
} from "@/lib/catalog-products";
import { getStockStatus } from "@/lib/data";
import { cleanSearchQuery, productPriceRwf, searchProducts } from "@/lib/product-search";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 96;

function positiveNumber(value: string | null) {
  if (value === null || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = cleanSearchQuery(searchParams.get("q") || "");
  const requestedIds = new Set(
    (searchParams.get("ids") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, MAX_PAGE_SIZE),
  );
  const category = searchParams.get("category")?.trim() || "All";
  const subcategoryId = positiveNumber(searchParams.get("subcategory"));
  const minPrice = positiveNumber(searchParams.get("minPrice"));
  const maxPrice = positiveNumber(searchParams.get("maxPrice"));
  const availability = searchParams.get("availability")?.trim() || "all";
  const sort = searchParams.get("sort")?.trim() || "relevance";
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const requestedPageSize = Number.parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, requestedPageSize))
    : DEFAULT_PAGE_SIZE;

  let filtered = allProducts.filter((product) => {
    if (requestedIds.size > 0 && !requestedIds.has(product.id)) return false;
    if (category !== "All" && product.category !== category) return false;
    if (subcategoryId !== null && product.subcategoryId !== subcategoryId) return false;

    const priceRwf = productPriceRwf(product);
    if (minPrice !== null && priceRwf < minPrice) return false;
    if (maxPrice !== null && priceRwf > maxPrice) return false;

    const stockStatus = getStockStatus(product);
    if (availability !== "all" && stockStatus !== availability) return false;
    return true;
  });

  if (query) filtered = searchProducts(filtered, query);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-low") return productPriceRwf(a) - productPriceRwf(b);
    if (sort === "price-high") return productPriceRwf(b) - productPriceRwf(a);
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "relevance" && query) return 0;
    return a.name.localeCompare(b.name);
  });

  const start = (page - 1) * pageSize;
  const products = sorted.slice(start, start + pageSize);
  const subcategories = allProductSubcategories.filter(
    (subcategory) => category === "All" || subcategory.category === category,
  );

  return NextResponse.json(
    {
      products,
      categories: allProductCategories,
      subcategories,
      total: sorted.length,
      page,
      pageSize,
      pageCount: Math.ceil(sorted.length / pageSize),
      hasMore: start + products.length < sorted.length,
      catalog: catalogMetadata,
      filters: {
        query,
        category,
        subcategoryId,
        minPrice,
        maxPrice,
        availability,
        sort,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      },
    },
  );
}
