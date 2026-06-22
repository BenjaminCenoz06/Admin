'use client';

import React, { useState, useEffect } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { getProducts, Product } from '@/lib/db';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const all = await getProducts();
        setProducts(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    const list = products.filter(p => favorites.includes(p.id));
    setFavoriteProducts(list);
  }, [products, favorites]);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: '#666666' }}>Cargando favoritos...</p>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <Heart size={64} style={{ color: '#CCCCCC', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '1.6rem', textTransform: 'uppercase', marginBottom: '12px' }}>Sin Favoritos</h2>
          <p style={{ fontSize: '0.95rem', color: '#666666', marginBottom: '32px' }}>Aún no has guardado ninguna prenda en tus favoritos.</p>
          <Link href="/catalog" className="btn-secondary" style={{ display: 'block' }}>Explorar catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '36px', borderBottom: '1px solid #EAEAEA', paddingBottom: '16px' }}>
          Mis Favoritos
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }} className="favorites-grid">
          {favoriteProducts.map((product) => (
            <div 
              key={product.id}
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
                  top: '12px',
                  right: '12px',
                  zIndex: 3,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  color: '#FF4D4D'
                }}
                aria-label="Quitar de favoritos"
              >
                <Trash2 size={16} />
              </button>

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
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                  }}
                />
              </Link>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {product.categoryDisplay}
                </span>
                <Link href={`/product/${product.id}`} style={{
                  fontSize: '0.85rem',
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
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                  <Link href={`/product/${product.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
                    Ver talle
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
