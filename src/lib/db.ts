import { createClient } from '@supabase/supabase-js';

// Load seed data from JS files
// @ts-ignore
import { products as seedProducts } from '@/data/products';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface Product {
  id: string;
  numericId: number;
  name: string;
  category: string;
  categoryDisplay: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  sizes: string[];
  stock: Record<string, number>; // Maps size -> quantity
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  badge: string;
  slug: string;
  isNew: boolean;
  isSale: boolean;
  isBestSeller: boolean;
  sku: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingMethod: string;
  paymentMethod: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
  }[];
  total: number;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  active: boolean;
}

// In-Memory Storage for server-side fallback, and LocalStorage for client-side fallback
let localProducts: Product[] = [];
let localReviews: Review[] = [];
let localOrders: Order[] = [];
let localCoupons: Coupon[] = [];
let localVisits: { date: string; count: number }[] = [];

// Helper to normalize product from seed format or raw format
function normalizeProduct(raw: any, index: number = 0): Product {
  const category = raw.category || 'jeans';
  const sizes = raw.sizes || (category === 'jeans' ? ['38', '40', '42', '44', '46'] : ['S', 'M', 'L', 'XL']);
  
  // Stock normalization: convert simple number to structured object mapping size -> stock
  let sizeStock: Record<string, number> = {};
  if (typeof raw.stock === 'object' && raw.stock !== null) {
    sizeStock = raw.stock;
  } else {
    // If stock is a number, distribute it among sizes
    const stockVal = typeof raw.stock === 'number' ? raw.stock : 10;
    sizes.forEach((s: string, idx: number) => {
      // Deterministic but distributed
      sizeStock[s] = idx === 0 ? Math.max(1, stockVal - 2) : Math.max(0, Math.floor(stockVal / sizes.length));
    });
  }

  // Generate deterministic SKU if not present
  const sku = raw.sku || `GST-${category.slice(0, 3).toUpperCase()}-${String(raw.numericId || index + 1).padStart(3, '0')}`;

  return {
    id: raw.id || raw.slug || `product-${index}`,
    numericId: raw.numericId || index + 1,
    name: raw.name || 'Producto sin nombre',
    category: category,
    categoryDisplay: raw.categoryDisplay || (category.charAt(0).toUpperCase() + category.slice(1)),
    price: raw.price || 0,
    originalPrice: raw.originalPrice || null,
    image: raw.image || '',
    images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [raw.image || ''],
    sizes: sizes,
    stock: sizeStock,
    rating: raw.rating || 5,
    reviewsCount: raw.reviewsCount || 0,
    description: raw.description || 'Prenda de la colección oficial de Good Style.',
    features: Array.isArray(raw.features) ? raw.features : [
      "Materiales de alta calidad y tacto suave",
      "Corte moderno adaptado al estilo de vida actual",
      "Costuras reforzadas para mayor resistencia"
    ],
    badge: raw.badge || '',
    slug: raw.slug || raw.id || `product-${index}`,
    isNew: !!raw.isNew,
    isSale: !!raw.isSale,
    isBestSeller: !!raw.isBestSeller,
    sku: sku,
    createdAt: raw.createdAt || new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString() // offset creation dates
  };
}

