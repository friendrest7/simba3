import { HomeContent } from "@/components/home-content";
import { allProductCategories, allProducts } from "@/lib/catalog-products";

export default function Home() {
  const categories = allProductCategories.map((name) => {
    const products = allProducts.filter((product) => product.category === name);
    return {
      name,
      image: products[0].image,
      count: products.length,
      query: name,
    };
  });

  return <HomeContent categories={categories} featuredProducts={allProducts.slice(0, 10)} />;
}
