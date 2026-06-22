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

// In-Memory Storage / Local fallback for development when Supabase is not configured
let localProducts: Product[] = [];
let localReviews: Review[] = [];
let localOrders: Order[] = [];
let localCoupons: Coupon[] = [];
let localVisits: { date: string; count: number }[] = [];

// Helper to safely parse JSON returned as text/string from Supabase
function parseJsonField(field: any): any {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      console.error("Failed to parse JSON field:", field, e);
      return field;
    }
  }
  return field;
}

// Helper to normalize product
function normalizeProduct(raw: any, index: number = 0): Product {
  const category = raw.category || 'jeans';
  
  // Safe JSON extraction
  const rawSizes = parseJsonField(raw.sizes);
  const sizes = Array.isArray(rawSizes) ? rawSizes : (category === 'jeans' ? ['38', '40', '42', '44', '46'] : ['S', 'M', 'L', 'XL']);
  
  let sizeStock: Record<string, number> = {};
  const rawStock = parseJsonField(raw.stock);
  if (typeof rawStock === 'object' && rawStock !== null) {
    sizeStock = rawStock;
  } else {
    const stockVal = typeof rawStock === 'number' ? rawStock : 10;
    sizes.forEach((s: string, idx: number) => {
      sizeStock[s] = idx === 0 ? Math.max(1, stockVal - 2) : Math.max(0, Math.floor(stockVal / sizes.length));
    });
  }

  const sku = raw.sku || `GST-${category.slice(0, 3).toUpperCase()}-${String(raw.numericId || index + 1).padStart(3, '0')}`;
  const rawImages = parseJsonField(raw.images);

  return {
    id: raw.id || raw.slug || `product-${index}`,
    numericId: raw.numericId || index + 1,
    name: raw.name || 'Producto sin nombre',
    category: category,
    categoryDisplay: raw.categoryDisplay || (category.charAt(0).toUpperCase() + category.slice(1)),
    price: raw.price || 0,
    originalPrice: raw.originalPrice || null,
    image: raw.image || '',
    images: Array.isArray(rawImages) && rawImages.length > 0 ? rawImages : [raw.image || ''],
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
    createdAt: raw.createdAt || new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Initialize seed data for fallback
function initializeFallbackData() {
  if (localProducts.length === 0 && Array.isArray(seedProducts)) {
    localProducts = seedProducts.map((p: any, idx: number) => normalizeProduct(p, idx));
    localCoupons = [
      { code: 'GOOD10', discountPercentage: 10, active: true },
      { code: 'STREET15', discountPercentage: 15, active: true },
      { code: 'BIENVENIDA20', discountPercentage: 20, active: true }
    ];
    localReviews = [
      { id: "rev-1", productId: "aimen-100-ml", author: "Mateo R.", location: "Palermo, CABA", rating: 5, date: "2026-05-12", comment: "Excelente fragancia, muy persistente. Recibí muchos elogios.", verified: true },
      { id: "rev-2", productId: "baggy-black", author: "Sofía G.", location: "Rosario, Santa Fe", rating: 5, date: "2026-06-01", comment: "El denim rígido de este baggy black es espectacular. La horma calza perfecto.", verified: true },
      { id: "rev-3", productId: "boxy-2023", author: "Federico L.", location: "Córdoba Capital", rating: 4, date: "2026-05-28", comment: "El algodón es súper pesado y grueso, calce boxy ideal.", verified: true }
    ];
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
}

// Perform fallback initialization
initializeFallbackData();

// --- DATA ACCESS METHODS (DIRECT SUPABASE OPERATION WITH NO LOCALSTORAGE FALLBACK) ---

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error("Error fetching products from Supabase:", error);
      throw error;
    }
    return (data || []).map(p => ({
      ...p,
      images: parseJsonField(p.images),
      sizes: parseJsonField(p.sizes),
      stock: parseJsonField(p.stock),
      features: parseJsonField(p.features)
    }));
  }
  return localProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error("Error fetching product by ID from Supabase:", error);
      throw error;
    }
    if (data) {
      return {
        ...data,
        images: parseJsonField(data.images),
        sizes: parseJsonField(data.sizes),
        stock: parseJsonField(data.stock),
        features: parseJsonField(data.features)
      };
    }
    return null;
  }
  const prod = localProducts.find(p => p.id === id || p.slug === id);
  return prod || null;
}

