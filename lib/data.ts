export type Product = {
  id: string;
  datasetId?: number;
  name: string;
  category: string;
  subcategoryId?: number;
  subcategory?: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  image: string;
  unit: string;
  rating: number;
  reviews: number;
  seller: string;
  location: string;
  stock: number;
  badge?: string;
  description: string;
  availability?: "available" | "sold-out";
  branchId?: string;
  managerCreated?: boolean;
};

export type Branch = {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  manager: string;
  orders: number;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  registration: string;
  branchId: string;
  status: "available" | "delivering" | "offline";
  rating: number;
};

export const branches: Branch[] = [
  { id: "kigali-kic", name: "Simba KIC Nyarugenge", city: "Kigali", province: "Nyarugenge", address: "KIC Building, KN 74 Street, Kigali", coordinates: { lat: -1.9441, lng: 30.0619 }, phone: "+250 788 305 700", manager: "Aline Uwase", orders: 168 },
  { id: "kigali-heights", name: "Simba Kigali Heights", city: "Kigali", province: "Gasabo", address: "Kigali Heights, KG 7 Avenue, Kigali", coordinates: { lat: -1.9536, lng: 30.0935 }, phone: "+250 788 305 701", manager: "Eric Mugisha", orders: 154 },
  { id: "remera", name: "Simba Remera", city: "Kigali", province: "Gasabo", address: "Remera, Kigali", coordinates: { lat: -1.9577, lng: 30.1094 }, phone: "+250 788 305 702", manager: "Diane Uwera", orders: 139 },
  { id: "kimironko", name: "Simba Kimironko", city: "Kigali", province: "Gasabo", address: "Kimironko, Kigali", coordinates: { lat: -1.9499, lng: 30.1265 }, phone: "+250 788 305 703", manager: "Claude Niyonzima", orders: 126 },
  { id: "kicukiro", name: "Simba Kicukiro", city: "Kigali", province: "Kicukiro", address: "Kicukiro Centre, Kigali", coordinates: { lat: -1.9706, lng: 30.1044 }, phone: "+250 788 305 704", manager: "Sandrine Mukamana", orders: 117 },
  { id: "nyamirambo", name: "Simba Nyamirambo", city: "Kigali", province: "Nyarugenge", address: "Nyamirambo, Kigali", coordinates: { lat: -1.9805, lng: 30.0444 }, phone: "+250 788 305 705", manager: "Patrick Habimana", orders: 108 },
  { id: "musanze", name: "Simba Musanze", city: "Musanze", province: "Northern Province", address: "Musanze City Centre", coordinates: { lat: -1.4998, lng: 29.634 }, phone: "+250 788 305 706", manager: "Grace Ingabire", orders: 84 },
  { id: "huye", name: "Simba Huye", city: "Huye", province: "Southern Province", address: "Huye City Centre", coordinates: { lat: -2.5967, lng: 29.7394 }, phone: "+250 788 305 707", manager: "Jean Bosco Ndayisaba", orders: 76 },
  { id: "rubavu", name: "Simba Rubavu", city: "Rubavu", province: "Western Province", address: "Rubavu City Centre", coordinates: { lat: -1.6777, lng: 29.2285 }, phone: "+250 788 305 708", manager: "Claudine Ishimwe", orders: 69 },
];

export const drivers: Driver[] = [
  { id: "drv-101", name: "Emmanuel Nshimiyimana", phone: "+250 788 441 982", vehicle: "Toyota Hiace", registration: "RAB 421 M", branchId: "kigali-kic", status: "delivering", rating: 4.9 },
  { id: "drv-102", name: "Ariane Uwimana", phone: "+250 788 384 120", vehicle: "Suzuki Carry", registration: "RAC 218 K", branchId: "kigali-kic", status: "available", rating: 4.8 },
  { id: "drv-201", name: "Fabrice Mugabo", phone: "+250 788 290 714", vehicle: "Toyota Probox", registration: "RAD 552 P", branchId: "remera", status: "delivering", rating: 4.9 },
  { id: "drv-301", name: "Divine Mukeshimana", phone: "+250 788 115 238", vehicle: "Nissan NV200", registration: "RAE 771 G", branchId: "kicukiro", status: "available", rating: 4.7 },
  { id: "drv-401", name: "Pacifique Hakizimana", phone: "+250 788 821 453", vehicle: "Toyota Hiace", registration: "RAF 290 H", branchId: "musanze", status: "offline", rating: 4.8 },
];

export const demoDelivery = {
  id: "SMB-48219",
  branchId: "kigali-kic",
  driverId: "drv-101",
  paid: true,
  deliveryFeePaid: true,
  status: "On the way",
  eta: "Today, 16:30",
};

