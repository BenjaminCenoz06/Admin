const { createClient } = require('@supabase/supabase-js');

const url = 'https://hapxcgcmxehbsqbswqkg.supabase.co';
const key = 'sb_publishable_WD5lwSazzpSlNO-XlwiuAw_gIFKwSGl';
const supabase = createClient(url, key);

async function run() {
  const productId = 'ameerat-al-arab-ara-100-ml';
  console.log("Fetching product before...");
  let { data: pBefore } = await supabase.from('products').select('price').eq('id', productId).single();
  console.log("Price before:", pBefore.price);

  const newPrice = pBefore.price + 1;
  console.log("Updating to new price:", newPrice);
  
  const { error } = await supabase.from('products').upsert({ id: productId, price: newPrice });
  if (error) {
    console.error("Upsert Error:", error);
    return;
  }

  console.log("Fetching product after...");
  let { data: pAfter } = await supabase.from('products').select('price').eq('id', productId).single();
  console.log("Price after:", pAfter.price);
}

run();
