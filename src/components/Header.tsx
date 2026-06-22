'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getProducts, Product } from '@/lib/db';

const PROMO_MESSAGES = [
  "🚚 Envíos a todo el país",
  "💳 Mercado Pago disponible",
  "🔥 Nuevos ingresos cada semana"
];

export const Header: React.FC = () => {
  const [promoIndex, setPromoIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  
  const { getCartCount } = useCart();
  const { favorites } = useFavorites();
  const router = useRouter();

  // Fetch all products when the search modal is opened
  useEffect(() => {
    if (searchOpen) {
      const fetchProducts = async () => {
        try {
          const prods = await getProducts();
          setAllProducts(prods);
        } catch (error) {
          console.error("Error fetching products for search:", error);
        }
      };
      fetchProducts();
    } else {
      setSuggestions([]);
    }
  }, [searchOpen]);

  // Filter products for suggestion list in real-time
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const filtered = allProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.categoryDisplay && p.categoryDisplay.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    });

    setSuggestions(filtered.slice(0, 6)); // limit to 6 suggestions
  }, [searchQuery, allProducts]);

  // Rotate promo messages
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Detect scroll to make header compact
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Promo Bar */}
      <div style={{
        backgroundColor: '#111111',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '8px 12px',
        fontSize: '0.78rem',
        fontWeight: 500,
        letterSpacing: '0.05em',
        transition: 'all 0.3s ease',
        zIndex: 100,
        position: 'relative'
      }}>
        {PROMO_MESSAGES[promoIndex]}
      </div>

      {/* Main Header Container */}
      <header style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EAEAEA',
        zIndex: 50,
        transition: 'all 0.3s ease',
        padding: scrolled ? '12px 0' : '20px 0'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: 'flex', padding: 4 }}
            className="mobile-only-flex"
            aria-label="Menú"
          >
            <Menu size={24} color="#111111" />
          </button>

          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: scrolled ? '1.4rem' : '1.7rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                lineHeight: 1,
                color: '#111111'
              }}>
                GOOD <span style={{ color: 'var(--primary-color)' }}>STYLE</span>
              </span>
              <span style={{
                fontSize: '0.55rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#666666',
                marginTop: 2,
                fontWeight: 600
              }}>
                STREETWEAR ARGENTINA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-only" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px'
          }}>
            <Link href="/" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Inicio</Link>
            <Link href="/catalog" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Catálogo</Link>
            <Link href="/catalog?category=jeans" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#555555' }}>Jeans</Link>
            <Link href="/catalog?category=remeras" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#555555' }}>Remeras</Link>
            <Link href="/catalog?category=buzos" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#555555' }}>Buzos</Link>
            <Link href="/catalog?category=accesorios" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#555555' }}>Accesorios</Link>
          </nav>

          {/* Actions (Search, Favorites, Cart) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {/* Search Trigger */}
            <button 
              onClick={() => setSearchOpen(true)}
              style={{ display: 'flex', padding: 8 }}
              aria-label="Buscar"
            >
              <Search size={21} color="#111111" />
            </button>

            {/* Favorites Icon */}
            <Link href="/favorites" style={{ position: 'relative', display: 'flex', padding: 8 }} aria-label="Favoritos">
              <Heart size={21} color="#111111" />
              {favorites.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'var(--primary-color)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart */}
            <Link href="/cart" style={{ position: 'relative', display: 'flex', padding: 8 }} aria-label="Carrito">
              <ShoppingBag size={21} color="#111111" />
              {getCartCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: '#111111',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Action Button for WhatsApp (Permanent) */}
      <a 
        href="https://wa.me/5493786411223?text=Hola%20Good%20Style!%20Quiero%20hacer%20una%20consulta."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#25D366',
          color: '#FFFFFF',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 99,
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.415 9.86-9.858.002-2.637-1.03-5.115-2.905-6.99C16.452 1.882 13.976.85 11.335.85 5.897.85 1.477 5.27 1.474 10.711c-.001 1.702.46 3.364 1.332 4.83l-.991 3.62 3.731-.977zm11.367-7.251c-.33-.164-1.951-.963-2.251-1.07-.3-.109-.518-.164-.736.164-.218.328-.844 1.07-.1.036 1.07-.3.11-.63-.22-.796-.98-.488-1.63-.799-2.28-1.93-.53-.923-.11-1.74-.01-1.9.1-.16.22-.3.33-.45.11-.15.15-.25.22-.41.07-.16.04-.3-.02-.41-.05-.11-.52-1.25-.71-1.72-.19-.46-.38-.4-.52-.41-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.88 2.36.98 2.5.1.14 1.73 2.64 4.19 3.7 2.46 1.06 2.46.7 2.9.66.44-.04 1.95-.8 2.22-1.53.27-.73.27-1.35.19-1.48-.08-.13-.3-.21-.63-.37z"/>
        </svg>
      </a>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <div className="fade-in" style={{
            width: '280px',
            height: '100%',
            backgroundColor: '#FFFFFF',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.05em' }}>MENÚ</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar">
                <X size={24} color="#111111" />
              </button>
            </div>

            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 600 }}>Inicio</Link>
              <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 600 }}>Catálogo Completo</Link>
              <div style={{ height: '1px', backgroundColor: '#EAEAEA', margin: '8px 0' }} />
              <Link href="/catalog?category=jeans" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', color: '#555555' }}>Jeans</Link>
              <Link href="/catalog?category=remeras" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', color: '#555555' }}>Remeras</Link>
              <Link href="/catalog?category=buzos" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', color: '#555555' }}>Buzos</Link>
              <Link href="/catalog?category=camperas" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', color: '#555555' }}>Camperas</Link>
              <Link href="/catalog?category=accesorios" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', color: '#555555' }}>Accesorios</Link>
              <Link href="/catalog?category=perfumes" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', color: '#555555' }}>Perfumes</Link>
            </nav>
          </div>
        </div>
      )}

      {/* Global Search Overlay Modal */}
      {searchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflowY: 'auto',
          padding: '40px 0'
        }}>
          <div className="container" style={{ position: 'relative', maxWidth: '800px', width: '100%' }}>
            {/* Close button */}
            <button 
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }} 
              style={{
                position: 'absolute',
                top: '-20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Cerrar"
            >
              <X size={24} color="#111111" />
            </button>

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              marginTop: '20px',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Buscar por talle, color, categoría o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  fontSize: '1.4rem',
                  padding: '16px 0',
                  border: 'none',
                  borderBottom: '2px solid #111111',
                  fontWeight: 500,
                  outline: 'none',
                  color: '#111111',
                  backgroundColor: 'transparent'
                }}
              />
              <button type="submit" style={{ position: 'absolute', right: '0', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} aria-label="Buscar">
                <ArrowRight size={24} color="#111111" />
              </button>
            </form>

            {/* Live Autocomplete Suggestions */}
            {searchQuery.trim() && (
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Resultados sugeridos
                </h4>
                {suggestions.length === 0 ? (
                  <p style={{ fontSize: '0.95rem', color: '#666666', fontStyle: 'italic' }}>
                    No se encontraron prendas que coincidan con "{searchQuery}".
                  </p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '12px'
                  }}>
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '12px',
                          border: '1px solid #EAEAEA',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <div style={{ width: '48px', height: '64px', position: 'relative', flexShrink: 0, border: '1px solid #EAEAEA' }}>
                          <img
                            src={product.image.startsWith('/') ? product.image : `/${product.image}`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500';
                            }}
                          />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '2px' }}>
                            {product.categoryDisplay}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111111', display: 'block' }}>
                            {product.name}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                          {product.originalPrice && (
                            <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: '#999999', display: 'block', marginTop: '2px' }}>
                              ${product.originalPrice.toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
};
export default Header;