export const products: Product[] = [
  { id: "simba-chutney-120g", name: "Simba Mrs H.S. Ball's Chutney", category: "Simba Favourites", price: 1.25, image: "/images/simba-chutney.png", unit: "120g bag", rating: 4.9, reviews: 684, seller: "Simba Rwanda", location: "Rwanda", stock: 86, badge: "Iconic flavour", availability: "available", description: "The unmistakable sweet and tangy chutney flavour with the classic Simba crunch." },
  { id: "simba-smoked-beef-120g", name: "Simba Smoked Beef Chips", category: "Simba Favourites", price: 1.25, image: "/images/simba-smoked-beef.jpg", unit: "120g bag", rating: 4.8, reviews: 531, seller: "Simba Rwanda", location: "Rwanda", stock: 64, badge: "Customer favourite", availability: "available", description: "Bold, smoky beef flavour packed with the familiar Simba crunch." },
  { id: "simba-salt-vinegar-120g", name: "Simba Salt & Vinegar Chips", category: "Simba Favourites", price: 1.2, image: "/images/simba-salt-vinegar.jpg", unit: "120g bag", rating: 4.7, reviews: 402, seller: "Simba Rwanda", location: "Rwanda", stock: 58, badge: "Classic flavour", availability: "available", description: "A sharp, tangy salt and vinegar classic with a satisfying potato crunch." },
  { id: "simba-chutney-36g", name: "Simba Mrs H.S. Ball's Chutney Mini", category: "Simba Favourites", price: 0.45, image: "/images/simba-chutney.png", unit: "36g bag", rating: 4.8, reviews: 288, seller: "Simba Rwanda", location: "Rwanda", stock: 144, badge: "Lunchbox size", availability: "available", description: "The iconic chutney flavour in a convenient single-serve bag." },
  { id: "simba-chutney-60g", name: "Simba Mrs H.S. Ball's Chutney Grab Bag", category: "Simba Favourites", price: 0.72, image: "/images/simba-chutney.png", unit: "60g bag", rating: 4.8, reviews: 315, seller: "Simba Rwanda", location: "Rwanda", stock: 112, availability: "available", description: "A grab-and-go serving of Simba's sweet and tangy chutney chips." },
  { id: "simba-chutney-multipack", name: "Simba Chutney Multipack", category: "Simba Multipacks", price: 3.35, image: "/images/simba-chutney.png", unit: "6 x 36g bags", rating: 4.9, reviews: 194, seller: "Simba Rwanda", location: "Rwanda", stock: 48, badge: "Family value", availability: "available", description: "Six individually packed chutney chip bags for lunchboxes, sharing, and easy portioning." },
  { id: "simba-smoked-beef-36g", name: "Simba Smoked Beef Mini", category: "Simba Favourites", price: 0.45, image: "/images/simba-smoked-beef.jpg", unit: "36g bag", rating: 4.7, reviews: 246, seller: "Simba Rwanda", location: "Rwanda", stock: 126, badge: "Lunchbox size", availability: "available", description: "Bold smoked beef flavour in a convenient single-serve bag." },
  { id: "simba-smoked-beef-60g", name: "Simba Smoked Beef Grab Bag", category: "Simba Favourites", price: 0.72, image: "/images/simba-smoked-beef.jpg", unit: "60g bag", rating: 4.8, reviews: 271, seller: "Simba Rwanda", location: "Rwanda", stock: 98, availability: "available", description: "A satisfying grab-and-go bag with Simba's smoky beef crunch." },
  { id: "simba-smoked-beef-multipack", name: "Simba Smoked Beef Multipack", category: "Simba Multipacks", price: 3.35, image: "/images/simba-smoked-beef.jpg", unit: "6 x 36g bags", rating: 4.8, reviews: 162, seller: "Simba Rwanda", location: "Rwanda", stock: 43, badge: "Family value", availability: "available", description: "Six individually packed smoked beef chip bags for families and lunchboxes." },
  { id: "simba-salt-vinegar-36g", name: "Simba Salt & Vinegar Mini", category: "Simba Favourites", price: 0.43, image: "/images/simba-salt-vinegar.jpg", unit: "36g bag", rating: 4.7, reviews: 213, seller: "Simba Rwanda", location: "Rwanda", stock: 118, badge: "Lunchbox size", availability: "available", description: "The classic salt and vinegar bite in a compact single-serve bag." },
  { id: "simba-salt-vinegar-60g", name: "Simba Salt & Vinegar Grab Bag", category: "Simba Favourites", price: 0.7, image: "/images/simba-salt-vinegar.jpg", unit: "60g bag", rating: 4.7, reviews: 235, seller: "Simba Rwanda", location: "Rwanda", stock: 87, availability: "available", description: "A grab-and-go serving of tangy salt and vinegar potato chips." },
  { id: "simba-salt-vinegar-multipack", name: "Simba Salt & Vinegar Multipack", category: "Simba Multipacks", price: 3.2, image: "/images/simba-salt-vinegar.jpg", unit: "6 x 36g bags", rating: 4.7, reviews: 149, seller: "Simba Rwanda", location: "Rwanda", stock: 39, badge: "Family value", availability: "available", description: "Six individual salt and vinegar bags, ready for lunchboxes or sharing." },
  { id: "simba-variety-multipack", name: "Simba Classic Flavours Variety Pack", category: "Simba Multipacks", price: 4.85, image: "/images/simba-chutney.png", unit: "12 x 36g bags", rating: 4.9, reviews: 327, seller: "Simba Rwanda", location: "Rwanda", stock: 54, badge: "Best seller", availability: "available", description: "A mixed family pack featuring chutney, smoked beef, and salt and vinegar portions." },
  { id: "inyange-fresh-milk-1l", name: "Inyange Fresh Whole Milk", category: "Milk & Dairy", price: 1.15, image: "/images/product-milk.png", unit: "1 litre", rating: 4.9, reviews: 412, seller: "Inyange Industries", location: "Kigali, Rwanda", stock: 138, badge: "Rwanda favourite", availability: "available", description: "Fresh whole milk for breakfast, tea, coffee, cooking, and everyday family use." },
  { id: "inyange-low-fat-milk-1l", name: "Inyange Low Fat Milk", category: "Milk & Dairy", price: 1.2, image: "/images/product-milk.png", unit: "1 litre", rating: 4.8, reviews: 286, seller: "Inyange Industries", location: "Kigali, Rwanda", stock: 96, availability: "available", description: "Smooth low-fat milk with everyday nutrition and a lighter taste." },
  { id: "strawberry-yogurt-500g", name: "Strawberry Family Yogurt", category: "Milk & Dairy", price: 1.75, image: "/images/yogurt.svg", unit: "500g tub", rating: 4.8, reviews: 193, seller: "Rwanda Dairy", location: "Kigali, Rwanda", stock: 74, badge: "Family size", availability: "available", description: "Creamy strawberry yogurt for breakfast, snacks, or dessert." },
  { id: "fresh-white-bread", name: "Fresh White Sandwich Bread", category: "Bakery", price: 0.95, image: "/images/product-bread.png", unit: "600g loaf", rating: 4.7, reviews: 318, seller: "Simba Bakery", location: "Kigali, Rwanda", stock: 122, badge: "Baked today", availability: "available", description: "Soft sliced white bread baked fresh for toast, sandwiches, and family meals." },
  { id: "whole-wheat-bread", name: "Whole Wheat Brown Bread", category: "Bakery", price: 1.1, image: "/images/product-bread.png", unit: "600g loaf", rating: 4.8, reviews: 204, seller: "Simba Bakery", location: "Kigali, Rwanda", stock: 83, availability: "available", description: "Wholesome brown bread with a soft crumb and hearty wheat flavour." },
  { id: "premium-rice-5kg", name: "Premium Long Grain Rice", category: "Groceries", price: 7.5, image: "/images/product-rice.png", unit: "5kg bag", rating: 4.8, reviews: 371, seller: "Simba Essentials", location: "Rwanda", stock: 107, badge: "Family staple", availability: "available", description: "Reliable long-grain rice for pilau, stews, vegetables, and everyday meals." },
  { id: "sunflower-oil-1l", name: "Pure Sunflower Cooking Oil", category: "Groceries", price: 2.7, image: "/images/cooking-oil.svg", unit: "1 litre", rating: 4.7, reviews: 266, seller: "Simba Essentials", location: "Rwanda", stock: 91, availability: "available", description: "Versatile sunflower oil for frying, baking, and everyday cooking." },
  { id: "mineral-water-6pack", name: "Pure Mineral Water Pack", category: "Beverages", price: 2.4, image: "/images/water.svg", unit: "6 x 500ml", rating: 4.8, reviews: 344, seller: "Rwanda Springs", location: "Rwanda", stock: 156, badge: "Hydration pack", availability: "available", description: "Six convenient bottles of refreshing mineral water." },
  { id: "white-sugar-2kg", name: "Fine White Sugar", category: "Groceries", price: 2.2, image: "/images/product-rice.png", unit: "2kg bag", rating: 4.7, reviews: 229, seller: "Simba Essentials", location: "Rwanda", stock: 118, availability: "available", description: "Fine white sugar for tea, coffee, baking, and household use." },
  { id: "rainbow-peppers", name: "Rainbow Sweet Peppers", category: "Vegetables", price: 4.9, oldPrice: 6.2, image: "/images/1.jpg", unit: "500g pack", rating: 4.8, reviews: 128, seller: "Green Valley Farms", location: "Cape Town", stock: 38, badge: "Farm fresh", description: "Crisp, naturally sweet peppers selected daily from trusted local growers." },
  { id: "free-range-eggs", name: "Free Range Farm Eggs", category: "Eggs & Dairy", price: 5.6, image: "/images/2.jpg", unit: "Tray of 18", rating: 4.9, reviews: 214, seller: "Sunrise Organics", location: "Johannesburg", stock: 64, badge: "Best seller", description: "Rich, golden-yolk eggs from free-roaming hens, packed fresh every morning." },
  { id: "garden-herb-box", name: "Garden Herb Market Box", category: "Vegetables", price: 8.4, image: "/images/4.jpg", unit: "Mixed box", rating: 4.7, reviews: 86, seller: "Urban Harvest", location: "Berlin", stock: 24, description: "A fragrant selection of seasonal herbs, garlic, greens, and edible flowers." },
  { id: "premium-strawberries", name: "Premium Strawberries", category: "Fruits", price: 4.2, oldPrice: 5.1, image: "/images/5.jpg", unit: "400g punnet", rating: 4.9, reviews: 302, seller: "Berry & Bloom", location: "Stellenbosch", stock: 45, badge: "Picked today", description: "Juicy, aromatic strawberries picked at peak ripeness and chilled for delivery." },
  { id: "fresh-raspberries", name: "Fresh Red Raspberries", category: "Fruits", price: 6.8, image: "/images/6.jpg", unit: "250g punnet", rating: 4.8, reviews: 144, seller: "Berry & Bloom", location: "Stellenbosch", stock: 28, description: "Delicate premium raspberries with bright flavor and natural sweetness." },
  { id: "lime-kiwi-crate", name: "Lime & Kiwi Crate", category: "Fruits", price: 12.9, image: "/images/9.jpg", unit: "2kg crate", rating: 4.6, reviews: 92, seller: "Global Fruit Co.", location: "Durban", stock: 19, badge: "Value box", description: "A vitamin-rich crate of zesty limes and ripe kiwi fruit for the whole family." },
  { id: "mediterranean-olives", name: "Mediterranean Olive Mix", category: "Groceries", price: 7.5, image: "/images/10.jpg", unit: "700g tub", rating: 4.8, reviews: 177, seller: "Atlas Pantry", location: "Marrakesh", stock: 53, description: "A savory mix of green and purple olives cured with herbs and sea salt." },
  { id: "roasted-almonds", name: "Market Roasted Almonds", category: "Snacks", price: 9.2, image: "/images/11.jpg", unit: "500g pouch", rating: 4.7, reviews: 231, seller: "Nut House", location: "Istanbul", stock: 72, badge: "Protein rich", description: "Crunchy dry-roasted almonds with no added oils, packed in a resealable pouch." },
  { id: "ramen-variety", name: "Global Ramen Variety Pack", category: "Groceries", price: 11.4, oldPrice: 14, image: "/images/13.jpg", unit: "12 pack", rating: 4.6, reviews: 419, seller: "Seoul Food Market", location: "Seoul", stock: 91, badge: "Global find", description: "A popular collection of bold Korean noodle flavors for quick, satisfying meals." },
  { id: "street-high-tops", name: "Limited Street High-Tops", category: "Fashion", price: 64.9, oldPrice: 79, image: "/images/14.jpg", unit: "Pair", rating: 4.7, reviews: 68, seller: "Urban Sole", location: "London", stock: 17, badge: "Limited", description: "Statement canvas high-tops with graphic panels, cushioned lining, and durable soles." },
  { id: "orchard-apples", name: "Ruby Orchard Apples", category: "Fruits", price: 5.9, image: "/images/15.jpg", unit: "1.5kg bag", rating: 4.8, reviews: 166, seller: "Highland Orchards", location: "Ceres", stock: 83, description: "Crisp red apples with balanced sweetness, packed directly at the orchard." },
  { id: "garlic-pepper-basket", name: "Garlic & Pepper Basket", category: "Vegetables", price: 10.6, image: "/images/16.jpg", unit: "Family basket", rating: 4.7, reviews: 105, seller: "Fresh Route", location: "Pretoria", stock: 36, description: "Kitchen essentials bundled in one market basket: garlic and colorful bell peppers." },
];

