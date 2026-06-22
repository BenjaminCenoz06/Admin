const { createClient } = require('@supabase/supabase-js');

const url = 'https://hapxcgcmxehbsqbswqkg.supabase.co';
const key = 'sb_publishable_WD5lwSazzpSlNO-XlwiuAw_gIFKwSGl';
const supabase = createClient(url, key);

function normalizeProduct(raw, index = 0) {
  const category = raw.category || 'jeans';
  const sizes = raw.sizes || (category === 'jeans' ? ['38', '40', '42', '44', '46'] : ['S', 'M', 'L', 'XL']);
  
  let sizeStock = {};
  if (typeof raw.stock === 'object' && raw.stock !== null) {
    sizeStock = raw.stock;
  } else {
    const stockVal = typeof raw.stock === 'number' ? raw.stock : 10;
    sizes.forEach((s, idx) => {
      sizeStock[s] = idx === 0 ? Math.max(1, stockVal - 2) : Math.max(0, Math.floor(stockVal / sizes.length));
    });
  }

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
      "Costuras reforzadas para mayor resistance"
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

async function run() {
  console.log("Fetching first product...");
  const { data: list, error: getError } = await supabase.from('products').select('*').limit(1);
  if (getError) {
    console.error("Get Error:", getError);
    return;
  }
  if (!list || list.length === 0) {
    console.log("No products in DB.");
    return;
  }

  const original = list[0];
  const productId = original.id;
  console.log("Found product:", productId, "Original price:", original.price);
  const newPrice = original.price + 10;
  console.log("Simulating payload with new price:", newPrice);

  const productPayload = {
    id: original.id,
    name: original.name,
    category: original.category,
    categoryDisplay: original.categoryDisplay,
    price: newPrice,
    originalPrice: original.originalPrice,
    image: original.image,
    images: original.images,
    sizes: original.sizes,
    stock: original.stock,
    rating: original.rating,
    reviewsCount: original.reviewsCount,
    description: original.description,
    features: original.features,
    badge: original.badge,
    slug: original.slug,
    isNew: original.isNew,
    isSale: original.isSale,
    isBestSeller: original.isBestSeller,
    sku: original.sku
  };

  const finalProduct = {
    ...normalizeProduct(productPayload, 116),
    numericId: productPayload.numericId || 117,
    createdAt: productPayload.createdAt || new Date().toISOString()
  };

  console.log("Saving via upsert...");
  const { error: upsertError } = await supabase.from('products').upsert(finalProduct);
  if (upsertError) {
    console.error("Upsert Error:", upsertError);
  } else {
    console.log("Upsert Succeeded!");
    const { data: updated } = await supabase.from('products').select('*').eq('id', productId).single();
    console.log("Updated price in DB:", updated.price);
  }
}

run();
