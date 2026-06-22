'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Heart, Star, Sparkles, MessageSquare } from 'lucide-react';
import { getProducts, Product, getReviews, Review } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function loadData() {
      try {
        const allProducts = await getProducts();
        
        // Filter best sellers and new arrivals
        const best = allProducts.filter(p => p.isBestSeller).slice(0, 4);
        const newest = allProducts.filter(p => p.isNew).slice(0, 4);
        
        // If not enough filters, pick first few
        setBestSellers(best.length > 0 ? best : allProducts.slice(0, 4));
        setNewArrivals(newest.length > 0 ? newest : allProducts.slice(4, 8));

        const reviews = await getReviews();
        setFeaturedReviews(reviews.slice(0, 3));
      } catch (err) {
        console.error("Error loading products", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* HERO SECTION */}
      <section style={{
        padding: '120px 0 120px 0',
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.75)), url('/marca/ChatGPT Image 13 jun 2026, 13_51_46.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '800px',
          position: 'relative',
          zIndex: 2
        }}>
          <span style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: 'var(--primary-color)',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={14} /> Colección 2026
          </span>
          <h1 style={{
            fontSize: '3.5rem',
            lineHeight: '1.1',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '18px',
            color: '#FFFFFF'
          }}>
            GOOD <span style={{ color: 'var(--primary-color)' }}>STYLE</span>
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.3rem',
            fontWeight: 500,
            color: '#EAEAEA',
            marginBottom: '12px'
          }}>
            Calidad y estilo al mejor precio.
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#CCCCCC',
            maxWidth: '560px',
            lineHeight: '1.6',
            marginBottom: '36px'
          }}>
            Streetwear, jeans, prendas oversize y accesorios seleccionados para destacar con identidad propia en la escena urbana argentina.
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            width: '100%'
          }}>
            <Link href="/catalog" className="btn-primary" style={{ padding: '16px 36px', backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
              Ver colección <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </Link>
            <a 
              href="https://wa.me/5493786411223?text=Hola%20Good%20Style!%20Quiero%20conocer%20los%20nuevos%20ingresos."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline" 
              style={{ 
                padding: '16px 36px',
                borderColor: '#FFFFFF',
                color: '#FFFFFF',
                backgroundColor: 'transparent'
              }}
            >
              Comprar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>Categorías Principales</h2>
            <p style={{ fontSize: '0.9rem', color: '#666666' }}>Elegí tu estilo streetwear diario</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {[
              { name: 'Jeans', slug: 'jeans', img: '/JEAN/baggy-azul-clasico.jpeg' },
              { name: 'Remeras', slug: 'remeras', img: '/REMERAS/boxy-2023.jpeg' },
              { name: 'Buzos', slug: 'buzos', img: '/BUZOS/oversize-washed-negro.jpeg' },
              { name: 'Accesorios', slug: 'gorras', img: '/GORRAS/trucker-toxic-negra.jpeg' },
              { name: 'Perfumes', slug: 'perfumes', img: '/PERFUMES/aimen-100-ml.jpeg' }
            ].map((cat) => (
              <Link 
                href={`/catalog?category=${cat.slug}`} 
                key={cat.slug}
                style={{
                  position: 'relative',
                  height: '350px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* Image background */}
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1,
                    transition: 'transform 0.4s ease'
                  }}
                  onError={(e) => {
                    // Fallback in case path doesn't load
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                  }}
                />
                
                {/* Overlay gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
                  zIndex: 2
                }} />

                {/* Content */}
                <div style={{
                  position: 'relative',
                  zIndex: 3,
                  padding: '24px',
                  width: '100%',
                  color: '#FFFFFF'
                }}>
                  <h3 style={{
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {cat.name}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px',
                    fontWeight: 600
                  }}>
                    Explorar <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#F8F8F8', borderTop: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '48px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Más Vendidos</h2>
              <p style={{ fontSize: '0.9rem', color: '#666666' }}>Basado en compras reales en el local</p>
            </div>
            <Link href="/catalog?sort=best_seller" style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#111111',
              borderBottom: '2px solid #111111',
              paddingBottom: '4px'
            }}>
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>Cargando prendas...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }} className="product-grid">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} isFavorite={isFavorite(product.id)} toggleFav={() => toggleFavorite(product.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '48px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Nuevos Ingresos</h2>
              <p style={{ fontSize: '0.9rem', color: '#666666' }}>Los drops más recientes del local</p>
            </div>
            <Link href="/catalog?sort=newest" style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#111111',
              borderBottom: '2px solid #111111',
              paddingBottom: '4px'
            }}>
              Ver ingresos
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>Cargando ingresos...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }} className="product-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} isFavorite={isFavorite(product.id)} toggleFav={() => toggleFavorite(product.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section style={{ padding: '80px 0', backgroundColor: '#F8F8F8', borderTop: '1px solid #EAEAEA' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>Opiniones de Clientes</h2>
            <p style={{ fontSize: '0.9rem', color: '#666666' }}>Lo que opinan quienes visten Good Style</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {featuredReviews.map((rev) => (
              <div key={rev.id} style={{
                backgroundColor: '#FFFFFF',
                padding: '30px',
                border: '1px solid #EAEAEA',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < rev.rating ? "#FFD700" : "none"} color={i < rev.rating ? "#FFD700" : "#CCCCCC"} />
                  ))}
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  color: '#444444',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  "{rev.comment}"
                </p>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>{rev.author}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>{rev.location} {rev.verified && '• Compra Verificada'}</span>
                </div>
                <MessageSquare size={24} color="#EAEAEA" style={{ position: 'absolute', bottom: '30px', right: '30px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// Compact internal ProductCard to keep imports clean
function ProductCard({ product, isFavorite, toggleFav }: { product: Product; isFavorite: boolean; toggleFav: () => void }) {
  // Compute total stock count
  const totalStock = Object.values(product.stock || {}).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #EAEAEA',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Badges */}
      {product.badge && (
        <span className={`badge ${product.badge.toLowerCase() === 'new' ? 'badge-new' : 'badge-sale'}`}>
          {product.badge}
        </span>
      )}
      
      {totalStock === 0 && (
        <span className="badge" style={{ backgroundColor: '#FF4D4D', color: '#FFFFFF' }}>
          Sin Stock
        </span>
      )}

      {/* Favorite Button */}
      <button 
        onClick={toggleFav}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 3,
          backgroundColor: 'rgba(255,255,255,0.9)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        aria-label="Agregar a favoritos"
      >
        <Heart size={16} fill={isFavorite ? "#00A86B" : "none"} color={isFavorite ? "#00A86B" : "#111111"} />
      </button>

      {/* Link to Product Detail */}
      <Link href={`/product/${product.id}`} style={{ display: 'block', overflow: 'hidden', position: 'relative', paddingTop: '133%' }}>
        <img 
          src={(product.image.startsWith('http') || product.image.startsWith('data:') || product.image.startsWith('/')) ? product.image : `/${product.image}`} 
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
          }}
        />
      </Link>

      {/* Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {product.categoryDisplay}
        </span>
        <Link href={`/product/${product.id}`} style={{
          fontSize: '0.88rem',
          fontWeight: 700,
          color: '#111111',
          lineHeight: '1.3',
          marginBottom: '8px',
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
          alignItems: 'baseline',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            ${product.price.toLocaleString('es-AR')}
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: '#999999' }}>
              ${product.originalPrice.toLocaleString('es-AR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
