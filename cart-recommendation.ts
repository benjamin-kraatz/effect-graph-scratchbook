import { DevTools } from "@effect/experimental";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Option } from "effect";

const findNodeInMap = <K, V>(map: Map<K, V>, key: K): V => {
  const node = map.get(key);
  if (node === undefined) throw new Error(`Node ${key} not found in map`);
  return node;
};

// ============================================================================
// PRODUCTION-READY CART RECOMMENDATION SYSTEM
// ============================================================================

// ===== DATA MODELS =====

type Product = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  brand: string;
  tags: string[];
  description: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  seasonal?: boolean;
  discount?: number;
  weight: number; // for shipping calculations
  dimensions: [number, number, number]; // LxWxH in inches
};

type Customer = {
  id: string;
  name: string;
  email: string;
  segment: "budget" | "regular" | "premium" | "vip";
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  preferredCategories: string[];
  location: string;
  age?: number;
  gender?: "M" | "F" | "O";
  joinDate: string;
  lastPurchaseDate: string;
  lifetimeValue: number;
};

type Purchase = {
  id: string;
  customerId: string;
  products: Array<{
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    discountApplied: number;
  }>;
  totalAmount: number;
  timestamp: string;
  paymentMethod: string;
  shippingMethod: string;
  orderStatus: "pending" | "shipped" | "delivered" | "cancelled";
};

type RecommendationScore = {
  productId: string;
  score: number;
  reason: string;
  confidence: number;
};

// ===== COMPREHENSIVE PRODUCT CATALOG =====

