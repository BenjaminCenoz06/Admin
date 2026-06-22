'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getCoupons, Coupon, addOrder } from '@/lib/db';
import { Trash2, ShoppingBag, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shippingMethod, setShippingMethod] = useState('Correo Argentino');
  const [paymentMethod, setPaymentMethod] = useState('Mercado Pago');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const list = await getCoupons();
        setCoupons(list);
      } catch (e) {
        console.error(e);
      }
    }
    loadCoupons();
  }, []);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess(false);
    if (!couponCode.trim()) return;

    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
    if (found) {
      setActiveCoupon(found);
      setCouponSuccess(true);
    } else {
      setActiveCoupon(null);
      setCouponError('Cupón inválido o expirado.');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponCode('');
    setCouponSuccess(false);
    setCouponError('');
  };

  const subtotal = getCartTotal();
  const discountAmount = activeCoupon ? Math.round(subtotal * (activeCoupon.discountPercentage / 100)) : 0;
  const finalTotal = subtotal - discountAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Por favor, completa todos los datos obligatorios.');
      return;
    }

    try {
      setCheckoutLoading(true);

      // Save order in db (local storage database fallback)
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        size: item.size,
        quantity: item.quantity,
        image: item.product.image
      }));

      await addOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        shippingMethod,
        paymentMethod,
        items: orderItems,
        total: finalTotal
      });

      // Format WhatsApp Message
      let itemsListText = '';
      cart.forEach((item, idx) => {
        itemsListText += `${idx + 1}. ${item.product.name} [Talle: ${item.size}] (x${item.quantity}) - $${(item.product.price * item.quantity).toLocaleString('es-AR')}\n`;
      });

      const message = `🛍️ *NUEVO PEDIDO - GOOD STYLE* 🛍️\n\n` +
        `👤 *Cliente:* ${name.trim()}\n` +
        `📞 *Teléfono:* ${phone.trim()}\n` +
        `📧 *Email:* ${email.trim()}\n\n` +
        `📦 *Prendas:*\n${itemsListText}\n` +
        (activeCoupon ? `🏷️ *Cupón Aplicado:* ${activeCoupon.code} (${activeCoupon.discountPercentage}% OFF)\n` : '') +
        `💳 *Método de Pago:* ${paymentMethod}\n` +
        `🚚 *Método de Envío:* ${shippingMethod}\n\n` +
        `💰 *TOTAL COMPRA:* $${finalTotal.toLocaleString('es-AR')}\n\n` +
        `¡Hola Good Style! Acabo de finalizar mi pedido en la web, aguardo confirmación para realizar el pago.`;

      const whatsappUrl = `https://wa.me/5493786411223?text=${encodeURIComponent(message)}`;
      
      // Clear shopping cart
      clearCart();
      
      // Redirect
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al procesar el pedido. Intentá de nuevo.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <ShoppingBag size={64} style={{ color: '#CCCCCC', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '1.6rem', textTransform: 'uppercase', marginBottom: '12px' }}>Tu Carrito está vacío</h2>
          <p style={{ fontSize: '0.95rem', color: '#666666', marginBottom: '32px' }}>Explorá nuestro catálogo de remeras, jeans baggy y buzos para armar tu look streetwear.</p>
          <Link href="/catalog" className="btn-secondary" style={{ display: 'block' }}>Ver prendas</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '36px', borderBottom: '1px solid #EAEAEA', paddingBottom: '16px' }}>
          Mi Carrito
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px'
        }} className="cart-layout">
          
          {/* LEFT: PRODUCTS LIST & COUPONS */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
              {cart.map((item) => (
                <div 
                  key={`${item.product.id}-${item.size}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #EAEAEA',
                    padding: '16px',
                    gap: '16px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {/* Photo */}
                  <div style={{ width: '80px', height: '107px', position: 'relative', flexShrink: 0, border: '1px solid #EAEAEA' }}>
                    <img 
                      src={(item.product.image.startsWith('http') || item.product.image.startsWith('data:') || item.product.image.startsWith('/')) ? item.product.image : `/${item.product.image}`}
                      alt={item.product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                      }}
                    />
                  </div>

                  {/* Name and size */}
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111111' }}>{item.product.name}</h3>
                    <span style={{ fontSize: '0.78rem', color: '#666666', display: 'block', marginTop: '4px' }}>Talle: {item.size}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color)', display: 'block', marginTop: '8px' }}>
                      ${item.product.price.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Quantity adjustment */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EAEAEA' }}>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      style={{ padding: '6px 12px' }}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      style={{ padding: '6px 12px' }}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => removeFromCart(item.product.id, item.size)}
                    style={{ padding: '8px', color: '#FF4D4D' }}
                    aria-label="Quitar prenda"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Coupons block */}
            <div style={{ backgroundColor: '#F8F8F8', padding: '24px', border: '1px solid #EAEAEA' }}>
              <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '14px' }}>¿Tenés un cupón de descuento?</h3>
              
              {activeCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E6F4EA', padding: '12px 16px', border: '1px solid #34A853' }}>
                  <span style={{ fontSize: '0.88rem', color: '#137333', fontWeight: 600 }}>
                    Cupón {activeCoupon.code} aplicado ({activeCoupon.discountPercentage}% OFF)
                  </span>
                  <button onClick={handleRemoveCoupon} style={{ fontSize: '0.8rem', color: '#FF4D4D', fontWeight: 600 }}>
                    Quitar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Ej: STREET15" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flexGrow: 1,
                      padding: '10px 14px',
                      border: '1px solid #EAEAEA',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.88rem',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    style={{
                      backgroundColor: '#111111',
                      color: '#FFFFFF',
                      padding: '10px 20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    Aplicar
                  </button>
                </div>
              )}
              {couponError && <p style={{ color: '#FF4D4D', fontSize: '0.8rem', marginTop: '8px' }}>{couponError}</p>}
            </div>
          </div>

          {/* RIGHT: CHECKOUT FORM & SUMMARY */}
          <div>
            <div style={{ backgroundColor: '#F8F8F8', border: '1px solid #EAEAEA', padding: '30px' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid #EAEAEA', paddingBottom: '12px' }}>
                Resumen de Compra
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#666666' }}>Subtotal</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--primary-color)' }}>
                    <span>Descuento</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#666666' }}>Envío</span>
                  <span style={{ fontStyle: 'italic', color: '#111111', fontWeight: 500 }}>A coordinar</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#EAEAEA', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary-color)' }}>${finalTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Datos de Envío</h4>
                
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Nombre y Apellido *</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>WhatsApp (con código de área) *</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 3786123456"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej: juan@gmail.com"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Método de Envío</label>
                  <select 
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Correo Argentino">Correo Argentino</option>
                    <option value="Via Cargo">Via Cargo</option>
                    <option value="Motomandado">Motomandado (Ituzaingó)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Método de Pago</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Transferencia">Transferencia Bancaria (10% OFF)</option>
                    <option value="Efectivo">Efectivo en el Local</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={checkoutLoading}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '10px', padding: '16px' }}
                >
                  {checkoutLoading ? 'Procesando...' : 'Finalizar por WhatsApp'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