export async function saveProduct(product: Omit<Product, 'numericId' | 'createdAt'> & { numericId?: number; createdAt?: string }): Promise<Product> {
  let existingProduct: Product | null = null;
  if (supabase) {
    const { data } = await supabase.from('products').select('numericId, createdAt').eq('id', product.id).maybeSingle();
    if (data) {
      existingProduct = data as any;
    }
  }

  const index = localProducts.findIndex(p => p.id === product.id);
  const finalNumericId = existingProduct?.numericId || product.numericId || (index >= 0 ? localProducts[index].numericId : localProducts.length + 1);
  const finalCreatedAt = existingProduct?.createdAt || product.createdAt || (index >= 0 ? localProducts[index].createdAt : new Date().toISOString());

  const finalProduct: Product = {
    ...normalizeProduct(product, index >= 0 ? index : localProducts.length),
    numericId: finalNumericId,
    createdAt: finalCreatedAt
  };

  if (supabase) {
    // Send arrays/objects directly as JS types for JSONB columns
    const { error } = await supabase.from('products').upsert(finalProduct);
    if (error) {
      console.error("Error saving product to Supabase:", error);
      throw error;
    }
    return finalProduct;
  }

  // Fallback (for local development only if Supabase not configured)
  if (index >= 0) {
    localProducts[index] = finalProduct;
  } else {
    localProducts.unshift(finalProduct);
  }
  return finalProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Error deleting product from Supabase:", error);
      throw error;
    }
    return true;
  }
  const index = localProducts.findIndex(p => p.id === id);
  if (index >= 0) {
    localProducts.splice(index, 1);
    return true;
  }
  return false;
}

export async function getReviews(productId?: string): Promise<Review[]> {
  if (supabase) {
    try {
      let query = supabase.from('reviews').select('*');
      if (productId) {
        query = query.eq('productId', productId);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error getting reviews from Supabase, falling back to local:", error);
        return productId ? localReviews.filter(r => r.productId === productId) : localReviews;
      }
      if (data && data.length > 0) {
        return data;
      }
      // If table is empty, fall back to local seed reviews
      return productId ? localReviews.filter(r => r.productId === productId) : localReviews;
    } catch (err) {
      console.error("Exception fetching reviews, falling back to local:", err);
      return productId ? localReviews.filter(r => r.productId === productId) : localReviews;
    }
  }
  if (productId) {
    return localReviews.filter(r => r.productId === productId);
  }
  return localReviews;
}

export async function addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };

  if (supabase) {
    const { error } = await supabase.from('reviews').insert(newReview);
    if (error) {
      console.error("Error adding review to Supabase:", error);
      throw error;
    }
    
    // Update product rating average & reviews count
    const { data: prodReviews, error: revError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('productId', review.productId);

    if (!revError && prodReviews && prodReviews.length > 0) {
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      await supabase
        .from('products')
        .update({ 
          rating: parseFloat(avg.toFixed(1)), 
          reviewsCount: prodReviews.length 
        })
        .eq('id', review.productId);
    }
    return newReview;
  }

  // Fallback
  localReviews.unshift(newReview);
  const pId = review.productId;
  const prodReviews = localReviews.filter(r => r.productId === pId);
  const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
  const prodIndex = localProducts.findIndex(p => p.id === pId);
  if (prodIndex >= 0) {
    localProducts[prodIndex].rating = parseFloat(avg.toFixed(1));
    localProducts[prodIndex].reviewsCount = prodReviews.length;
  }
  return newReview;
}

