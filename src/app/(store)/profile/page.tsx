'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getProducts, getOrders, Order, Product } from '@/lib/db';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, Heart, LogOut, Package, ExternalLink, Calendar, Check, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'favorites'>('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load orders and products
  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      try {
        setLoadingData(true);
        // Fetch all products to match favorites
        const allProds = await getProducts();
        setProducts(allProds);

        // Fetch all orders and filter by user email
        const allOrders = await getOrders();
        const userOrders = allOrders.filter(
          (o) => o.customerEmail?.toLowerCase() === user.email?.toLowerCase()
        );
        setOrders(userOrders);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    } else {
      alert("Error al cerrar sesión.");
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666666' }}>Cargando perfil...</p>
      </div>
    );
  }

  // Filtered favorite products details
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh', backgroundColor: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #EAEAEA',
          paddingBottom: '24px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.1em', fontWeight: 600 }}>
              Bienvenido/a a Good Style
            </span>
            <h1 style={{ fontSize: '1.75rem', textTransform: 'uppercase', marginTop: '4px', fontWeight: 800 }}>
              Mi Cuenta
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #FF4D4D',
              color: '#FF4D4D',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF4D4D';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FF4D4D';
            }}
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>

        {/* Profile Tabs Layout */}
        <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
          {/* Tabs header */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #EAEAEA',
            gap: '24px',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}>
            {[
              { id: 'info', label: 'Mis Datos', icon: <User size={16} /> },
              { id: 'orders', label: `Mis Compras (${orders.length})`, icon: <ShoppingBag size={16} /> },
              { id: 'favorites', label: `Mis Favoritos (${favorites.length})`, icon: <Heart size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 6px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--primary-color)' : '#666666',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs content */}
          <div style={{ marginTop: '10px' }} className="fade-in">
            {loadingData ? (
              <p style={{ color: '#888888', fontStyle: 'italic' }}>Cargando datos...</p>
            ) : (
              <>
                {/* TAB 1: USER DATA */}
                {activeTab === 'info' && (
                  <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ border: '1px solid #EAEAEA', padding: '24px', backgroundColor: '#F9F9F9' }}>
                      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>Datos Personales</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                        <div>
                          <span style={{ color: '#888888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</span>
                          <span style={{ fontWeight: 600 }}>{user.email}</span>
                        </div>
                        <div>
                          <span style={{ color: '#888888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Identificador de Cuenta</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{user.id}</span>
                        </div>
                        <div>
                          <span style={{ color: '#888888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Último Acceso</span>
                          <span>{new Date(user.last_sign_in_at || '').toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PURCHASE HISTORY */}
                {activeTab === 'orders' && (
                  <div>
                    {orders.length === 0 ? (
                      <div style={{ border: '1px dashed #EAEAEA', padding: '40px', textAlign: 'center' }}>
                        <Package size={48} color="#CCCCCC" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#666666', fontSize: '0.95rem', marginBottom: '20px' }}>Aún no has realizado ninguna compra en nuestro sitio web.</p>
                        <Link href="/catalog" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>Ir al Catálogo</Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {orders.map((order) => (
                          <div key={order.id} style={{ border: '1px solid #EAEAEA', padding: '24px' }}>
                            {/* Order top details */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              borderBottom: '1px solid #F5F5F5',
                              paddingBottom: '14px',
                              marginBottom: '16px',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                                  Pedido #{order.id}
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: '#888888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                </span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                                  ${order.total.toLocaleString('es-AR')}
                                </span>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#888888', marginTop: '2px' }}>
                                  Pago: {order.paymentMethod}
                                </span>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                              {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                                  <div style={{ width: '36px', height: '48px', position: 'relative', border: '1px solid #EAEAEA', flexShrink: 0 }}>
                                    <img
                                      src={(item.image?.startsWith('http') || item.image?.startsWith('data:') || item.image?.startsWith('/')) ? item.image : `/${item.image}`}
                                      alt={item.productName}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                                      }}
                                    />
                                  </div>
                                  <div style={{ flexGrow: 1 }}>
                                    <span style={{ fontWeight: 700 }}>{item.productName}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#666666', display: 'block' }}>Talle: {item.size} • Cantidad: {item.quantity}</span>
                                  </div>
                                  <span style={{ fontWeight: 600 }}>${item.price.toLocaleString('es-AR')}</span>
                                </div>
                              ))}
                            </div>

                            {/* Order Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F8F8', padding: '12px 16px', fontSize: '0.82rem' }}>
                              <span style={{ color: '#666666' }}>Envío por: <strong>{order.shippingMethod}</strong></span>
                              <span style={{
                                color: '#137333',
                                backgroundColor: '#E6F4EA',
                                padding: '2px 8px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                Recibido
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: USER SAVED FAVORITES */}
                {activeTab === 'favorites' && (
                  <div>
                    {favoriteProducts.length === 0 ? (
                      <div style={{ border: '1px dashed #EAEAEA', padding: '40px', textAlign: 'center' }}>
                        <Heart size={48} color="#CCCCCC" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#666666', fontSize: '0.95rem', marginBottom: '20px' }}>Aún no has guardado ninguna prenda en tus favoritos.</p>
                        <Link href="/catalog" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>Explorar catálogo</Link>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                      }} className="favorites-grid">
                        {favoriteProducts.map((product) => (
                          <div 
                            key={product.id}
                            className="product-card-hover"
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #EAEAEA',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%'
                            }}
                          >
                            {/* Delete Button */}
                            <button 
                              onClick={() => toggleFavorite(product.id)}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                zIndex: 3,
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                color: '#FF4D4D',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                              }}
                            >
                              X
                            </button>

                            <Link href={`/product/${product.id}`} style={{ display: 'block', overflow: 'hidden', position: 'relative', paddingTop: '133%' }}>
                              <img 
                                src={(product.image?.startsWith('http') || product.image?.startsWith('data:') || product.image?.startsWith('/')) ? product.image : `/${product.image}`}
                                alt={product.name}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                                }}
                              />
                            </Link>

                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.05em', marginBottom: '2px' }}>
                                {product.categoryDisplay}
                              </span>
                              <Link href={`/product/${product.id}`} style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#111111',
                                lineHeight: '1.3',
                                marginBottom: '6px',
                                height: '2.6em',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {product.name}
                              </Link>
                              <div style={{
                                marginTop: 'auto',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                                  ${product.price.toLocaleString('es-AR')}
                                </span>
                                <Link href={`/product/${product.id}`} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
                                  Ver
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