export function getBranchStock(product: Product, branchId: string) {
  if (product.availability === "sold-out" || product.stock <= 0) return 0;
  if (product.branchId) return product.branchId === branchId ? product.stock : 0;
  const branchIndex = Math.max(0, branches.findIndex((branch) => branch.id === branchId));
  const seed = [...`${product.id}:${branchId}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  if (seed % 17 === 0) return 0;
  const branchWeight = 0.32 + ((7 - branchIndex) * 0.035);
  return Math.max(2, Math.round(product.stock * branchWeight * (0.72 + (seed % 22) / 100)));
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRad(lat2 - lat1);
  const deltaLng = toRad(lng2 - lng1);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((6371 * c).toFixed(1));
}

export type BranchRecommendation = {
  branch: Branch;
  stock: number;
  distanceKm: number;
  isSelected: boolean;
  isAvailable: boolean;
  reason: string;
};

export function getBranchRecommendations(product: Product, selectedBranchId: string) {
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];

  return branches
    .map((branch) => {
      const stock = getBranchStock(product, branch.id);
      const distanceKm = haversineKm(selectedBranch.coordinates.lat, selectedBranch.coordinates.lng, branch.coordinates.lat, branch.coordinates.lng);
      const isSelected = branch.id === selectedBranchId;
      const isAvailable = stock > 0;
      let reason = isAvailable ? `Available · ${distanceKm.toFixed(1)} km away` : `Out of stock · ${distanceKm.toFixed(1)} km away`;
      if (isSelected) reason = isAvailable ? "Current selection" : "Current selection · out of stock";

      return { branch, stock, distanceKm, isSelected, isAvailable, reason } satisfies BranchRecommendation;
    })
    .sort((left, right) => {
      if (left.isSelected !== right.isSelected) return left.isSelected ? -1 : 1;
      if (left.isAvailable !== right.isAvailable) return left.isAvailable ? -1 : 1;
      if (left.stock !== right.stock) return right.stock - left.stock;
      return left.distanceKm - right.distanceKm;
    });
}

export function getRecommendedBranchForProduct(product: Product, selectedBranchId: string) {
  return getBranchRecommendations(product, selectedBranchId).find((item) => item.isAvailable) || null;
}

export const categories = [
  { name: "Fresh fruit", image: "/images/5.jpg", count: "240+ products", query: "Fruits" },
  { name: "Vegetables", image: "/images/16.jpg", count: "180+ products", query: "Vegetables" },
  { name: "Pantry", image: "/images/13.jpg", count: "530+ products", query: "Groceries" },
  { name: "Snacks", image: "/images/11.jpg", count: "120+ products", query: "Snacks" },
  { name: "Fashion", image: "/images/14.jpg", count: "90+ products", query: "Fashion" },
  { name: "Farm eggs", image: "/images/2.jpg", count: "45+ products", query: "Eggs" },
  { name: "Milk & dairy", image: "/images/milk.svg", count: "80+ products", query: "Milk" },
  { name: "Bakery", image: "/images/bread.svg", count: "60+ products", query: "Bakery" },
];

export const deliverySteps = ["Pending", "Confirmed", "Packed", "On the way", "Delivered"];

export const currencyOptions = {
  RWF: { locale: "rw-RW", rate: 1450, label: "RWF", symbol: "FRw" },
  ZAR: { locale: "en-ZA", rate: 18.5, label: "ZAR", symbol: "R" },
  USD: { locale: "en-US", rate: 1, label: "USD", symbol: "$" },
  EUR: { locale: "en-IE", rate: 0.92, label: "EUR", symbol: "€" },
  GBP: { locale: "en-GB", rate: 0.78, label: "GBP", symbol: "£" },
  BWP: { locale: "en-BW", rate: 13.7, label: "BWP", symbol: "P" },
} as const;

export type CurrencyCode = keyof typeof currencyOptions;

export const formatPrice = (price: number, currency: CurrencyCode = "RWF") => {
  const option = currencyOptions[currency];
  const converted = price * option.rate;
  const digits = currency === "RWF" ? 0 : 2;
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(converted);
  return `${option.symbol} ${amount}`;
};

export function getStockStatus(product: Product) {
  if (product.availability === "sold-out" || product.stock <= 0) return "out-of-stock" as const;
  if (product.stock <= 10) return "low-stock" as const;
  return "in-stock" as const;
}