const products: Product[] = [
  // ===== ELECTRONICS =====
  {
    id: "macbook-pro-16",
    name: "MacBook Pro 16-inch",
    category: "Electronics",
    subcategory: "Laptops",
    price: 2499,
    brand: "Apple",
    tags: ["laptop", "professional", "high-performance", "apple"],
    description: "M2 Max chip, 32GB RAM, 1TB SSD",
    inStock: true,
    rating: 4.8,
    reviewCount: 1247,
    weight: 4.7,
    dimensions: [14.0, 9.8, 0.6],
  },
  {
    id: "dell-xps-13",
    name: "Dell XPS 13",
    category: "Electronics",
    subcategory: "Laptops",
    price: 1299,
    brand: "Dell",
    tags: ["laptop", "ultrabook", "business", "portable"],
    description: "Intel i7, 16GB RAM, 512GB SSD",
    inStock: true,
    rating: 4.5,
    reviewCount: 892,
    weight: 2.7,
    dimensions: [11.6, 7.8, 0.6],
  },
  {
    id: "ipad-pro-12",
    name: "iPad Pro 12.9-inch",
    category: "Electronics",
    subcategory: "Tablets",
    price: 1099,
    brand: "Apple",
    tags: ["tablet", "productivity", "apple-pencil", "m2-chip"],
    description: "M2 chip, 128GB, Liquid Retina XDR display",
    inStock: true,
    rating: 4.7,
    reviewCount: 2156,
    weight: 1.4,
    dimensions: [11.0, 8.5, 0.2],
  },
  {
    id: "airpods-pro",
    name: "AirPods Pro",
    category: "Electronics",
    subcategory: "Audio",
    price: 249,
    brand: "Apple",
    tags: ["wireless", "noise-cancelling", "earbuds", "apple"],
    description: "Active Noise Cancellation, Transparency mode",
    inStock: true,
    rating: 4.6,
    reviewCount: 15432,
    weight: 0.2,
    dimensions: [1.2, 0.9, 0.8],
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    category: "Electronics",
    subcategory: "Audio",
    price: 399,
    brand: "Sony",
    tags: ["wireless", "noise-cancelling", "headphones", "premium"],
    description: "Industry-leading noise cancellation, 30hr battery",
    inStock: true,
    rating: 4.5,
    reviewCount: 3456,
    weight: 0.7,
    dimensions: [7.5, 5.0, 2.0],
  },
  {
    id: "logitech-mx-master-3",
    name: "Logitech MX Master 3S",
    category: "Electronics",
    subcategory: "Accessories",
    price: 99,
    brand: "Logitech",
    tags: ["mouse", "wireless", "ergonomic", "productivity"],
    description: "Advanced ergonomic design, 70-day battery",
    inStock: true,
    rating: 4.4,
    reviewCount: 2834,
    weight: 0.4,
    dimensions: [4.9, 3.3, 1.9],
  },

  // ===== HOME & GARDEN =====
  {
    id: "nespresso-vertuo",
    name: "Nespresso Vertuo Coffee Maker",
    category: "Home & Garden",
    subcategory: "Kitchen",
    price: 199,
    brand: "Nespresso",
    tags: ["coffee-maker", "espresso", "kitchen", "breville"],
    description: "Centrifusion technology, compatible with Vertuo pods",
    inStock: true,
    rating: 4.3,
    reviewCount: 5678,
    weight: 8.2,
    dimensions: [9.4, 6.8, 11.1],
  },
  {
    id: "dyson-v15",
    name: "Dyson V15 Detect",
    category: "Home & Garden",
    subcategory: "Appliances",
    price: 749,
    brand: "Dyson",
    tags: ["vacuum", "cordless", "laser-detection", "premium"],
    description: "Laser dust detection, 60 minutes runtime",
    inStock: true,
    rating: 4.6,
    reviewCount: 3456,
    weight: 6.8,
    dimensions: [10.2, 9.8, 49.6],
  },
  {
    id: "instant-pot-8qt",
    name: "Instant Pot Duo 8QT",
    category: "Home & Garden",
    subcategory: "Kitchen",
    price: 89,
    brand: "Instant Pot",
    tags: ["pressure-cooker", "multi-cooker", "kitchen", "smart"],
    description: "7-in-1 functionality, app control, 8 quart capacity",
    inStock: true,
    rating: 4.7,
    reviewCount: 45678,
    weight: 13.6,
    dimensions: [14.5, 12.5, 12.5],
  },
  {
    id: "kitchenaid-mixer",
    name: "KitchenAid Stand Mixer",
    category: "Home & Garden",
    subcategory: "Kitchen",
    price: 379,
    brand: "KitchenAid",
    tags: ["stand-mixer", "baking", "kitchen", "premium"],
    description: "5-quart tilt-head mixer, 10 speeds, multiple attachments",
    inStock: true,
    rating: 4.8,
    reviewCount: 8923,
    weight: 26.0,
    dimensions: [9.0, 14.0, 13.5],
  },
  {
    id: "roomba-i7",
    name: "iRobot Roomba i7+",
    category: "Home & Garden",
    subcategory: "Appliances",
    price: 1099,
    brand: "iRobot",
    tags: ["robot-vacuum", "smart-home", "automatic-emptying", "premium"],
    description: "Self-emptying robot vacuum, smart mapping, app control",
    inStock: true,
    rating: 4.4,
    reviewCount: 5673,
    weight: 7.4,
    dimensions: [13.7, 13.7, 3.6],
  },

  // ===== FASHION =====
  {
    id: "nike-air-max",
    name: "Nike Air Max 270",
    category: "Fashion",
    subcategory: "Shoes",
    price: 150,
    brand: "Nike",
    tags: ["sneakers", "athletic", "comfortable", "casual"],
    description: "Visible Air cushioning, breathable mesh upper",
    inStock: true,
    rating: 4.3,
    reviewCount: 12345,
    weight: 1.2,
    dimensions: [12.0, 8.0, 4.5],
  },
  {
    id: "levi-501",
    name: "Levi's 501 Original Jeans",
    category: "Fashion",
    subcategory: "Clothing",
    price: 89,
    brand: "Levi's",
    tags: ["jeans", "denim", "classic", "casual"],
    description: "Original fit, 100% cotton, button fly",
    inStock: true,
    rating: 4.4,
    reviewCount: 23456,
    weight: 1.5,
    dimensions: [15.0, 12.0, 2.0],
  },
  {
    id: "patagonia-jacket",
    name: "Patagonia Better Sweater Jacket",
    category: "Fashion",
    subcategory: "Clothing",
    price: 159,
    brand: "Patagonia",
    tags: ["jacket", "fleece", "sustainable", "outdoor"],
    description: "100% recycled polyester, Fair Trade Certified",
    inStock: true,
    rating: 4.6,
    reviewCount: 7890,
    weight: 1.8,
    dimensions: [16.0, 14.0, 2.5],
  },
  {
    id: "ray-ban-sunglasses",
    name: "Ray-Ban Aviator Classic",
    category: "Fashion",
    subcategory: "Accessories",
    price: 153,
    brand: "Ray-Ban",
    tags: ["sunglasses", "classic", "uv-protection", "timeless"],
    description: "Gold frame, polarized lenses, UV400 protection",
    inStock: true,
    rating: 4.5,
    reviewCount: 15678,
    weight: 0.2,
    dimensions: [6.0, 2.0, 1.5],
  },

  // ===== SPORTS & OUTDOORS =====
  {
    id: "peloton-bike",
    name: "Peloton Bike",
    category: "Sports & Outdoors",
    subcategory: "Exercise",
    price: 2495,
    brand: "Peloton",
    tags: ["exercise-bike", "smart", "subscription", "premium"],
    description: "Interactive fitness experience, live & on-demand classes",
    inStock: false,
    rating: 4.2,
    reviewCount: 3456,
    weight: 140.0,
    dimensions: [59.0, 23.0, 53.0],
  },
  {
    id: "yeti-cooler",
    name: "Yeti Tundra 65 Cooler",
    category: "Sports & Outdoors",
    subcategory: "Camping",
    price: 399,
    brand: "Yeti",
    tags: ["cooler", "ice-retention", "durable", "camping"],
    description: "Rotomolded construction, up to 5 days ice retention",
    inStock: true,
    rating: 4.7,
    reviewCount: 9876,
    weight: 32.0,
    dimensions: [30.0, 17.5, 16.5],
  },
  {
    id: "garmin-fenix-7",
    name: "Garmin Fenix 7",
    category: "Sports & Outdoors",
    subcategory: "Electronics",
    price: 699,
    brand: "Garmin",
    tags: ["smartwatch", "fitness", "gps", "multisport"],
    description: "Multi-GNSS GPS, wrist-based heart rate, 18+ sports modes",
    inStock: true,
    rating: 4.5,
    reviewCount: 4567,
    weight: 0.3,
    dimensions: [1.9, 1.9, 0.6],
  },
  {
    id: "patagonia-backpack",
    name: "Patagonia Black Hole 40L",
    category: "Sports & Outdoors",
    subcategory: "Backpacks",
    price: 159,
    brand: "Patagonia",
    tags: ["backpack", "durable", "water-resistant", "hiking"],
    description: "600D polyester, Fair Trade Certified, lifetime warranty",
    inStock: true,
    rating: 4.8,
    reviewCount: 8765,
    weight: 2.1,
    dimensions: [11.0, 9.0, 22.0],
  },

  // ===== BOOKS & MEDIA =====
  {
    id: "kindle-paperwhite",
    name: "Amazon Kindle Paperwhite",
    category: "Books & Media",
    subcategory: "E-readers",
    price: 139,
    brand: "Amazon",
    tags: ["e-reader", "waterproof", "adjustable-light", "portable"],
    description: "6.8-inch display, waterproof, adjustable front light",
    inStock: true,
    rating: 4.6,
    reviewCount: 34567,
    weight: 0.5,
    dimensions: [6.3, 4.5, 0.3],
  },
  {
    id: "atomic-habits",
    name: "Atomic Habits",
    category: "Books & Media",
    subcategory: "Books",
    price: 16,
    brand: "Random House",
    tags: ["self-help", "productivity", "psychology", "bestseller"],
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    inStock: true,
    rating: 4.8,
    reviewCount: 56789,
    weight: 0.8,
    dimensions: [5.5, 8.2, 0.8],
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium (Annual)",
    category: "Books & Media",
    subcategory: "Digital",
    price: 99,
    brand: "Spotify",
    tags: ["music-streaming", "ad-free", "offline", "subscription"],
    description: "Ad-free music streaming, unlimited skips, offline listening",
    inStock: true,
    rating: 4.4,
    reviewCount: 123456,
    seasonal: true,
    weight: 0,
    dimensions: [0, 0, 0],
  },

  // ===== BEAUTY & PERSONAL CARE =====
  {
    id: "dyson-airwrap",
    name: "Dyson Airwrap",
    category: "Beauty & Personal Care",
    subcategory: "Hair Care",
    price: 599,
    brand: "Dyson",
    tags: ["hair-styler", "multi-functional", "ionic", "premium"],
    description: "Coanda smoothing technology, multiple styling attachments",
    inStock: true,
    rating: 4.1,
    reviewCount: 6789,
    weight: 1.6,
    dimensions: [3.1, 9.8, 3.1],
  },
  {
    id: "neutrogena-moisturizer",
    name: "Neutrogena Hydro Boost",
    category: "Beauty & Personal Care",
    subcategory: "Skincare",
    price: 19,
    brand: "Neutrogena",
    tags: ["moisturizer", "hydrating", "oil-free", "spf"],
    description: "Water gel moisturizer with hyaluronic acid",
    inStock: true,
    rating: 4.3,
    reviewCount: 23456,
    weight: 0.3,
    dimensions: [2.0, 2.0, 6.5],
  },
  {
    id: "oral-b-electric",
    name: "Oral-B iO Series 9",
    category: "Beauty & Personal Care",
    subcategory: "Oral Care",
    price: 299,
    brand: "Oral-B",
    tags: ["electric-toothbrush", "smart", "pressure-sensor", "premium"],
    description: "Magnetic drive technology, AI position detection",
    inStock: true,
    rating: 4.5,
    reviewCount: 7890,
    weight: 0.5,
    dimensions: [2.5, 1.5, 10.0],
  },

  // ===== TOYS & GAMES =====
  {
    id: "lego-creator-3in1",
    name: "LEGO Creator 3-in-1 Deep Sea Creatures",
    category: "Toys & Games",
    subcategory: "Building",
    price: 99,
    brand: "LEGO",
    tags: ["lego", "building", "educational", "creative"],
    description: "Builds 3 different models: octopus, sea turtle, or crab",
    inStock: true,
    rating: 4.7,
    reviewCount: 4567,
    weight: 2.5,
    dimensions: [10.0, 7.5, 2.5],
  },
  {
    id: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    category: "Toys & Games",
    subcategory: "Gaming",
    price: 349,
    brand: "Nintendo",
    tags: ["gaming-console", "portable", "nintendo-switch", "family"],
    description: "7-inch OLED screen, enhanced audio, 64GB storage",
    inStock: true,
    rating: 4.6,
    reviewCount: 12345,
    weight: 0.9,
    dimensions: [4.0, 9.5, 2.0],
  },

  // ===== AUTOMOTIVE =====
  {
    id: "anker-car-jump",
    name: "Anker PowerDrive 2",
    category: "Automotive",
    subcategory: "Electronics",
    price: 59,
    brand: "Anker",
    tags: ["jump-starter", "portable", "emergency", "car"],
    description: "10000mAh jump starter, LED flashlight, USB ports",
    inStock: true,
    rating: 4.4,
    reviewCount: 5678,
    weight: 1.2,
    dimensions: [6.5, 3.5, 1.5],
  },
  {
    id: "meguiars-wash",
    name: "Meguiar's Whole Car Air ReFresh",
    category: "Automotive",
    subcategory: "Care",
    price: 79,
    brand: "Meguiar's",
    tags: ["car-wash", "wax", "protection", "shine"],
    description: "pH-balanced car wash, wax protectant, quick detailer",
    inStock: true,
    rating: 4.5,
    reviewCount: 3456,
    weight: 8.5,
    dimensions: [9.0, 4.5, 11.5],
  },

  // ===== OFFICE SUPPLIES =====
  {
    id: "standing-desk",
    name: "Fully Jarvis Standing Desk",
    category: "Office Supplies",
    subcategory: "Furniture",
    price: 999,
    brand: "Fully",
    tags: ["standing-desk", "adjustable", "ergonomic", "premium"],
    description: "Electric height adjustment, memory presets, cable management",
    inStock: true,
    rating: 4.6,
    reviewCount: 2345,
    weight: 120.0,
    dimensions: [60.0, 30.0, 28.0],
  },
  {
    id: "monitor-4k",
    name: "LG 27UL950-W 4K Monitor",
    category: "Office Supplies",
    subcategory: "Electronics",
    price: 699,
    brand: "LG",
    tags: ["monitor", "4k", "usb-c", "productivity"],
    description: "27-inch 4K UHD, USB-C, HDR10, ergonomic stand",
    inStock: true,
    rating: 4.5,
    reviewCount: 3456,
    weight: 15.4,
    dimensions: [24.0, 8.5, 18.0],
  },
];

