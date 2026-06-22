const { createClient } = require('@supabase/supabase-js');

const url = 'https://hapxcgcmxehbsqbswqkg.supabase.co';
const key = 'sb_publishable_WD5lwSazzpSlNO-XlwiuAw_gIFKwSGl';
const supabase = createClient(url, key);

async function run() {
  const { data: list } = await supabase.from('products').select('*').limit(1);
  const p = list[0];
  console.log("Product ID:", p.id);
  console.log("sizes type:", typeof p.sizes, Array.isArray(p.sizes) ? "is Array" : "not Array", p.sizes);
  console.log("images type:", typeof p.images, Array.isArray(p.images) ? "is Array" : "not Array", p.images);
  console.log("stock type:", typeof p.stock, p.stock);
  console.log("features type:", typeof p.features, Array.isArray(p.features) ? "is Array" : "not Array", p.features);
}

run();