// Initialize seed data
function initializeLocalStorage() {
  if (typeof window === 'undefined') {
    // Initialize in-memory
    if (localProducts.length === 0 && Array.isArray(seedProducts)) {
      localProducts = seedProducts.map((p: any, idx: number) => normalizeProduct(p, idx));
      localCoupons = [
        { code: 'GOOD10', discountPercentage: 10, active: true },
        { code: 'STREET15', discountPercentage: 15, active: true },
        { code: 'BIENVENIDA20', discountPercentage: 20, active: true }
      ];
      // Generate some dummy visits
      const today = new Date();
      for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        localVisits.push({
          date: dateStr,
          count: 50 + Math.floor(Math.random() * 150)
        });
      }
    }
    return;
  }

  // Client-side LocalStorage checks
  const storedProd = localStorage.getItem('good_style_products');
  if (storedProd) {
    try {
      localProducts = JSON.parse(storedProd);
    } catch (e) {
      localProducts = [];
    }
  } else if (Array.isArray(seedProducts)) {
    localProducts = seedProducts.map((p: any, idx: number) => normalizeProduct(p, idx));
    localStorage.setItem('good_style_products', JSON.stringify(localProducts));
  }

  const storedRev = localStorage.getItem('good_style_reviews');
  if (storedRev) {
    try { localReviews = JSON.parse(storedRev); } catch(e) {}
  } else {
    localReviews = [
      { id: "rev-1", productId: "aimen-100-ml", author: "Mateo R.", location: "Palermo, CABA", rating: 5, date: "2026-05-12", comment: "Excelente fragancia, muy persistente. Recibí muchos elogios.", verified: true },
      { id: "rev-2", productId: "baggy-black", author: "Sofía G.", location: "Rosario, Santa Fe", rating: 5, date: "2026-06-01", comment: "El denim rígido de este baggy black es espectacular. La horma calza perfecto.", verified: true },
      { id: "rev-3", productId: "boxy-2023", author: "Federico L.", location: "Córdoba Capital", rating: 4, date: "2026-05-28", comment: "El algodón es súper pesado y grueso, calce boxy ideal.", verified: true }
    ];
    localStorage.setItem('good_style_reviews', JSON.stringify(localReviews));
  }

  const storedOrd = localStorage.getItem('good_style_orders');
  if (storedOrd) {
    try { localOrders = JSON.parse(storedOrd); } catch(e) {}
  } else {
    localOrders = [];
  }

  const storedCoup = localStorage.getItem('good_style_coupons');
  if (storedCoup) {
    try { localCoupons = JSON.parse(storedCoup); } catch(e) {}
  } else {
    localCoupons = [
      { code: 'GOOD10', discountPercentage: 10, active: true },
      { code: 'STREET15', discountPercentage: 15, active: true },
      { code: 'BIENVENIDA20', discountPercentage: 20, active: true }
    ];
    localStorage.setItem('good_style_coupons', JSON.stringify(localCoupons));
  }

  const storedVis = localStorage.getItem('good_style_visits');
  if (storedVis) {
    try { localVisits = JSON.parse(storedVis); } catch(e) {}
  } else {
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      localVisits.push({
        date: dateStr,
        count: 50 + Math.floor(Math.random() * 150)
      });
    }
    localStorage.setItem('good_style_visits', JSON.stringify(localVisits));
  }
}

// Perform initialization
initializeLocalStorage();

const saveStateToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- DATA ACCESS METHODS ---

export async function getProducts(): Promise<Product[]> {
  initializeLocalStorage();
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data && data.length > 0) {
      return data;
    }
  }
  return localProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  initializeLocalStorage();
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (!error && data) return data;
  }
  const prod = localProducts.find(p => p.id === id || p.slug === id);
  return prod || null;
}

export async function saveProduct(product: Omit<Product, 'numericId' | 'createdAt'> & { numericId?: number; createdAt?: string }): Promise<Product> {
  initializeLocalStorage();
  const index = localProducts.findIndex(p => p.id === product.id);
  
  const finalProduct: Product = {
    ...normalizeProduct(product, index >= 0 ? index : localProducts.length),
    numericId: product.numericId || (index >= 0 ? localProducts[index].numericId : localProducts.length + 1),
    createdAt: product.createdAt || (index >= 0 ? localProducts[index].createdAt : new Date().toISOString())
  };

  if (supabase) {
    const { error } = await supabase.from('products').upsert(finalProduct);
    if (!error) return finalProduct;
  }

  if (index >= 0) {
    localProducts[index] = finalProduct;
  } else {
    localProducts.unshift(finalProduct);
  }
  saveStateToStorage('good_style_products', localProducts);
  return finalProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  initializeLocalStorage();
  if (supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) return true;
  }
  const index = localProducts.findIndex(p => p.id === id);
  if (index >= 0) {
    localProducts.splice(index, 1);
    saveStateToStorage('good_style_products', localProducts);
    return true;
  }
  return false;
}