export async function getOrders(): Promise<Order[]> {
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (error) {
      console.error("Error getting orders from Supabase:", error);
      throw error;
    }
    return (data || []).map(o => ({
      ...o,
      items: parseJsonField(o.items)
    }));
  }
  return localOrders;
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `GST-ORD-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    const { error } = await supabase.from('orders').insert(newOrder);
    if (error) {
      console.error("Error adding order to Supabase:", error);
      throw error;
    }

    // Decrement stock in Supabase for each ordered item size
    for (const item of order.items) {
      const { data: prod, error: getError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .maybeSingle();

      if (!getError && prod && prod.stock) {
        const stockRecord = parseJsonField(prod.stock);
        if (stockRecord && stockRecord[item.size] !== undefined) {
          stockRecord[item.size] = Math.max(0, stockRecord[item.size] - item.quantity);
          await supabase
            .from('products')
            .update({ stock: stockRecord })
            .eq('id', item.productId);
        }
      }
    }
    return newOrder;
  }

  // Fallback
  for (const item of order.items) {
    const prodIndex = localProducts.findIndex(p => p.id === item.productId);
    if (prodIndex >= 0) {
      const prod = localProducts[prodIndex];
      if (prod.stock && prod.stock[item.size] !== undefined) {
        prod.stock[item.size] = Math.max(0, prod.stock[item.size] - item.quantity);
      }
    }
  }
  localOrders.unshift(newOrder);
  return newOrder;
}

export async function getCoupons(): Promise<Coupon[]> {
  if (supabase) {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) {
      console.error("Error getting coupons from Supabase:", error);
      throw error;
    }
    return data || [];
  }
  return localCoupons;
}

export async function saveCoupon(coupon: Coupon): Promise<Coupon> {
  if (supabase) {
    const { error } = await supabase.from('coupons').upsert(coupon);
    if (error) {
      console.error("Error saving coupon to Supabase:", error);
      throw error;
    }
    return coupon;
  }
  const index = localCoupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (index >= 0) {
    localCoupons[index] = coupon;
  } else {
    localCoupons.push(coupon);
  }
  return coupon;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from('coupons').delete().eq('code', code);
    if (error) {
      console.error("Error deleting coupon from Supabase:", error);
      throw error;
    }
    return true;
  }
  const index = localCoupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (index >= 0) {
    localCoupons.splice(index, 1);
    return true;
  }
  return false;
}

// --- SETTINGS AND VISITS MANAGEMENT ---

export async function getSettings(): Promise<Record<string, any>> {
  if (supabase) {
    const { data, error } = await supabase.from('settings').select('*');
    if (!error && data) {
      const settingsMap: Record<string, any> = {};
      data.forEach((row: any) => {
        settingsMap[row.key] = row.value;
      });
      return settingsMap;
    }
  }
  return {};
}

export async function saveSetting(key: string, value: any): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('settings').upsert({ key, value });
    if (error) {
      console.error("Error saving setting to Supabase:", error);
      throw error;
    }
  }
}

export async function getVisits(): Promise<{ date: string; count: number }[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'visits_data')
      .maybeSingle();
    if (!error && data && data.value) {
      return parseJsonField(data.value);
    }
  }
  return localVisits;
}

export async function recordVisit(): Promise<void> {
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (supabase) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'visits_data')
      .maybeSingle();
    
    let visits = [];
    if (!error && data && data.value) {
      visits = parseJsonField(data.value);
    } else {
      initializeFallbackData();
      visits = [...localVisits];
    }
    
    const visitIndex = visits.findIndex((v: any) => v.date === todayStr);
    if (visitIndex >= 0) {
      visits[visitIndex].count += 1;
    } else {
      visits.push({ date: todayStr, count: 1 });
    }
    
    await supabase.from('settings').upsert({ key: 'visits_data', value: visits });
    return;
  }

  // Fallback
  initializeFallbackData();
  const visitIndex = localVisits.findIndex(v => v.date === todayStr);
  if (visitIndex >= 0) {
    localVisits[visitIndex].count += 1;
  } else {
    localVisits.push({ date: todayStr, count: 1 });
  }
}
