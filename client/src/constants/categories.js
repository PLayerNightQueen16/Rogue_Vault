import {
  Sparkles,
  Shirt,
  Headphones,
  Armchair,
  ShoppingBasket,
  Car,
  Dumbbell,
} from "lucide-react";

export const CATEGORY_GROUPS = {
  Beauty: [
    "beauty",
    "fragrances",
    "skin-care",
  ],

  Fashion: [
    "mens-shirts",
    "mens-shoes",
    "mens-watches",
    "tops",
    "womens-bags",
    "womens-dresses",
    "womens-jewellery",
    "womens-shoes",
    "womens-watches",
    "sunglasses",
  ],

  Electronics: [
    "laptops",
    "smartphones",
    "tablets",
    "mobile-accessories",
  ],

  Home: [
    "furniture",
    "home-decoration",
    "kitchen-accessories",
  ],

  Grocery: [
    "groceries",
  ],

  Automotive: [
    "motorcycle",
    "vehicle",
  ],

  Sports: [
    "sports-accessories",
  ],
};

export const CATEGORY_ICONS = {
  Beauty: Sparkles,
  Fashion: Shirt,
  Electronics: Headphones,
  Home: Armchair,
  Grocery: ShoppingBasket,
  Automotive: Car,
  Sports: Dumbbell,
};

export const DUMMY_CATEGORIES = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches"
];

export const getMainCategory = (categoryOrSlug) => {
  if (!categoryOrSlug || categoryOrSlug.toLowerCase() === 'all') return null;
  if (CATEGORY_GROUPS[categoryOrSlug]) return categoryOrSlug;
  const matchedKey = Object.keys(CATEGORY_GROUPS).find(
    (key) => key.toLowerCase() === categoryOrSlug.toLowerCase()
  );
  if (matchedKey) return matchedKey;
  for (const [mainCat, subcats] of Object.entries(CATEGORY_GROUPS)) {
    if (subcats.some((s) => s.toLowerCase() === categoryOrSlug.toLowerCase())) {
      return mainCat;
    }
  }
  return null;
};

export const getSubcategoriesForGroup = (groupName) => {
  if (!groupName) return [];
  for (const [mainCat, subcats] of Object.entries(CATEGORY_GROUPS)) {
    if (mainCat.toLowerCase() === groupName.toLowerCase()) {
      return subcats;
    }
  }
  return [];
};

export const isMainCategory = (categoryName) => {
  if (!categoryName) return false;
  return Object.keys(CATEGORY_GROUPS).some(
    (mainCat) => mainCat.toLowerCase() === categoryName.toLowerCase()
  );
};

export const formatCategoryName = (slug) => {
  if (!slug || slug.toLowerCase() === 'all') return 'All Products';
  const main = getMainCategory(slug);
  if (main && main.toLowerCase() === slug.toLowerCase()) {
    return main;
  }
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const CATEGORY_ITEMS = Object.keys(CATEGORY_GROUPS).map((groupName) => ({
  id: groupName,
  label: groupName,
  icon: CATEGORY_ICONS[groupName],
}));

export const CATEGORY_FALLBACKS = {
  // Main Categories
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  electronics: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',

  Beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  Fashion: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  Electronics: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
  Home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
  Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  Automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
  Sports: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',

  // Original Subcategories
  fragrances: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  'home-decoration': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
  'kitchen-accessories': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
  'mens-shirts': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  'mens-shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
  'mens-watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
  'mobile-accessories': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
  motorcycle: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
  'skin-care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'sports-accessories': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
  sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
  tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
  tops: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
  vehicle: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
  'womens-bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  'womens-dresses': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
  'womens-jewellery': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  'womens-shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
  'womens-watches': 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
};
