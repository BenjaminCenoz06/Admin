'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Percent, LogOut, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const isLogged = localStorage.getItem('good_style_admin_token');
    
    if (!isLogged && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('good_style_admin_token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

  // If on login page, render without admin navigation
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F8F8' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: '260px',
        backgroundColor: '#111111',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 20px',
        flexShrink: 0
      }} className="admin-sidebar">
        {/* Brand */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em' }}>
            GOOD <span style={{ color: 'var(--primary-color)' }}>STYLE</span>
          </h2>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: '#888888', textTransform: 'uppercase' }}>
            Panel de Control
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <Link href="/admin/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: pathname === '/admin/dashboard' ? '#FFFFFF' : '#CCCCCC',
            backgroundColor: pathname === '/admin/dashboard' ? '#222222' : 'transparent',
            borderRadius: '4px'
          }}>
            <LayoutDashboard size={18} color={pathname === '/admin/dashboard' ? 'var(--primary-color)' : '#CCCCCC'} />
            Panel General
          </Link>

          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            fontSize: '0.88rem',
            color: '#CCCCCC',
            borderRadius: '4px',
            marginTop: 'auto'
          }}>
            <ArrowLeft size={18} />
            Ver Tienda
          </Link>

          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              fontSize: '0.88rem',
              color: '#FF4D4D',
              borderRadius: '4px',
              textAlign: 'left',
              width: '100%',
              marginTop: '8px'
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </nav>
      </aside>

      {/* MAIN CONTAINER */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EAEAEA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px'
        }} className="admin-header">
          <h1 style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>
            {pathname.includes('dashboard') ? 'Panel Administrativo' : 'Gestión'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333333' }}>Hola, Andres</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              A
            </div>
          </div>
        </header>
        
        <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }} className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