export async function getReviews(productId?: string): Promise<Review[]> {
  initializeLocalStorage();
  if (supabase) {
    let query = supabase.from('reviews').select('*');
    if (productId) {
      query = query.eq('productId', productId);
    }
    const { data, error } = await query;
    if (!error && data) return data;
  }
  if (productId) {
    return localReviews.filter(r => r.productId === productId);
  }
  return localReviews;
}

export async function addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
  initializeLocalStorage();
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };

  if (supabase) {
    const { error } = await supabase.from('reviews').insert(newReview);
    // Update product rating if supabase works
  }

  localReviews.unshift(newReview);
  saveStateToStorage('good_style_reviews', localReviews);

  // Recalculate average rating for product locally
  const pId = review.productId;
  const prodReviews = localReviews.filter(r => r.productId === pId);
  const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
  
  const prodIndex = localProducts.findIndex(p => p.id === pId);
  if (prodIndex >= 0) {
    localProducts[prodIndex].rating = parseFloat(avg.toFixed(1));
    localProducts[prodIndex].reviewsCount = prodReviews.length;
    saveStateToStorage('good_style_products', localProducts);
  }

  return newReview;
}

export async function getOrders(): Promise<Order[]> {
  initializeLocalStorage();
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (!error && data) return data;
  }
  return localOrders;
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  initializeLocalStorage();
  const newOrder: Order = {
    ...order,
    id: `GST-ORD-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString()
  };

  // Adjust stock based on ordered quantities
  for (const item of order.items) {
    const prodIndex = localProducts.findIndex(p => p.id === item.productId);
    if (prodIndex >= 0) {
      const prod = localProducts[prodIndex];
      if (prod.stock && prod.stock[item.size] !== undefined) {
        prod.stock[item.size] = Math.max(0, prod.stock[item.size] - item.quantity);
      }
    }
  }
  saveStateToStorage('good_style_products', localProducts);

  if (supabase) {
    const { error } = await supabase.from('orders').insert(newOrder);
    // Suppress errors to ensure the checkout proceeds via local storage if database fails
  }

  localOrders.unshift(newOrder);
  saveStateToStorage('good_style_orders', localOrders);
  return newOrder;
}

export async function getCoupons(): Promise<Coupon[]> {
  initializeLocalStorage();
  if (supabase) {
    const { data, error } = await supabase.from('coupons').select('*');
    if (!error && data) return data;
  }
  return localCoupons;
}

export async function saveCoupon(coupon: Coupon): Promise<Coupon> {
  initializeLocalStorage();
  const index = localCoupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (supabase) {
    await supabase.from('coupons').upsert(coupon);
  }
  if (index >= 0) {
    localCoupons[index] = coupon;
  } else {
    localCoupons.push(coupon);
  }
  saveStateToStorage('good_style_coupons', localCoupons);
  return coupon;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  initializeLocalStorage();
  if (supabase) {
    const { error } = await supabase.from('coupons').delete().eq('code', code);
    if (!error) return true;
  }
  const index = localCoupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (index >= 0) {
    localCoupons.splice(index, 1);
    saveStateToStorage('good_style_coupons', localCoupons);
    return true;
  }
  return false;
}

export async function getVisits(): Promise<{ date: string; count: number }[]> {
  initializeLocalStorage();
  return localVisits;
}

export async function recordVisit(): Promise<void> {
  initializeLocalStorage();
  const todayStr = new Date().toISOString().split('T')[0];
  const visitIndex = localVisits.findIndex(v => v.date === todayStr);
  if (visitIndex >= 0) {
    localVisits[visitIndex].count += 1;
  } else {
    localVisits.push({ date: todayStr, count: 1 });
  }
  saveStateToStorage('good_style_visits', localVisits);
}
