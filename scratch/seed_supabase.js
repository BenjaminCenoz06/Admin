const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables if any
let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback to reading .env.local or .env
const envPaths = [
  path.join(__dirname, '../.env.local'),
  path.join(__dirname, '../.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
      if (match) {
        const k = match[1];
        let v = match[2] || '';
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
        if (k === 'NEXT_PUBLIC_SUPABASE_URL') url = v.trim();
        if (k === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') key = v.trim();
      }
    });
  }
}

// Fallback to command line arguments
if (!url && process.argv[2]) url = process.argv[2];
if (!key && process.argv[3]) key = process.argv[3];

if (!url || !key) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  console.log('Usage: node seed_supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log('Reading products.js...');
  const productsFilePath = path.join(__dirname, '../src/data/products.js');
  const fileContent = fs.readFileSync(productsFilePath, 'utf8');

  // Extract array
  const startIndex = fileContent.indexOf('[');
  const endIndex = fileContent.lastIndexOf(']');
  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not parse products array from file.');
    process.exit(1);
  }

  const arrayContent = fileContent.substring(startIndex, endIndex + 1);
  
  let products;
  try {
    // Parse using eval since it's a JS file content representing JS array literal
    products = eval(arrayContent);
  } catch (err) {
    console.error('Failed to parse products array:', err);
    process.exit(1);
  }

  console.log(`Parsed ${products.length} products. Seeding to Supabase...`);

  // Transform products to match the database schema
  const transformedProducts = products.map((p, idx) => {
    // Distribute stock to JSON format: size -> stock
    const category = p.category || 'jeans';
    const sizes = p.sizes || (category === 'jeans' ? ['38', '40', '42', '44', '46'] : ['S', 'M', 'L', 'XL']);
    
    let sizeStock = {};
    if (typeof p.stock === 'object' && p.stock !== null) {
      sizeStock = p.stock;
    } else {
      const stockVal = typeof p.stock === 'number' ? p.stock : 10;
      sizes.forEach((s, i) => {
        sizeStock[s] = i === 0 ? Math.max(1, stockVal - 2) : Math.max(0, Math.floor(stockVal / sizes.length));
      });
    }

    const sku = p.sku || `GST-${category.slice(0, 3).toUpperCase()}-${String(p.numericId || idx + 1).padStart(3, '0')}`;

    return {
      id: p.id || p.slug || `product-${idx}`,
      name: p.name || 'Producto sin nombre',
      category: category,
      categoryDisplay: p.categoryDisplay || (category.charAt(0).toUpperCase() + category.slice(1)),
      price: p.price || 0,
      originalPrice: p.originalPrice || null,
      image: p.image || '',
      images: JSON.stringify(Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || '']),
      sizes: JSON.stringify(sizes),
      stock: JSON.stringify(sizeStock),
      rating: p.rating || 5,
      reviewsCount: p.reviewsCount || 0,
      description: p.description || 'Prenda de la colección oficial de Good Style.',
      features: JSON.stringify(Array.isArray(p.features) ? p.features : [
        "Materiales de alta calidad y tacto suave",
        "Corte moderno adaptado al estilo de vida actual",
        "Costuras reforzadas para mayor resistencia"
      ]),
      badge: p.badge || '',
      slug: p.slug || p.id || `product-${idx}`,
      isNew: !!p.isNew,
      isSale: !!p.isSale,
      isBestSeller: !!p.isBestSeller,
      sku: sku,
      createdAt: p.createdAt || new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString()
    };
  });

  // Batch insert/upsert in chunks to prevent payload limit issues
  const chunkSize = 20;
  for (let i = 0; i < transformedProducts.length; i += chunkSize) {
    const chunk = transformedProducts.slice(i, i + chunkSize);
    console.log(`Uploading chunk ${i / chunkSize + 1} of ${Math.ceil(transformedProducts.length / chunkSize)}...`);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error('Error inserting chunk:', error);
    }
  }

  // Seed initial coupons
  const initialCoupons = [
    { code: 'GOOD10', discountPercentage: 10, active: true },
    { code: 'STREET15', discountPercentage: 15, active: true },
    { code: 'BIENVENIDA20', discountPercentage: 20, active: true }
  ];
  console.log('Seeding initial coupons...');
  const { error: couponError } = await supabase.from('coupons').upsert(initialCoupons, { onConflict: 'code' });
  if (couponError) {
    console.error('Error seeding coupons:', couponError);
  }

  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Unhandled error in seed script:', err);
});