const customers: Customer[] = [
  {
    id: "john-tech",
    name: "John Smith",
    email: "john.smith@email.com",
    segment: "premium",
    totalSpent: 15420,
    orderCount: 23,
    avgOrderValue: 670.43,
    preferredCategories: ["Electronics", "Books & Media"],
    location: "San Francisco",
    age: 35,
    gender: "M",
    joinDate: "2020-03-15",
    lastPurchaseDate: "2024-11-01",
    lifetimeValue: 18500,
  },
  {
    id: "sarah-home",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    segment: "regular",
    totalSpent: 3240,
    orderCount: 12,
    avgOrderValue: 270,
    preferredCategories: ["Home & Garden", "Fashion"],
    location: "Austin",
    age: 28,
    gender: "F",
    joinDate: "2021-07-22",
    lastPurchaseDate: "2024-10-28",
    lifetimeValue: 4800,
  },
  {
    id: "mike-gamer",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    segment: "vip",
    totalSpent: 28750,
    orderCount: 45,
    avgOrderValue: 639,
    preferredCategories: ["Electronics", "Toys & Games"],
    location: "Seattle",
    age: 24,
    gender: "M",
    joinDate: "2019-11-08",
    lastPurchaseDate: "2024-11-03",
    lifetimeValue: 32000,
  },
  {
    id: "emily-health",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    segment: "premium",
    totalSpent: 8950,
    orderCount: 18,
    avgOrderValue: 497,
    preferredCategories: ["Beauty & Personal Care", "Sports & Outdoors"],
    location: "Portland",
    age: 31,
    gender: "F",
    joinDate: "2020-09-14",
    lastPurchaseDate: "2024-10-30",
    lifetimeValue: 12000,
  },
  {
    id: "david-budget",
    name: "David Wilson",
    email: "david.wilson@email.com",
    segment: "budget",
    totalSpent: 850,
    orderCount: 8,
    avgOrderValue: 106,
    preferredCategories: ["Books & Media", "Office Supplies"],
    location: "Denver",
    age: 26,
    gender: "M",
    joinDate: "2023-01-15",
    lastPurchaseDate: "2024-09-15",
    lifetimeValue: 1200,
  },
  {
    id: "lisa-luxury",
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@email.com",
    segment: "vip",
    totalSpent: 45600,
    orderCount: 67,
    avgOrderValue: 681,
    preferredCategories: ["Fashion", "Home & Garden", "Beauty & Personal Care"],
    location: "New York",
    age: 42,
    gender: "F",
    joinDate: "2018-05-20",
    lastPurchaseDate: "2024-11-02",
    lifetimeValue: 52000,
  },
  {
    id: "alex-student",
    name: "Alex Thompson",
    email: "alex.t@email.com",
    segment: "budget",
    totalSpent: 420,
    orderCount: 5,
    avgOrderValue: 84,
    preferredCategories: ["Books & Media", "Electronics"],
    location: "Boston",
    age: 22,
    gender: "M",
    joinDate: "2023-08-10",
    lastPurchaseDate: "2024-10-20",
    lifetimeValue: 600,
  },
  {
    id: "rachel-pro",
    name: "Rachel Kim",
    email: "rachel.kim@email.com",
    segment: "premium",
    totalSpent: 12300,
    orderCount: 28,
    avgOrderValue: 439,
    preferredCategories: ["Sports & Outdoors", "Electronics"],
    location: "San Diego",
    age: 29,
    gender: "F",
    joinDate: "2020-12-03",
    lastPurchaseDate: "2024-11-01",
    lifetimeValue: 15000,
  },
  {
    id: "tom-retiree",
    name: "Tom Anderson",
    email: "tom.anderson@email.com",
    segment: "regular",
    totalSpent: 2150,
    orderCount: 9,
    avgOrderValue: 239,
    preferredCategories: ["Home & Garden", "Books & Media"],
    location: "Phoenix",
    age: 65,
    gender: "M",
    joinDate: "2022-04-18",
    lastPurchaseDate: "2024-10-15",
    lifetimeValue: 2800,
  },
  {
    id: "jessica-fashion",
    name: "Jessica Lee",
    email: "jessica.lee@email.com",
    segment: "premium",
    totalSpent: 6780,
    orderCount: 15,
    avgOrderValue: 452,
    preferredCategories: ["Fashion", "Beauty & Personal Care"],
    location: "Los Angeles",
    age: 33,
    gender: "F",
    joinDate: "2021-02-14",
    lastPurchaseDate: "2024-10-29",
    lifetimeValue: 8500,
  },
];

