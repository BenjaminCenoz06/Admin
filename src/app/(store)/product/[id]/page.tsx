'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Share2, Star, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { getProductById, getProducts, Product, getReviews, addReview, Review } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery slider state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCartText, setAddedToCartText] = useState(false);

  // Review Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      try {
        setLoading(true);
        const prod = await getProductById(productId);
        if (!prod) {
          setProduct(null);
          return;
        }
        setProduct(prod);

        // Load reviews
        const revs = await getReviews(prod.id);
        setReviews(revs);

        // Load related items
        const all = await getProducts();
        const items = all
          .filter(p => p.category === prod.category && p.id !== prod.id)
          .slice(0, 4);
        setRelated(items.length > 0 ? items : all.filter(p => p.id !== prod.id).slice(0, 4));
        
        // Auto-select first in-stock size if available
        const sizesWithStock = prod.sizes.filter(s => (prod.stock[s] || 0) > 0);
        if (sizesWithStock.length > 0) {
          setSelectedSize(sizesWithStock[0]);
        } else if (prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // Reset active image index
    setActiveImageIndex(0);
  }, [productId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <p style={{ color: '#666666' }}>Cargando detalles de la prenda...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ marginBottom: '20px' }}>Prenda no encontrada</h2>
        <Link href="/catalog" className="btn-secondary">Volver al catálogo</Link>
      </div>
    );
  }

  // Calculate total stock count
  const totalStock = Object.values(product.stock || {}).reduce((a, b) => a + b, 0);
  const isOutOfStock = totalStock === 0;

  // SKU generation or fetch
  const productSku = product.sku || `GST-${product.category.slice(0,3).toUpperCase()}-${product.id.slice(0,3).toUpperCase()}`;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const stockAvailable = product.stock[selectedSize] || 0;
    if (stockAvailable === 0) return;

    addToCart(product, selectedSize, quantity);
    setAddedToCartText(true);
    setTimeout(() => setAddedToCartText(false), 2000);
  };

  const handleWhatsAppBuy = () => {
    if (!selectedSize) return;
    const msg = `Hola Good Style! Estoy interesado en comprar:
- Prenda: ${product.name}
- SKU: ${productSku}
- Talle: ${selectedSize}
- Cantidad: ${quantity}
- Precio: $${product.price.toLocaleString('es-AR')}`;
    
    const url = `https://wa.me/5493786411223?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    try {
      await addReview({
        productId: product.id,
        author: reviewName.trim(),
        location: 'Argentina',
        rating: reviewRating,
        comment: reviewComment.trim(),
        verified: false
      });
      
      setReviewSuccess(true);
      setReviewName('');
      setReviewComment('');
      
      // Reload reviews
      const updatedRevs = await getReviews(product.id);
      setReviews(updatedRevs);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        
        {/* BACK LINK */}
        <button 
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: '#666666',
            marginBottom: '30px',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          marginBottom: '60px'
        }} className="detail-layout">
          
          {/* LEFT: GALLERY CAROUSEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '133%', // 3:4 aspect ratio
              backgroundColor: '#F8F8F8',
              overflow: 'hidden',
              border: '1px solid #EAEAEA'
            }}>
              <img 
                src={(product.images[activeImageIndex]?.startsWith('http') || product.images[activeImageIndex]?.startsWith('data:') || product.images[activeImageIndex]?.startsWith('/')) ? product.images[activeImageIndex] : `/${product.images[activeImageIndex]}`}
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

              {isOutOfStock && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: '#FF4D4D',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  zIndex: 2
                }}>
                  Sin Stock
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '80px',
                      height: '107px', // 3:4 ratio
                      position: 'relative',
                      border: activeImageIndex === idx ? '2px solid var(--primary-color)' : '1px solid #EAEAEA',
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={(img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) ? img : `/${img}`} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {product.categoryDisplay}
            </span>
            <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '12px', lineHeight: '1.2' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{product.rating}</span>
                <span style={{ fontSize: '0.85rem', color: '#888888' }}>({reviews.length} opiniones)</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#888888', borderLeft: '1px solid #EAEAEA', paddingLeft: '16px' }}>
                SKU: {productSku}
              </span>
            </div>

            {/* Price block */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '28px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#999999' }}>
                  ${product.originalPrice.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.92rem', color: '#555555', lineHeight: '1.6', marginBottom: '28px' }}>
              {product.description}
            </p>

            {/* SIZE SELECTOR WITH STOCK INDICATORS */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Seleccionar Talle</span>
                {selectedSize && (
                  <span style={{ fontSize: '0.82rem', color: (product.stock[selectedSize] || 0) > 0 ? '#666666' : '#FF4D4D' }}>
                    {(product.stock[selectedSize] || 0) > 0 
                      ? `Stock disponible: ${product.stock[selectedSize]} u.` 
                      : 'Sin stock en este talle'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.sizes.map((sz) => {
                  const sizeStock = product.stock[sz] || 0;
                  const isAvailable = sizeStock > 0;
                  return (
                    <button 
                      key={sz}
                      onClick={() => isAvailable && setSelectedSize(sz)}
                      disabled={!isAvailable}
                      style={{
                        padding: '12px 20px',
                        border: '1px solid',
                        borderColor: selectedSize === sz ? 'var(--primary-color)' : '#EAEAEA',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: selectedSize === sz ? 'var(--primary-color)' : '#FFFFFF',
                        color: selectedSize === sz 
                          ? '#FFFFFF' 
                          : isAvailable ? '#111111' : '#CCCCCC',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        position: 'relative',
                        textDecoration: isAvailable ? 'none' : 'line-through'
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity select */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Cantidad</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EAEAEA' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: '8px 16px', fontSize: '1rem', fontWeight: 600 }}
                  >
                    -
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock[selectedSize] || 99, q + 1))}
                    style={{ padding: '8px 16px', fontSize: '1rem', fontWeight: 600 }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !selectedSize || (product.stock[selectedSize] || 0) === 0}
                  className="btn-secondary"
                  style={{ 
                    flexGrow: 1, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    opacity: (isOutOfStock || !selectedSize) ? 0.5 : 1
                  }}
                >
                  <ShoppingCart size={16} /> 
                  {addedToCartText ? 'Añadido!' : 'Añadir al Carrito'}
                </button>
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  style={{
                    border: '1px solid #EAEAEA',
                    width: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF'
                  }}
                  aria-label="Agregar a favoritos"
                >
                  <Heart size={20} fill={isFavorite(product.id) ? "var(--primary-color)" : "none"} color={isFavorite(product.id) ? "var(--primary-color)" : "#111111"} />
                </button>
              </div>

              <button 
                onClick={handleWhatsAppBuy}
                disabled={isOutOfStock}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: '#25D366',
                  borderColor: '#25D366'
                }}
              >
                Comprar por WhatsApp
              </button>

              <button 
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: '#666666',
                  marginTop: '8px'
                }}
              >
                <Share2 size={14} /> Compartir prenda
              </button>
            </div>

            {/* Bullet features */}
            <div style={{ 
              borderTop: '1px solid #EAEAEA', 
              paddingTop: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {product.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: '#555555' }}>
                  <Check size={16} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <section style={{ borderTop: '1px solid #EAEAEA', paddingTop: '60px', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '30px' }}>Completá tu Look</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }} className="related-grid">
              {related.map(prod => (
                <ProductCard key={prod.id} product={prod} isFavorite={isFavorite(prod.id)} toggleFav={() => toggleFavorite(prod.id)} />
              ))}
            </div>
          </section>
        )}

        {/* REVIEWS & RATING SECTION */}
        <section style={{ borderTop: '1px solid #EAEAEA', paddingTop: '60px' }}>
          <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '30px' }}>Opiniones y Valoración</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px'
          }} className="reviews-layout">
            
            {/* LEFT: REVIEWS LIST */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111111' }}>{product.rating}</span>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.round(product.rating) ? "#FFD700" : "none"} color={i < Math.round(product.rating) ? "#FFD700" : "#CCCCCC"} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#888888' }}>Promedio de {reviews.length} valoraciones</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#888888', fontStyle: 'italic' }}>Esta prenda aún no tiene opiniones. ¡Sé el primero en dejar la tuya!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((rev) => (
                    <div key={rev.id} style={{ borderBottom: '1px solid #F5F5F5', paddingBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{rev.author}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#888888' }}>{rev.location} {rev.verified && '• Compra Verificada'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < rev.rating ? "#FFD700" : "none"} color={i < rev.rating ? "#FFD700" : "#CCCCCC"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#555555', lineHeight: '1.5' }}>"{rev.comment}"</p>
                      <span style={{ fontSize: '0.7rem', color: '#999999', display: 'block', marginTop: '6px' }}>{rev.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: LEAVE A REVIEW FORM */}
            <div style={{ backgroundColor: '#F8F8F8', padding: '30px', border: '1px solid #EAEAEA' }}>
              <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Dejanos tu opinión</h3>
              
              {reviewSuccess ? (
                <div style={{
                  backgroundColor: '#E6F4EA',
                  color: '#137333',
                  padding: '16px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={18} /> ¡Muchas gracias! Tu opinión ha sido publicada correctamente.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tu Nombre</label>
                    <input 
                      type="text" 
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Ej: Andrés G."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Valoración</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button 
                          key={stars}
                          type="button"
                          onClick={() => setReviewRating(stars)}
                          style={{ display: 'flex' }}
                        >
                          <Star size={24} fill={stars <= reviewRating ? "#FFD700" : "none"} color={stars <= reviewRating ? "#FFD700" : "#CCCCCC"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Comentario</label>
                    <textarea 
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Contanos tu experiencia con la prenda..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAEAEA', backgroundColor: '#FFFFFF', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
                    Enviar Opinión
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </div>

    </div>
  );
}

// Inline helper card
function ProductCard({ product, isFavorite, toggleFav }: { product: Product; isFavorite: boolean; toggleFav: () => void }) {
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

      <button 
        onClick={toggleFav}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 3,
          backgroundColor: 'rgba(255,255,255,0.9)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        aria-label="Agregar a favoritos"
      >
        <Heart size={14} fill={isFavorite ? "var(--primary-color)" : "none"} color={isFavorite ? "var(--primary-color)" : "#111111"} />
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
          alignItems: 'baseline',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  );
}
