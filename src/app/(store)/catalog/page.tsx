'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X, Grid, SlidersHorizontal, Heart } from 'lucide-react';
import { getProducts, Product } from '@/lib/db';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';

// Subcategory definitions as per prompt
const SUBCATEGORIES: Record<string, string[]> = {
  jeans: ['Baggy', 'Semi Baggy', 'Mom', 'Cargo', 'Recto'],
  remeras: ['Oversize', 'Boxy', 'Clásicas', 'Chombas'],
  buzos: ['Oversize', 'Boxy', 'Clásicos', 'Sweaters'],
  camperas: ['Bomber', 'Reversibles', 'Jeans'],
  accesorios: ['Gorras', 'Morrales', 'Riñoneras', 'Relojes', 'Perfumes']
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'default');
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category state with search param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Load all products initially
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

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...products];

    // Search query matching (name, category, SKU, size, color)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.categoryDisplay.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sizes.some(s => s.toLowerCase() === q)
      );
    }

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Subcategory Filter
    if (selectedSubcategory !== 'all') {
      result = result.filter(p => {
        // Look for subcategory keyword in product name or description
        const sub = selectedSubcategory.toLowerCase();
        return p.name.toLowerCase().includes(sub) || p.description.toLowerCase().includes(sub);
      });
    }

    // Size Filter
    if (selectedSize !== 'all') {
      result = result.filter(p => p.sizes.includes(selectedSize));
    }

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Stock Filter
    if (onlyInStock) {
      result = result.filter(p => {
        const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
        return totalStock > 0;
      });
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'best_seller') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // Default (alphabetical name)
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedSubcategory, selectedSize, maxPrice, onlyInStock, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedSize('all');
    setMaxPrice(120000);
    setOnlyInStock(false);
    setSortBy('default');
    router.replace('/catalog');
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        
        {/* HEADER BAR */}
        <div style={{ 
          borderBottom: '1px solid #EAEAEA', 
          paddingBottom: '20px', 
          marginBottom: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              {selectedCategory === 'all' ? 'Catálogo Completo' : selectedCategory}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#666666' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'prenda encontrada' : 'prendas encontradas'}
            </p>
          </div>

          {/* Search Input inside Catalog */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Buscar por talle, remeras, mom, cargo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '12px 16px',
                border: '1px solid #EAEAEA',
                fontSize: '0.9rem',
                backgroundColor: '#F8F8F8'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '12px',
                  border: '1px solid #EAEAEA',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.9rem'
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="mobile-filter-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #111111',
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
          >
            <Filter size={16} /> Filtros
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.8rem', color: '#666666', fontWeight: 600 }} className="desktop-only">ORDENAR POR</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: '1px solid #EAEAEA',
                padding: '10px 16px',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="default">Recomendados</option>
              <option value="best_seller">Más vendidos</option>
              <option value="newest">Nuevos ingresos</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div style={{ display: 'flex', gap: '40px' }}>
          
          {/* SIDEBAR FILTERS (DESKTOP) */}
          <aside className="desktop-only" style={{
            width: '260px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            {/* Category Filter */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Categoría</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['all', 'jeans', 'remeras', 'buzos', 'camperas', 'accesorios', 'perfumes'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory('all'); // reset subcategory on category change
                    }}
                    style={{
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      fontWeight: selectedCategory === cat ? 700 : 400,
                      color: selectedCategory === cat ? 'var(--primary-color)' : '#555555',
                      textTransform: 'capitalize'
                    }}
                  >
                    {cat === 'all' ? 'Todo' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories (Dynamic) */}
            {selectedCategory !== 'all' && SUBCATEGORIES[selectedCategory.toLowerCase()] && (
              <div>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Corte / Tipo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => setSelectedSubcategory('all')}
                    style={{
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      fontWeight: selectedSubcategory === 'all' ? 700 : 400,
                      color: selectedSubcategory === 'all' ? 'var(--primary-color)' : '#555555'
                    }}
                  >
                    Todo {selectedCategory}
                  </button>
                  {SUBCATEGORIES[selectedCategory.toLowerCase()].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      style={{
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: selectedSubcategory === sub ? 700 : 400,
                        color: selectedSubcategory === sub ? 'var(--primary-color)' : '#555555'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Talle</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['all', 'S', 'M', 'L', 'XL', '38', '40', '42', '44', '46', 'Único'].map(sz => (
                  <button 
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      border: '1px solid',
                      borderColor: selectedSize === sz ? 'var(--primary-color)' : '#EAEAEA',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      fontWeight: selectedSize === sz ? 700 : 500,
                      backgroundColor: selectedSize === sz ? 'var(--primary-color)' : '#FFFFFF',
                      color: selectedSize === sz ? '#FFFFFF' : '#111111',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}
                  >
                    {sz === 'all' ? 'Todo' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio Máximo</h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${maxPrice.toLocaleString('es-AR')}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="120000" 
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>

            {/* Stock Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="stock-toggle"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                style={{ accentColor: 'var(--primary-color)', width: '16px', height: '16px' }}
              />
              <label htmlFor="stock-toggle" style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>
                Solo disponibles en stock
              </label>
            </div>

            {/* Clean Button */}
            <button 
              onClick={clearFilters}
              style={{
                border: '1px solid #EAEAEA',
                padding: '12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                textAlign: 'center',
                backgroundColor: '#F8F8F8'
              }}
            >
              Restablecer Filtros
            </button>
          </aside>

          {/* GRID CONTENT */}
          <main style={{ flexGrow: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>Cargando catálogo...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', border: '1px dashed #EAEAEA' }}>
                <p style={{ fontSize: '1rem', color: '#666666', marginBottom: '16px' }}>No encontramos prendas con los filtros aplicados.</p>
                <button onClick={clearFilters} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Ver todos los productos</button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }} className="catalog-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} isFavorite={isFavorite(product.id)} toggleFav={() => toggleFavorite(product.id)} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* MOBILE DRAWER FILTERS */}
      {mobileFiltersOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div className="fade-in" style={{
            width: '320px',
            height: '100%',
            backgroundColor: '#FFFFFF',
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>Filtros</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Cerrar">
                <X size={24} color="#111111" />
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Categoría</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['all', 'jeans', 'remeras', 'buzos', 'camperas', 'accesorios', 'perfumes'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory('all');
                    }}
                    style={{
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? 'var(--primary-color)' : '#EAEAEA',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      fontWeight: selectedCategory === cat ? 700 : 500,
                      backgroundColor: selectedCategory === cat ? 'var(--primary-color)' : '#FFFFFF',
                      color: selectedCategory === cat ? '#FFFFFF' : '#111111',
                      textTransform: 'capitalize'
                    }}
                  >
                    {cat === 'all' ? 'Todo' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Subcategory Filter */}
            {selectedCategory !== 'all' && SUBCATEGORIES[selectedCategory.toLowerCase()] && (
              <div>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Corte / Tipo</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button 
                    onClick={() => setSelectedSubcategory('all')}
                    style={{
                      border: '1px solid',
                      borderColor: selectedSubcategory === 'all' ? 'var(--primary-color)' : '#EAEAEA',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      backgroundColor: selectedSubcategory === 'all' ? 'var(--primary-color)' : '#FFFFFF',
                      color: selectedSubcategory === 'all' ? '#FFFFFF' : '#111111'
                    }}
                  >
                    Todo
                  </button>
                  {SUBCATEGORIES[selectedCategory.toLowerCase()].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      style={{
                        border: '1px solid',
                        borderColor: selectedSubcategory === sub ? 'var(--primary-color)' : '#EAEAEA',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        backgroundColor: selectedSubcategory === sub ? 'var(--primary-color)' : '#FFFFFF',
                        color: selectedSubcategory === sub ? '#FFFFFF' : '#111111'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Talle</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['all', 'S', 'M', 'L', 'XL', '38', '40', '42', '44', '46', 'Único'].map(sz => (
                  <button 
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      border: '1px solid',
                      borderColor: selectedSize === sz ? 'var(--primary-color)' : '#EAEAEA',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      backgroundColor: selectedSize === sz ? 'var(--primary-color)' : '#FFFFFF',
                      color: selectedSize === sz ? '#FFFFFF' : '#111111',
                      minWidth: '40px'
                    }}
                  >
                    {sz === 'all' ? 'Todo' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div style={{ display: 'flex', justifySelf: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio Máximo</h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${maxPrice.toLocaleString('es-AR')}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="120000" 
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>

            {/* Stock switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="stock-toggle-mobile"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
              />
              <label htmlFor="stock-toggle-mobile" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Solo disponibles en stock
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
              <button 
                onClick={clearFilters}
                style={{
                  flex: 1,
                  border: '1px solid #EAEAEA',
                  padding: '14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  backgroundColor: '#F8F8F8'
                }}
              >
                Limpiar
              </button>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '14px' }}
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ProductCard inline helper
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
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        aria-label="Agregar a favoritos"
      >
        <Heart size={15} fill={isFavorite ? "var(--primary-color)" : "none"} color={isFavorite ? "var(--primary-color)" : "#111111"} />
      </button>

      <Link href={`/product/${product.id}`} style={{ display: 'block', overflow: 'hidden', position: 'relative', paddingTop: '133%' }}>
        <img 
          src={product.image.startsWith('/') ? product.image : `/${product.image}`}
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
          {product.originalPrice && (
            <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#999999' }}>
              ${product.originalPrice.toLocaleString('es-AR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0' }}>Cargando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