// ===== PURCHASE HISTORY =====

const purchases: Purchase[] = [
  // John Tech's purchases
  {
    id: "order-001",
    customerId: "john-tech",
    products: [
      {
        productId: "macbook-pro-16",
        quantity: 1,
        priceAtPurchase: 2499,
        discountApplied: 0,
      },
    ],
    totalAmount: 2499,
    timestamp: "2024-11-01T10:30:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "express",
    orderStatus: "delivered",
  },
  {
    id: "order-002",
    customerId: "john-tech",
    products: [
      {
        productId: "airpods-pro",
        quantity: 1,
        priceAtPurchase: 249,
        discountApplied: 0,
      },
      {
        productId: "logitech-mx-master-3",
        quantity: 1,
        priceAtPurchase: 99,
        discountApplied: 0,
      },
    ],
    totalAmount: 348,
    timestamp: "2024-10-15T14:20:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },
  {
    id: "order-003",
    customerId: "john-tech",
    products: [
      {
        productId: "kindle-paperwhite",
        quantity: 1,
        priceAtPurchase: 139,
        discountApplied: 0,
      },
      {
        productId: "atomic-habits",
        quantity: 1,
        priceAtPurchase: 16,
        discountApplied: 0,
      },
    ],
    totalAmount: 155,
    timestamp: "2024-09-20T09:15:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },

  // Sarah Home's purchases
  {
    id: "order-004",
    customerId: "sarah-home",
    products: [
      {
        productId: "nespresso-vertuo",
        quantity: 1,
        priceAtPurchase: 199,
        discountApplied: 0,
      },
      {
        productId: "instant-pot-8qt",
        quantity: 1,
        priceAtPurchase: 89,
        discountApplied: 0,
      },
    ],
    totalAmount: 288,
    timestamp: "2024-10-28T16:45:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "shipped",
  },
  {
    id: "order-005",
    customerId: "sarah-home",
    products: [
      {
        productId: "kitchenaid-mixer",
        quantity: 1,
        priceAtPurchase: 379,
        discountApplied: 50,
      },
      {
        productId: "patagonia-jacket",
        quantity: 1,
        priceAtPurchase: 159,
        discountApplied: 0,
      },
    ],
    totalAmount: 488,
    timestamp: "2024-08-12T11:30:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },

  // Mike Gamer's purchases
  {
    id: "order-006",
    customerId: "mike-gamer",
    products: [
      {
        productId: "nintendo-switch-oled",
        quantity: 1,
        priceAtPurchase: 349,
        discountApplied: 0,
      },
      {
        productId: "nike-air-max",
        quantity: 1,
        priceAtPurchase: 150,
        discountApplied: 0,
      },
    ],
    totalAmount: 499,
    timestamp: "2024-11-03T13:20:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "express",
    orderStatus: "pending",
  },
  {
    id: "order-007",
    customerId: "mike-gamer",
    products: [
      {
        productId: "sony-wh-1000xm5",
        quantity: 1,
        priceAtPurchase: 399,
        discountApplied: 0,
      },
      {
        productId: "dyson-v15",
        quantity: 1,
        priceAtPurchase: 749,
        discountApplied: 100,
      },
    ],
    totalAmount: 1048,
    timestamp: "2024-10-08T15:10:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "express",
    orderStatus: "delivered",
  },

  // Emily Health's purchases
  {
    id: "order-008",
    customerId: "emily-health",
    products: [
      {
        productId: "dyson-airwrap",
        quantity: 1,
        priceAtPurchase: 599,
        discountApplied: 0,
      },
      {
        productId: "neutrogena-moisturizer",
        quantity: 2,
        priceAtPurchase: 19,
        discountApplied: 0,
      },
    ],
    totalAmount: 637,
    timestamp: "2024-10-30T12:15:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "shipped",
  },
  {
    id: "order-009",
    customerId: "emily-health",
    products: [
      {
        productId: "garmin-fenix-7",
        quantity: 1,
        priceAtPurchase: 699,
        discountApplied: 0,
      },
      {
        productId: "patagonia-backpack",
        quantity: 1,
        priceAtPurchase: 159,
        discountApplied: 0,
      },
    ],
    totalAmount: 858,
    timestamp: "2024-09-05T10:45:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },

  // David Budget's purchases
  {
    id: "order-010",
    customerId: "david-budget",
    products: [
      {
        productId: "atomic-habits",
        quantity: 1,
        priceAtPurchase: 16,
        discountApplied: 0,
      },
      {
        productId: "kindle-paperwhite",
        quantity: 1,
        priceAtPurchase: 139,
        discountApplied: 20,
      },
    ],
    totalAmount: 135,
    timestamp: "2024-09-15T14:30:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },

  // Lisa Luxury's purchases
  {
    id: "order-011",
    customerId: "lisa-luxury",
    products: [
      {
        productId: "ray-ban-sunglasses",
        quantity: 1,
        priceAtPurchase: 153,
        discountApplied: 0,
      },
      {
        productId: "patagonia-jacket",
        quantity: 1,
        priceAtPurchase: 159,
        discountApplied: 0,
      },
      {
        productId: "levi-501",
        quantity: 2,
        priceAtPurchase: 89,
        discountApplied: 0,
      },
    ],
    totalAmount: 490,
    timestamp: "2024-11-02T11:20:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "express",
    orderStatus: "pending",
  },

  // Alex Student's purchases
  {
    id: "order-012",
    customerId: "alex-student",
    products: [
      {
        productId: "dell-xps-13",
        quantity: 1,
        priceAtPurchase: 1299,
        discountApplied: 150,
      },
      {
        productId: "atomic-habits",
        quantity: 1,
        priceAtPurchase: 16,
        discountApplied: 0,
      },
    ],
    totalAmount: 1165,
    timestamp: "2024-10-20T16:10:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "shipped",
  },

  // Rachel Pro's purchases
  {
    id: "order-013",
    customerId: "rachel-pro",
    products: [
      {
        productId: "yeti-cooler",
        quantity: 1,
        priceAtPurchase: 399,
        discountApplied: 0,
      },
      {
        productId: "garmin-fenix-7",
        quantity: 1,
        priceAtPurchase: 699,
        discountApplied: 50,
      },
    ],
    totalAmount: 1048,
    timestamp: "2024-11-01T09:45:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "shipped",
  },

  // Tom Retiree's purchases
  {
    id: "order-014",
    customerId: "tom-retiree",
    products: [
      {
        productId: "kindle-paperwhite",
        quantity: 1,
        priceAtPurchase: 139,
        discountApplied: 0,
      },
      {
        productId: "nespresso-vertuo",
        quantity: 1,
        priceAtPurchase: 199,
        discountApplied: 30,
      },
    ],
    totalAmount: 308,
    timestamp: "2024-10-15T13:25:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },

  // Jessica Fashion's purchases
  {
    id: "order-015",
    customerId: "jessica-fashion",
    products: [
      {
        productId: "nike-air-max",
        quantity: 1,
        priceAtPurchase: 150,
        discountApplied: 0,
      },
      {
        productId: "ray-ban-sunglasses",
        quantity: 1,
        priceAtPurchase: 153,
        discountApplied: 0,
      },
      {
        productId: "neutrogena-moisturizer",
        quantity: 1,
        priceAtPurchase: 19,
        discountApplied: 0,
      },
    ],
    totalAmount: 322,
    timestamp: "2024-10-29T15:40:00Z",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    orderStatus: "delivered",
  },
];

// ===== RECOMMENDATION ENGINE =====

const cartRecommendationEngine = Effect.gen(function* () {
  yield* Effect.log("🛒 ENTERPRISE CART RECOMMENDATION SYSTEM");
  yield* Effect.log("========================================\n");

  // ===== BUILD PRODUCT RELATIONSHIP GRAPH =====
  const productGraph = Graph.mutate(
    Graph.undirected<
      Product,
      {
        weight: number;
        type: "co_purchase" | "similar" | "category" | "complementary";
      }
    >(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add all products as nodes
      for (const product of products) {
        nodeMap.set(product.id, Graph.addNode(mutable, product));
      }

      const getNode = (id: string) => findNodeInMap(nodeMap, id);

      // ===== BUILD PRODUCT RELATIONSHIPS =====

      // 1. Co-purchase relationships (from purchase history)
      const coPurchaseCounts = new Map<string, Map<string, number>>();

      for (const purchase of purchases) {
        const productIds = purchase.products.map((p) => p.productId);
        for (let i = 0; i < productIds.length; i++) {
          for (let j = i + 1; j < productIds.length; j++) {
            const prod1 = productIds[i];
            const prod2 = productIds[j];

            if (!prod1 || !prod2) continue;

            if (!coPurchaseCounts.has(prod1)) {
              coPurchaseCounts.set(prod1, new Map());
            }
            const prod1Counts = coPurchaseCounts.get(prod1);
            if (!prod1Counts) continue;
            prod1Counts.set(prod2, (prod1Counts.get(prod2) || 0) + 1);
          }
        }
      }

      // Add co-purchase edges
      for (const [prod1, counts] of coPurchaseCounts) {
        for (const [prod2, count] of counts) {
          const weight = Math.min(count * 2, 10); // Scale weight, max 10
          Graph.addEdge(mutable, getNode(prod1), getNode(prod2), {
            weight,
            type: "co_purchase",
          });
        }
      }

      // 2. Category relationships
      const categoryProducts = new Map<string, Product[]>();
      for (const product of products) {
        if (!categoryProducts.has(product.category)) {
          categoryProducts.set(product.category, []);
        }
        const categoryList = categoryProducts.get(product.category);
        if (categoryList) {
          categoryList.push(product);
        }
      }

      for (const [, catProducts] of categoryProducts) {
        for (let i = 0; i < catProducts.length; i++) {
          for (let j = i + 1; j < catProducts.length; j++) {
            const prod1 = catProducts[i];
            const prod2 = catProducts[j];

            if (!prod1 || !prod2) continue;

            // Add category relationship edge
            Graph.addEdge(mutable, getNode(prod1.id), getNode(prod2.id), {
              weight: 1, // Low weight for category connections
              type: "category",
            });
          }
        }
      }

      // 3. Complementary product relationships
      const complementaryRules = [
        // Tech accessories
        ["macbook-pro-16", "airpods-pro", 8],
        ["macbook-pro-16", "logitech-mx-master-3", 7],
        ["dell-xps-13", "logitech-mx-master-3", 6],
        ["ipad-pro-12", "airpods-pro", 9],
        ["nintendo-switch-oled", "yeti-cooler", 5],

        // Kitchen combinations
        ["nespresso-vertuo", "instant-pot-8qt", 6],
        ["instant-pot-8qt", "kitchenaid-mixer", 7],
        ["kitchenaid-mixer", "nespresso-vertuo", 5],

        // Beauty routines
        ["dyson-airwrap", "neutrogena-moisturizer", 8],
        ["neutrogena-moisturizer", "oral-b-electric", 6],

        // Outdoor gear
        ["garmin-fenix-7", "patagonia-backpack", 9],
        ["patagonia-backpack", "yeti-cooler", 7],
        ["yeti-cooler", "patagonia-jacket", 6],

        // Office setups
        ["standing-desk", "monitor-4k", 8],
        ["monitor-4k", "logitech-mx-master-3", 6],
        ["dell-xps-13", "monitor-4k", 7],
      ];

      for (const rule of complementaryRules) {
        const [prod1, prod2, weight] = rule;
        if (
          typeof prod1 === "string" &&
          typeof prod2 === "string" &&
          typeof weight === "number" &&
          nodeMap.has(prod1) &&
          nodeMap.has(prod2)
        ) {
          Graph.addEdge(mutable, getNode(prod1), getNode(prod2), {
            weight,
            type: "complementary",
          });
        }
      }
    }
  );

  yield* Effect.log(`📊 Product Relationship Graph Built:`);
  yield* Effect.log(`   • ${productGraph.nodes.size} products`);
  yield* Effect.log(`   • ${productGraph.edges.size} relationships`);
  yield* Effect.log(
    `   • Categories: ${new Set(products.map((p) => p.category)).size}`
  );
  yield* Effect.log(
    `   • Brands: ${new Set(products.map((p) => p.brand)).size}\n`
  );

  // ===== RECOMMENDATION ALGORITHMS =====

  const generateRecommendations = (
    customerId: string,
    cartProducts: string[],
    maxRecommendations: number = 5
  ): RecommendationScore[] => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return [];

    const recommendations: RecommendationScore[] = [];
    const recommendedProducts = new Set(cartProducts);

    // Get customer's purchase history
    const customerPurchases = purchases.filter(
      (p) => p.customerId === customerId
    );
    const purchasedProductIds = new Set(
      customerPurchases.flatMap((p) => p.products.map((prod) => prod.productId))
    );

    for (const product of products) {
      if (
        recommendedProducts.has(product.id) ||
        purchasedProductIds.has(product.id) ||
        !product.inStock
      ) {
        continue;
      }

      let score = 0;
      let confidence = 0.5;
      const reasons: string[] = [];

      // ===== SCORING ALGORITHMS =====

      // 1. Co-purchase scoring (using BFS to find frequently bought together)
      for (const cartProductId of cartProducts) {
        const cartProductNode = Array.from(
          productGraph.nodes.values()
        ).findIndex((p) => p.id === cartProductId);
        const targetProductNode = Array.from(
          productGraph.nodes.values()
        ).findIndex((p) => p.id === product.id);

        if (cartProductNode !== -1 && targetProductNode !== -1) {
          const shortestPath = Graph.dijkstra(productGraph, {
            source: cartProductNode,
            target: targetProductNode,
            cost: (edgeData) => {
              // Lower cost for stronger co-purchase relationships
              if (edgeData.type === "co_purchase") return 11 - edgeData.weight;
              if (edgeData.type === "complementary")
                return 6 - edgeData.weight / 2;
              return 10; // Higher cost for category relationships
            },
          });

          if (Option.isSome(shortestPath) && shortestPath.value.distance < 5) {
            const pathWeight = shortestPath.value.distance;
            score += Math.max(0, 10 - pathWeight * 2);
            confidence = Math.max(confidence, 0.8);
            reasons.push(
              `Frequently bought with ${
                products.find((p) => p.id === cartProductId)?.name
              }`
            );
          }
        }
      }

      // 2. Customer preference scoring
      if (customer.preferredCategories.includes(product.category)) {
        score += 3;
        confidence = Math.max(confidence, 0.7);
        reasons.push(`Matches your preferred category: ${product.category}`);
      }

      // 3. Price sensitivity scoring
      const priceDiff = Math.abs(product.price - customer.avgOrderValue);
      const priceScore = Math.max(
        0,
        5 - (priceDiff / customer.avgOrderValue) * 10
      );
      score += priceScore;

      // 4. Customer segment scoring
      if (customer.segment === "budget" && product.price < 100) score += 2;
      if (customer.segment === "premium" && product.price > 500) score += 2;
      if (customer.segment === "vip" && product.rating > 4.5) score += 2;

      // 5. Seasonal/product lifecycle scoring
      if (product.seasonal) score += 1;

      // 6. Rating/popularity scoring
      score += (product.rating - 4.0) * 2;
      score += Math.min(product.reviewCount / 1000, 3);

      // 7. Brand loyalty scoring
      const customerBrands = new Set(
        customerPurchases.flatMap((p) =>
          p.products
            .map((prod) => products.find((p) => p.id === prod.productId)?.brand)
            .filter(Boolean)
        )
      );
      if (customerBrands.has(product.brand)) {
        score += 2;
        reasons.push(`Brand you've purchased before: ${product.brand}`);
      }

      if (score > 0) {
        recommendations.push({
          productId: product.id,
          score: Math.round(score * 100) / 100,
          reason:
            reasons.length > 0
              ? reasons[0] || "Popular product"
              : "Popular product",
          confidence,
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);
  };

  // ===== DEMONSTRATION SCENARIOS =====

  // Scenario 1: Tech Professional Shopping for Laptop
  yield* Effect.log("🎯 SCENARIO 1: Tech Professional Laptop Shopping");
  yield* Effect.log("Customer: John Smith (Premium segment, $15K+ spent)");
  yield* Effect.log("Cart: MacBook Pro 16-inch");
  yield* Effect.log("");

  const johnCart = ["macbook-pro-16"];
  const johnRecommendations = generateRecommendations("john-tech", johnCart, 5);

  yield* Effect.log("📋 Recommended Products:");
  for (let i = 0; i < johnRecommendations.length; i++) {
    const rec = johnRecommendations[i];
    if (!rec) continue;
    const product = products.find((p) => p.id === rec.productId);
    if (!product) continue;
    yield* Effect.log(
      `${i + 1}. ${product.name} (${product.brand}) - $${product.price}`
    );
    yield* Effect.log(`   Score: ${rec.score}/10, ${rec.reason}`);
    yield* Effect.log(
      `   ⭐ ${product.rating}/5 (${product.reviewCount} reviews)`
    );
    yield* Effect.log("");
  }

  // Scenario 2: Home Chef Kitchen Upgrade
  yield* Effect.log("🏠 SCENARIO 2: Home Chef Kitchen Upgrade");
  yield* Effect.log(
    "Customer: Sarah Johnson (Regular segment, kitchen enthusiast)"
  );
  yield* Effect.log("Cart: Nespresso Vertuo Coffee Maker, Instant Pot 8QT");
  yield* Effect.log("");

  const sarahCart = ["nespresso-vertuo", "instant-pot-8qt"];
  const sarahRecommendations = yield* Effect.sync(() =>
    generateRecommendations("sarah-home", sarahCart, 4)
  ).pipe(
    Effect.withSpan("sarahRecommendations", {
      attributes: {
        customerId: "sarah-home",
        cartProductIds: ["nespresso-vertuo", "instant-pot-8qt"],
      },
    })
  );

  yield* Effect.log("📋 Recommended Products:");
  for (let i = 0; i < sarahRecommendations.length; i++) {
    const rec = sarahRecommendations[i];
    if (!rec) continue;
    const product = products.find((p) => p.id === rec.productId);
    if (!product) continue;
    yield* Effect.log(
      `${i + 1}. ${product.name} (${product.brand}) - $${product.price}`
    );
    yield* Effect.log(`   Score: ${rec.score}/10, ${rec.reason}`);
    yield* Effect.log("");
  }

  // Scenario 3: Budget Student Shopping
  yield* Effect.log("📚 SCENARIO 3: Budget-Conscious Student");
  yield* Effect.log(
    "Customer: Alex Thompson (Budget segment, first-time buyer)"
  );
  yield* Effect.log("Cart: Dell XPS 13 Laptop");
  yield* Effect.log("");

  const alexCart = ["dell-xps-13"];
  const alexRecommendations = yield* Effect.sync(() =>
    generateRecommendations("alex-student", alexCart, 5)
  ).pipe(
    Effect.withSpan("alexRecommendations", {
      attributes: {
        customerId: "alex-student",
        cartProductIds: ["dell-xps-13"],
      },
    })
  );

  yield* Effect.log("📋 Recommended Products (Budget-Friendly):");
  for (let i = 0; i < alexRecommendations.length; i++) {
    const rec = alexRecommendations[i];
    if (!rec) continue;
    const product = products.find((p) => p.id === rec.productId);
    if (!product) continue;
    yield* Effect.log(
      `${i + 1}. ${product.name} (${product.brand}) - $${product.price}`
    );
    yield* Effect.log(`   Score: ${rec.score}/10, ${rec.reason}`);
    yield* Effect.log("");
  }

  // Scenario 4: Luxury Fashion Shopping
  yield* Effect.log("👗 SCENARIO 4: Luxury Fashion Enthusiast");
  yield* Effect.log("Customer: Lisa Rodriguez (VIP segment, $45K+ spent)");
  yield* Effect.log("Cart: Ray-Ban Aviator Sunglasses, Patagonia Jacket");
  yield* Effect.log("");

  const lisaCart = ["ray-ban-sunglasses", "patagonia-jacket"];
  const lisaRecommendations = yield* Effect.sync(() =>
    generateRecommendations("lisa-luxury", lisaCart, 3)
  ).pipe(
    Effect.withSpan("lisaRecommendations", {
      attributes: {
        customerId: "lisa-luxury",
        cartProductIds: ["ray-ban-sunglasses", "patagonia-jacket"],
      },
    })
  );

  yield* Effect.log("📋 Recommended Products (Premium):");
  for (let i = 0; i < lisaRecommendations.length; i++) {
    const rec = lisaRecommendations[i];
    if (!rec) continue;
    const product = products.find((p) => p.id === rec.productId);
    if (!product) continue;
    yield* Effect.log(
      `${i + 1}. ${product.name} (${product.brand}) - $${product.price}`
    );
    yield* Effect.log(`   Score: ${rec.score}/10, ${rec.reason}`);
    yield* Effect.log("");
  }

  // ===== ENTERPRISE ANALYTICS =====

  yield* Effect.log("📈 ENTERPRISE ANALYTICS DASHBOARD");
  yield* Effect.log("=================================\n");

  // Category Performance
  const categoryRevenue = new Map<string, number>();
  const categoryOrders = new Map<string, number>();

  yield* Effect.sync(() => {
    for (const purchase of purchases) {
      for (const item of purchase.products) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          categoryRevenue.set(
            product.category,
            (categoryRevenue.get(product.category) || 0) +
              item.priceAtPurchase * item.quantity
          );
          categoryOrders.set(
            product.category,
            (categoryOrders.get(product.category) || 0) + 1
          );
        }
      }
    }
  }).pipe(
    Effect.withSpan("categoryPerformance", {
      attributes: {
        categoryRevenue,
        categoryOrders,
      },
    })
  );

  yield* Effect.log("💰 Category Performance (Revenue & Orders):");
  const sortedCategories = Array.from(categoryRevenue.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  for (const [category, revenue] of sortedCategories) {
    const orders = categoryOrders.get(category) || 0;
    const avgOrderValue = revenue / orders;
    yield* Effect.log(
      `${category}: $${revenue.toLocaleString()} revenue, ${orders} orders, $${avgOrderValue.toFixed(
        0
      )} AOV`
    );
  }
  yield* Effect.log("");

  // Customer Segmentation Analysis
  yield* Effect.log("👥 Customer Segmentation Analysis:");
  const segmentStats = new Map<
    string,
    { count: number; totalRevenue: number; avgLifetimeValue: number }
  >();

  yield* Effect.sync(() => {
    for (const customer of customers) {
      const existing = segmentStats.get(customer.segment) || {
        count: 0,
        totalRevenue: 0,
        avgLifetimeValue: 0,
      };
      existing.count++;
      existing.totalRevenue += customer.totalSpent;
      existing.avgLifetimeValue =
        (existing.avgLifetimeValue * (existing.count - 1) +
          customer.lifetimeValue) /
        existing.count;
      segmentStats.set(customer.segment, existing);
    }
  }).pipe(
    Effect.withSpan("segmentStats", {
      attributes: {
        segmentStats,
      },
    })
  );

  for (const [segment, stats] of segmentStats) {
    yield* Effect.log(
      `${segment.toUpperCase()}: ${
        stats.count
      } customers, $${stats.totalRevenue.toLocaleString()} revenue, $${stats.avgLifetimeValue.toFixed(
        0
      )} avg lifetime value`
    );
  }
  yield* Effect.log("");

  // Product Performance Analysis
  yield* Effect.log("🏆 Top Performing Products:");
  const productSales = new Map<
    string,
    { revenue: number; units: number; orders: number }
  >();

  for (const purchase of purchases) {
    for (const item of purchase.products) {
      const existing = productSales.get(item.productId) || {
        revenue: 0,
        units: 0,
        orders: 0,
      };
      existing.revenue += item.priceAtPurchase * item.quantity;
      existing.units += item.quantity;
      existing.orders += 1;
      productSales.set(item.productId, existing);
    }
  }

  const topProducts = Array.from(productSales.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  for (const [productId, stats] of topProducts) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      yield* Effect.log(
        `${product.name}: $${stats.revenue.toLocaleString()} revenue, ${
          stats.units
        } units, ${stats.orders} orders`
      );
    }
  }
  yield* Effect.log("");

  // ===== PRODUCTION API SIMULATION =====

  yield* Effect.log("🔧 PRODUCTION API SIMULATION");
  yield* Effect.log("=============================\n");

  // Simulate API calls that would be used in production
  const simulateApiCall = <T>(endpoint: string, data: T, delay: number = 100) =>
    Effect.gen(function* () {
      yield* Effect.log(`📡 API Call: ${endpoint}`);
      yield* Effect.sleep(delay);
      return data;
    });

  // API: Get recommendations for cart
  const getCartRecommendations = (
    customerId: string,
    cartProductIds: string[]
  ) =>
    simulateApiCall(`POST /api/recommendations/cart`, {
      customerId,
      cartProductIds,
      recommendations: generateRecommendations(customerId, cartProductIds, 6),
      generatedAt: new Date().toISOString(),
    }).pipe(
      Effect.withSpan("getCartRecommendations", {
        attributes: { customerId, cartProductIds },
      })
    );

  // API: Get customer insights
  const getCustomerInsights = (customerId: string) =>
    simulateApiCall(`GET /api/customers/${customerId}/insights`, {
      customerId,
      segment: customers.find((c) => c.id === customerId)?.segment,
      totalSpent: customers.find((c) => c.id === customerId)?.totalSpent,
      recommendationsGenerated: 15,
      lastActivity: new Date().toISOString(),
    }).pipe(
      Effect.withSpan("getCustomerInsights", { attributes: { customerId } })
    );

  // API: Get product analytics
  const getProductAnalytics = (productId: string) =>
    simulateApiCall(`GET /api/products/${productId}/analytics`, {
      productId,
      salesVelocity: "high",
      stockoutRisk: "low",
      recommendationScore: 8.5,
      competitorPrice:
        (products.find((p) => p.id === productId)?.price || 0) * 0.95,
    }).pipe(
      Effect.withSpan("getProductAnalytics", { attributes: { productId } })
    );

  // Demonstrate API calls
  yield* Effect.log("🚀 Simulating Production API Calls:\n");

  const cartRecs = yield* getCartRecommendations("john-tech", [
    "macbook-pro-16",
    "airpods-pro",
  ]).pipe(
    Effect.withSpan("getCartRecommendations", {
      attributes: {
        customerId: "john-tech",
        cartProductIds: ["macbook-pro-16", "airpods-pro"],
      },
    })
  );
  yield* Effect.log(
    `✅ Generated ${cartRecs.recommendations.length} cart recommendations\n`
  );

  const customerInsights = yield* getCustomerInsights("john-tech").pipe(
    Effect.withSpan("getCustomerInsights", {
      attributes: { customerId: "john-tech" },
    })
  );
  yield* Effect.log(
    `✅ Retrieved customer insights: ${customerInsights.segment} segment, $${customerInsights.totalSpent} spent\n`
  );

  const productAnalytics = yield* getProductAnalytics("airpods-pro").pipe(
    Effect.withSpan("getProductAnalytics", {
      attributes: { productId: "airpods-pro" },
    })
  );
  yield* Effect.log(
    `✅ Product analytics: ${productAnalytics.salesVelocity} velocity, ${productAnalytics.stockoutRisk} stockout risk\n`
  );

  yield* Effect.log("🎉 Cart Recommendation System Ready for Production!");
  yield* Effect.log("Features include:");
  yield* Effect.log("   • Real-time personalized recommendations");
  yield* Effect.log("   • Multi-dimensional product relationships");
  yield* Effect.log("   • Customer segmentation & lifetime value analysis");
  yield* Effect.log("   • Enterprise analytics dashboard");
  yield* Effect.log("   • Production-ready API endpoints");
  yield* Effect.log("   • Scalable graph-based algorithms");
});

const program = Effect.gen(function* () {
  yield* cartRecommendationEngine.pipe(
    Effect.withSpan("cartRecommendationEngine")
  );
});

BunRuntime.runMain(
  program.pipe(
    Effect.withSpan("cartRecommendationSystem"),
    Effect.provide(DevTools.layer()),
    Effect.provide(BunContext.layer),
    Effect.scoped
  )
);
