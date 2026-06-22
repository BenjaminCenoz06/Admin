'use client';

import React, { useState, useEffect } from 'react';
import { 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  Product, 
  getOrders, 
  Order, 
  getCoupons, 
  saveCoupon, 
  deleteCoupon, 
  Coupon, 
  getVisits 
} from '@/lib/db';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  Tag, 
  TrendingDown, 
  RefreshCw,
  Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'general' | 'products' | 'coupons'>('general');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [visitsData, setVisitsData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Product CRUD Form States
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('jeans');
  const [prodFormPrice, setProdFormPrice] = useState(0);
  const [prodFormOriginalPrice, setProdFormOriginalPrice] = useState<number | ''>('');
  const [prodFormDescription, setProdFormDescription] = useState('');
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormImages, setProdFormImages] = useState<string[]>([]);
  const [prodFormSizes, setProdFormSizes] = useState<string[]>(['38', '40', '42', '44', '46']);
  const [prodFormStock, setProdFormStock] = useState<Record<string, number>>({});
  const [prodFormBadge, setProdFormBadge] = useState('');
  const [prodFormSku, setProdFormSku] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Try uploading to Supabase Storage if configured
      const { supabase } = await import('@/lib/db');
      if (supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Attempt upload to 'products' bucket
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);
          
          setProdFormImage(publicUrl);
          setProdFormImages([publicUrl]);
          setUploadingImage(false);
          return;
        } else {
          console.warn("Supabase storage upload failed, falling back to Base64", error);
        }
      }
    } catch (err) {
      console.warn("Storage upload error, falling back to Base64:", err);
    }

    // 2. Base64 Fallback
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProdFormImage(base64String);
        setProdFormImages([base64String]);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Base64 conversion failed:", err);
      alert("Error al procesar la imagen.");
      setUploadingImage(false);
    }
  };

  // Coupon Form States
  const [couponFormCode, setCouponFormCode] = useState('');
  const [couponFormDiscount, setCouponFormDiscount] = useState(10);
  const [couponFormActive, setCouponFormActive] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const pList = await getProducts();
      setProducts(pList);
      
      const oList = await getOrders();
      setOrders(oList);

      const cList = await getCoupons();
      setCoupons(cList);

      const vData = await getVisits();
      setVisitsData(vData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // --- STATS CALCULATIONS ---
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = new Date().toISOString().slice(0, 7);

  const ordersToday = orders.filter(o => o.createdAt.startsWith(todayStr));
  const salesToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

  const ordersThisMonth = orders.filter(o => o.createdAt.slice(0, 7) === thisMonthStr);
  const salesThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.total, 0);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  
  // Total client count (unique phone numbers)
  const totalClientsCount = new Set(orders.map(o => o.customerPhone)).size;

  // Out of stock count
  const outOfStockProducts = products.filter(p => {
    const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
    return totalStock === 0;
  });

  // Filter products by adminSearchQuery
  const filteredProducts = products.filter(p => {
    const q = adminSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      (p.categoryDisplay && p.categoryDisplay.toLowerCase().includes(q)) ||
      p.sizes.some(size => size.toLowerCase().includes(q))
    );
  });

  // --- PRODUCT CRUD HANDLERS ---
  const openNewProductForm = () => {
    setIsEditingProduct(true);
    setEditingProductId(null);
    setProdFormName('');
    setProdFormCategory('jeans');
    setProdFormPrice(35000);
    setProdFormOriginalPrice('');
    setProdFormDescription('Prenda de la colección oficial de Good Style. Confeccionada con materiales seleccionados.');
    setProdFormImage('JEAN/baggy-azul-clasico.jpeg');
    setProdFormImages(['JEAN/baggy-azul-clasico.jpeg', 'JEAN/baggy-azul-clasico.jpeg']);
    setProdFormSizes(['38', '40', '42', '44', '46']);
    setProdFormStock({ '38': 5, '40': 3, '42': 0, '44': 2, '46': 4 });
    setProdFormBadge('New');
    setProdFormSku('');
  };

  const openEditProductForm = (p: Product) => {
    setIsEditingProduct(true);
    setEditingProductId(p.id);
    setProdFormName(p.name);
    setProdFormCategory(p.category);
    setProdFormPrice(p.price);
    setProdFormOriginalPrice(p.originalPrice || '');
    setProdFormDescription(p.description);
    setProdFormImage(p.image);
    setProdFormImages(p.images);
    setProdFormSizes(p.sizes);
    setProdFormStock({ ...p.stock });
    setProdFormBadge(p.badge);
    setProdFormSku(p.sku);
  };

  const handleCategoryChange = (cat: string) => {
    setProdFormCategory(cat);
    let sizes = ['S', 'M', 'L', 'XL'];
    let stock: Record<string, number> = { S: 5, M: 5, L: 5, XL: 2 };
    if (cat === 'jeans') {
      sizes = ['38', '40', '42', '44', '46'];
      stock = { '38': 5, '40': 5, '42': 5, '44': 3, '46': 2 };
    } else if (cat === 'gorras' || cat === 'perfumes' || cat === 'accesorios') {
      sizes = ['Único'];
      stock = { 'Único': 10 };
    }
    setProdFormSizes(sizes);
    setProdFormStock(stock);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) return;

    // Generate slug as ID if new
    const slug = prodFormName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = editingProductId || slug;
    
    // Auto sku if blank
    const sku = prodFormSku || `GST-${prodFormCategory.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const productPayload = {
      id,
      name: prodFormName.trim(),
      category: prodFormCategory,
      categoryDisplay: prodFormCategory.charAt(0).toUpperCase() + prodFormCategory.slice(1),
      price: prodFormPrice,
      originalPrice: prodFormOriginalPrice === '' ? null : Number(prodFormOriginalPrice),
      image: prodFormImage,
      images: prodFormImages.length > 0 ? prodFormImages : [prodFormImage],
      sizes: prodFormSizes,
      stock: prodFormStock,
      rating: editingProductId ? (products.find(p => p.id === editingProductId)?.rating || 5) : 5,
      reviewsCount: editingProductId ? (products.find(p => p.id === editingProductId)?.reviewsCount || 0) : 0,
      description: prodFormDescription.trim(),
      features: [
        "Materiales de alta calidad y tacto suave",
        "Corte moderno adaptado al estilo de vida actual",
        "Costuras reforzadas para mayor resistencia"
      ],
      badge: prodFormBadge,
      slug: id,
      isNew: prodFormBadge.toLowerCase() === 'new',
      isSale: prodFormBadge.toLowerCase() === 'sale',
      isBestSeller: prodFormBadge.toLowerCase() === 'bestseller' || prodFormBadge.toLowerCase() === 'best',
      sku
    };

    await saveProduct(productPayload);
    setIsEditingProduct(false);
    loadData();
  };

  const handleDuplicateProduct = async (p: Product) => {
    const duplicatedSlug = `${p.id}-copia-${Math.floor(Math.random() * 100)}`;
    const duplicatedPayload = {
      ...p,
      id: duplicatedSlug,
      name: `${p.name} (Copia)`,
      sku: `GST-${p.category.slice(0,3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      slug: duplicatedSlug,
      createdAt: new Date().toISOString()
    };
    await saveProduct(duplicatedPayload);
    loadData();
  };

  const handleDeleteProductClick = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  // --- COUPON HANDLERS ---
  const handleSaveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponFormCode.trim()) return;

    await saveCoupon({
      code: couponFormCode.trim().toUpperCase(),
      discountPercentage: couponFormDiscount,
      active: couponFormActive
    });
    setCouponFormCode('');
    loadData();
  };

  const handleDeleteCouponClick = async (code: string) => {
    if (confirm(`¿Eliminar cupón ${code}?`)) {
      await deleteCoupon(code);
      loadData();
    }
  };

  return (
    <div>
      
      {/* TABS HEADER */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #EAEAEA',
        marginBottom: '30px',
        gap: '20px'
      }}>
        <button 
          onClick={() => { setActiveTab('general'); setIsEditingProduct(false); }}
          style={{
            padding: '12px 8px',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'general' ? 700 : 500,
            borderBottom: activeTab === 'general' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'general' ? 'var(--primary-color)' : '#666666'
          }}
        >
          Panel General
        </button>
        <button 
          onClick={() => { setActiveTab('products'); }}
          style={{
            padding: '12px 8px',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'products' ? 700 : 500,
            borderBottom: activeTab === 'products' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'products' ? 'var(--primary-color)' : '#666666'
          }}
        >
          Productos ({products.length})
        </button>
        <button 
          onClick={() => { setActiveTab('coupons'); setIsEditingProduct(false); }}
          style={{
            padding: '12px 8px',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'coupons' ? 700 : 500,
            borderBottom: activeTab === 'coupons' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'coupons' ? 'var(--primary-color)' : '#666666'
          }}
        >
          Descuentos y Promos
        </button>

        <button 
          onClick={loadData}
          style={{ marginLeft: 'auto', padding: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#666666' }}
          title="Actualizar datos"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>Cargando panel...</div>
      ) : (
        <>
          
          {/* TAB 1: GENERAL PANEL */}
          {activeTab === 'general' && (
            <div>
              {/* METRICS ROW */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666666', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    <span>Ventas Hoy</span>
                    <DollarSign size={16} color="var(--primary-color)" />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>${salesToday.toLocaleString('es-AR')}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>{ordersToday.length} pedidos hoy</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666666', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    <span>Ventas Mes</span>
                    <TrendingUp size={16} color="var(--primary-color)" />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>${salesThisMonth.toLocaleString('es-AR')}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>Mes en curso</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666666', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    <span>Ingresos Totales</span>
                    <DollarSign size={16} color="var(--primary-color)" />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>${totalRevenue.toLocaleString('es-AR')}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>{totalOrdersCount} pedidos procesados</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666666', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    <span>Productos sin Stock</span>
                    <AlertTriangle size={16} color={outOfStockProducts.length > 0 ? '#FF4D4D' : '#666666'} />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: outOfStockProducts.length > 0 ? '#FF4D4D' : '#111111' }}>
                    {outOfStockProducts.length}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>Requieren reposición</span>
                </div>
              </div>

              {/* CHARTS CONTAINER */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '30px',
                marginBottom: '40px'
              }} className="charts-grid">
                
                {/* Visits Line Chart */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '30px', height: '360px' }}>
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Tráfico Web (Últimos 30 días)</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={visitsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" name="Visitas" stroke="var(--primary-color)" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Orders Overview */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '30px' }}>
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Últimos Pedidos Recibidos</h3>
                  
                  {orders.length === 0 ? (
                    <p style={{ color: '#888888', fontStyle: 'italic', padding: '20px 0' }}>No se han recibido pedidos aún.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F5F5', paddingBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{ord.customerName} ({ord.id})</h4>
                            <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                              {ord.items.length} prendas • Pago: {ord.paymentMethod} • Envío: {ord.shippingMethod}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                              ${ord.total.toLocaleString('es-AR')}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#999999', marginTop: '2px' }}>
                              {new Date(ord.createdAt).toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* CLIENT LIST */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '30px' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Registro de Clientes ({totalClientsCount} únicos)</h3>
                
                {orders.length === 0 ? (
                  <p style={{ color: '#888888', fontStyle: 'italic' }}>Sin registros de clientes.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #EAEAEA' }}>
                        <th style={{ padding: '12px' }}>Nombre</th>
                        <th style={{ padding: '12px' }}>WhatsApp / Tel</th>
                        <th style={{ padding: '12px' }}>Email</th>
                        <th style={{ padding: '12px' }}>Último Pedido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set(orders.map(o => o.customerPhone))).map(phone => {
                        const clientOrder = orders.find(o => o.customerPhone === phone);
                        if (!clientOrder) return null;
                        return (
                          <tr key={phone} style={{ borderBottom: '1px solid #F5F5F5' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{clientOrder.customerName}</td>
                            <td style={{ padding: '12px' }}>{phone}</td>
                            <td style={{ padding: '12px' }}>{clientOrder.customerEmail}</td>
                            <td style={{ padding: '12px', color: '#666666' }}>{new Date(clientOrder.createdAt).toLocaleDateString('es-AR')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCT CRUD MANAGEMENT */}
          {activeTab === 'products' && (
            <div>
              {isEditingProduct ? (
                /* PRODUCT FORM */
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '30px', maxWidth: '800px' }}>
                  <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '24px' }}>
                    {editingProductId ? `Editar Producto` : 'Nuevo Producto'}
                  </h3>

                  <form onSubmit={handleSaveProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Nombre del Producto *</label>
                        <input 
                          type="text" 
                          required 
                          value={prodFormName}
                          onChange={(e) => setProdFormName(e.target.value)}
                          placeholder="Ej: Baggy Black Recortes"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Categoría</label>
                        <select 
                          value={prodFormCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                        >
                          <option value="jeans">Jeans</option>
                          <option value="remeras">Remeras</option>
                          <option value="buzos">Buzos</option>
                          <option value="camperas">Camperas</option>
                          <option value="accesorios">Accesorios</option>
                          <option value="perfumes">Perfumes</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Precio ($) *</label>
                        <input 
                          type="number" 
                          required 
                          value={prodFormPrice}
                          onChange={(e) => setProdFormPrice(Number(e.target.value))}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Precio Original (Opcional, para Descuento)</label>
                        <input 
                          type="number" 
                          value={prodFormOriginalPrice}
                          onChange={(e) => setProdFormOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Ej: 60000"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>SKU (Opcional, auto-generado si vacío)</label>
                      <input 
                        type="text" 
                        value={prodFormSku}
                        onChange={(e) => setProdFormSku(e.target.value)}
                        placeholder="Ej: GST-BAGGY-001"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                      />
                    </div>

                    <div>
                      <div style={{ border: '1px dashed #CCCCCC', padding: '20px', borderRadius: '4px', backgroundColor: '#F9F9F9', textAlign: 'center' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Imagen de la Prenda *</label>
                        
                        {/* Image Preview */}
                        {prodFormImage && (
                          <div style={{ marginBottom: '15px', display: 'inline-block', position: 'relative' }}>
                            <img 
                              src={prodFormImage} 
                              alt="Vista previa" 
                              style={{ maxWidth: '120px', maxHeight: '160px', objectFit: 'cover', border: '1px solid #EAEAEA', borderRadius: '4px' }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                              }}
                            />
                            <button 
                              type="button" 
                              onClick={() => { setProdFormImage(''); setProdFormImages([]); }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: '#FF4D4D',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700
                              }}
                              title="Eliminar imagen"
                            >
                              X
                            </button>
                          </div>
                        )}

                        {/* File Upload Input */}
                        <div style={{ marginBottom: '15px' }}>
                          <input 
                            type="file" 
                            id="file-upload" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          <label 
                            htmlFor="file-upload"
                            style={{
                              display: 'inline-block',
                              padding: '10px 20px',
                              backgroundColor: '#111111',
                              color: '#FFFFFF',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            {uploadingImage ? 'Procesando...' : (prodFormImage ? 'Cambiar Imagen' : 'Seleccionar Imagen del Dispositivo')}
                          </label>
                        </div>

                        {/* URL input fallback (collapsible) */}
                        <details style={{ textAlign: 'left', marginTop: '10px' }}>
                          <summary style={{ fontSize: '0.75rem', color: '#666666', cursor: 'pointer', outline: 'none' }}>
                            O ingresar URL/ruta de imagen manualmente
                          </summary>
                          <div style={{ marginTop: '8px' }}>
                            <input 
                              type="text" 
                              value={prodFormImage}
                              onChange={(e) => {
                                setProdFormImage(e.target.value);
                                setProdFormImages([e.target.value]);
                              }}
                              placeholder="Ej: JEAN/baggy-black.jpeg o URL externa"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem', border: '1px solid #EAEAEA', borderRadius: '4px', color: '#111111' }}
                            />
                          </div>
                        </details>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Descripción</label>
                      <textarea 
                        rows={3} 
                        value={prodFormDescription}
                        onChange={(e) => setProdFormDescription(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', resize: 'vertical' }}
                      />
                    </div>

                    {/* SIZE SPECIFIC STOCK CONTROL */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Control de Stock por Talle</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                        {prodFormSizes.map((sz) => (
                          <div key={sz} style={{ border: '1px solid #EAEAEA', padding: '10px', backgroundColor: '#F8F8F8', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Talle {sz}</span>
                            <input 
                              type="number" 
                              min="0"
                              value={prodFormStock[sz] || 0}
                              onChange={(e) => setProdFormStock({
                                ...prodFormStock,
                                [sz]: Math.max(0, Number(e.target.value))
                              })}
                              style={{ width: '100%', padding: '6px', border: '1px solid #CCCCCC', textAlign: 'center', fontSize: '0.85rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Destacado / Etiqueta</label>
                      <select 
                        value={prodFormBadge} 
                        onChange={(e) => setProdFormBadge(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                      >
                        <option value="">Ninguno</option>
                        <option value="New">Nuevo (New)</option>
                        <option value="Sale">Oferta (Sale)</option>
                        <option value="Best">Más Vendido</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '14px 28px' }}>Guardar Prenda</button>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProduct(false)}
                        className="btn-outline" 
                        style={{ padding: '14px 28px' }}
                      >
                        Cancelar
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                /* PRODUCTS LISTING TABLE */
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '24px',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', margin: 0 }}>Listado de Prendas</h3>
                      <div style={{ position: 'relative', minWidth: '280px', flexGrow: 0.5 }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888888', display: 'flex', alignItems: 'center' }}>
                          <Search size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder="Buscar por nombre, SKU, talle o categoría..."
                          value={adminSearchQuery}
                          onChange={(e) => setAdminSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            fontSize: '0.88rem',
                            border: '1px solid #EAEAEA',
                            borderRadius: '4px',
                            backgroundColor: '#F8F8F8',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            color: '#111111'
                          }}
                        />
                        {adminSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setAdminSearchQuery('')}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#888888',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>
                    <button onClick={openNewProductForm} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      <Plus size={16} /> Nueva Prenda
                    </button>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #EAEAEA', backgroundColor: '#F8F8F8' }}>
                          <th style={{ padding: '14px' }}>SKU</th>
                          <th style={{ padding: '14px' }}>Prenda</th>
                          <th style={{ padding: '14px' }}>Categoría</th>
                          <th style={{ padding: '14px' }}>Precio</th>
                          <th style={{ padding: '14px' }}>Stock por Talle</th>
                          <th style={{ padding: '14px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#888888', fontStyle: 'italic' }}>
                              No se encontraron prendas que coincidan con la búsqueda.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((p) => {
                            const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
                            return (
                              <tr key={p.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                                <td style={{ padding: '14px', fontWeight: 600, color: '#666666' }}>{p.sku}</td>
                                <td style={{ padding: '14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '36px', height: '48px', position: 'relative', border: '1px solid #EAEAEA' }}>
                                      <img 
                                        src={p.image.startsWith('/') ? p.image : `/${p.image}`} 
                                        alt="" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                                        }}
                                      />
                                    </div>
                                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px', textTransform: 'capitalize' }}>{p.category}</td>
                                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary-color)' }}>
                                  ${p.price.toLocaleString('es-AR')}
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {Object.entries(p.stock || {}).map(([sz, stockCount]) => (
                                      <span 
                                        key={sz} 
                                        style={{
                                          fontSize: '0.75rem',
                                          padding: '2px 6px',
                                          backgroundColor: stockCount === 0 ? '#FCE8E6' : '#EAEAEA',
                                          color: stockCount === 0 ? '#C5221F' : '#333333',
                                          border: '1px solid #DDDDDD'
                                        }}
                                      >
                                        {sz}: {stockCount}
                                      </span>
                                    ))}
                                    {totalStock === 0 && (
                                      <span style={{ fontSize: '0.72rem', color: '#C5221F', fontWeight: 700 }}>SIN STOCK TOTAL</span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button onClick={() => openEditProductForm(p)} title="Editar" style={{ color: '#111111' }}>
                                      <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDuplicateProduct(p)} title="Duplicar" style={{ color: '#666666' }}>
                                      <Copy size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteProductClick(p.id)} title="Eliminar" style={{ color: '#FF4D4D' }}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMOTIONS & COUPONS */}
          {activeTab === 'coupons' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="coupons-layout">
              {/* Left Form */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '30px' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Crear Cupón de Descuento</h3>
                
                <form onSubmit={handleSaveCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Código del Cupón *</label>
                    <input 
                      type="text" 
                      required 
                      value={couponFormCode}
                      onChange={(e) => setCouponFormCode(e.target.value)}
                      placeholder="Ej: OFF20"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', textTransform: 'uppercase' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Porcentaje de Descuento (%) *</label>
                    <input 
                      type="number" 
                      min="5"
                      max="95"
                      required 
                      value={couponFormDiscount}
                      onChange={(e) => setCouponFormDiscount(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="coupon-active"
                      checked={couponFormActive}
                      onChange={(e) => setCouponFormActive(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                    />
                    <label htmlFor="coupon-active" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Activo</label>
                  </div>

                  <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
                    Crear Cupón
                  </button>
                </form>
              </div>

              {/* Right Table */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA', padding: '30px' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Cupones Activos</h3>
                
                {coupons.length === 0 ? (
                  <p style={{ color: '#888888', fontStyle: 'italic' }}>No hay cupones configurados.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #EAEAEA' }}>
                        <th style={{ padding: '12px' }}>Código</th>
                        <th style={{ padding: '12px' }}>Descuento</th>
                        <th style={{ padding: '12px' }}>Estado</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.code} style={{ borderBottom: '1px solid #F5F5F5' }}>
                          <td style={{ padding: '12px', fontWeight: 700 }}>{c.code}</td>
                          <td style={{ padding: '12px', color: 'var(--primary-color)', fontWeight: 600 }}>{c.discountPercentage}% OFF</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              backgroundColor: c.active ? '#E6F4EA' : '#F5F5F5',
                              color: c.active ? '#137333' : '#666666',
                              fontWeight: 600
                            }}>
                              {c.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button onClick={() => handleDeleteCouponClick(c.code)} style={{ color: '#FF4D4D' }} title="Eliminar cupón">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
}
