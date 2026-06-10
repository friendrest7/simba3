import catalogData from "../simba_products.json";
import { Product, products as featuredProducts } from "./data";

type CatalogItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  image: string;
  unit: string;
};

export const catalogProducts: Product[] = (catalogData.products as CatalogItem[]).map((item) => ({
  id: `catalog-${item.id}`,
  name: item.name.trim(),
  category: item.category.trim(),
  price: item.price / 1450,
  image: item.image,
  unit: item.unit || "Pcs",
  rating: Number((4.1 + (item.id % 9) / 10).toFixed(1)),
  reviews: 18 + (item.id % 480),
  seller: catalogData.store.name,
  location: catalogData.store.location,
  stock: item.inStock ? 20 + (item.id % 160) : 0,
  description: `${item.name.trim()} from Simba Supermarket's ${item.category.trim()} range. Available as ${item.unit || "Pcs"} for convenient shopping and delivery.`,
  availability: item.inStock ? "available" : "sold-out",
}));

export const allProducts: Product[] = [...featuredProducts, ...catalogProducts];
export const allProductCategories = Array.from(new Set(allProducts.map((product) => product.category))).sort();
