import catalogData from "../simba_productsog.json";
import { Product } from "./data";

type CatalogItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
};

const subcategoryNames: Record<number, string> = {
  13: "Home tools", 15: "Fitness accessories", 16: "Toys & play", 19: "Electric cookware",
  22: "Stationery", 27: "Cognac & aperitifs", 29: "Pet grooming", 58: "Baby formula",
  61: "Bakery", 62: "Canned meat", 65: "Cooking oils", 66: "Milk & cream",
  67: "Flour & baking", 70: "Sauces & condiments", 71: "Rice & grains", 72: "Spices & seasonings",
  73: "Sugar & sweeteners", 74: "Coffee & tea", 76: "Syrups", 77: "Dried fruit & nuts",
  97: "Toothpicks", 98: "Feminine care", 99: "Diapers", 103: "Cleaning cloths & sponges",
  105: "Surface & dish cleaners", 131: "Honey", 148: "Irons", 165: "Coffee makers",
  166: "Food containers", 167: "Cups", 168: "Water bottles", 176: "Brushes & mops",
  177: "Toilet brushes", 187: "Disposable kitchen supplies", 195: "Frying pans", 197: "Kitchen knives",
  198: "Cutlery", 199: "Glassware", 204: "Shampoo & hair care", 205: "Face creams",
  208: "Shaving care", 211: "Hair styling", 214: "Body lotion", 215: "Electrical accessories",
  220: "Electric kettles", 234: "Whisky", 235: "Beer", 236: "Gin", 237: "Wine & sparkling",
  238: "Liqueurs", 244: "Fabric softener", 245: "Soap & hand wash", 246: "Paper products",
  247: "Kitchen towels", 258: "Jam & preserves", 259: "Margarine & spreads", 260: "Chocolate spreads",
  264: "Art supplies", 266: "Exercise books", 277: "Travel accessories", 346: "Mushrooms",
  347: "Pickles & capers", 348: "Olives & onions", 349: "Chocolate", 354: "Pet food",
  362: "Blenders", 366: "Candy", 367: "Gum & lollipops", 368: "Sweet corn",
  371: "Sausages", 372: "Canned fish", 373: "Baking ingredients", 379: "Petroleum jelly",
  400: "Deodorants", 406: "Lip & skin care", 412: "Paper", 414: "Candles",
  449: "Breakfast cereals", 468: "Coffee machines", 471: "Frozen & processed meat",
  473: "Tobacco", 478: "Instant noodles", 486: "Party supplies", 493: "Energy drinks",
  503: "UHT milk", 530: "Kitchen baskets", 576: "Office supplies", 579: "Baby care",
  580: "Batteries", 581: "Razors", 663: "Fresh vegetables", 664: "Fresh fruit",
  666: "Eggs", 669: "Baking chocolate", 670: "Hot drinks", 671: "Vinegar",
  672: "Herbs & spices", 673: "Salt",
};

function inferBrand(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");
  const firstWords = normalized.split(" ").slice(0, 2);
  if (firstWords[0]?.toLowerCase() === "simba") return "Simba";
  return firstWords[0] || catalogData.store.name;
}

export const catalogProducts: Product[] = (catalogData.products as CatalogItem[]).map((item) => ({
  id: `catalog-${item.id}`,
  datasetId: item.id,
  name: item.name.trim(),
  category: item.category.trim(),
  subcategoryId: item.subcategoryId,
  subcategory: subcategoryNames[item.subcategoryId] || `Range ${item.subcategoryId}`,
  brand: inferBrand(item.name),
  price: item.price / 1450,
  image: item.image,
  unit: item.unit || "Pcs",
  rating: Number((4.1 + (item.id % 9) / 10).toFixed(1)),
  reviews: 18 + (item.id % 480),
  seller: catalogData.store.name,
  location: catalogData.store.location,
  stock: item.inStock ? (item.id % 13 === 0 ? 3 + (item.id % 7) : 20 + (item.id % 160)) : 0,
  description: `${item.name.trim()} by ${inferBrand(item.name)}, from Simba Supermarket's ${item.category.trim()} and ${subcategoryNames[item.subcategoryId] || `range ${item.subcategoryId}`} selection. Sold as ${item.unit || "Pcs"}.`,
  availability: item.inStock ? "available" : "sold-out",
}));

export const allProducts: Product[] = catalogProducts;
export const allProductCategories = Array.from(new Set(allProducts.map((product) => product.category))).sort();
export const allProductSubcategories = Array.from(
  new Map(
    allProducts.map((product) => [
      String(product.subcategoryId),
      {
        id: product.subcategoryId!,
        name: product.subcategory!,
        category: product.category,
      },
    ]),
  ).values(),
).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

export const catalogMetadata = {
  productCount: catalogProducts.length,
  categoryCount: allProductCategories.length,
  subcategoryCount: allProductSubcategories.length,
  store: catalogData.store,
};

if (catalogMetadata.productCount !== 789 || catalogMetadata.categoryCount !== 11) {
  throw new Error(`Catalog integrity check failed: expected 789 products and 11 categories, received ${catalogMetadata.productCount} products and ${catalogMetadata.categoryCount} categories.`);
}
