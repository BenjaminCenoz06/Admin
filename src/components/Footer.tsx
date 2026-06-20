'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, CreditCard, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#F8F8F8',
      borderTop: '1px solid #EAEAEA',
      padding: '60px 0 30px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* BRAND & CONTACT */}
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: '#111111'
          }}>
            GOOD <span style={{ color: 'var(--primary-color)' }}>STYLE</span>
          </span>
          <p style={{
            fontSize: '0.85rem',
            color: '#666666',
            marginTop: '12px',
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            Calidad y estilo al mejor precio. Indumentaria urbana y streetwear moderno para todo el país.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a 
              href="https://wa.me/5493786411223" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#333333' }}
            >
              <Phone size={16} color="var(--primary-color)" />
              +54 9 3786 41-1223
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#333333' }}
            >
              <svg width="16" height="16" fill="var(--primary-color)" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              @goodstyle.arg
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#333333' }}>
              <MapPin size={16} color="var(--primary-color)" />
              Ituzaingó, Corrientes, Argentina
            </div>
          </div>
        </div>

        {/* LINKS */}
        <div>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '20px',
            color: '#111111'
          }}>
            Categorías
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/catalog?category=jeans" style={{ fontSize: '0.9rem', color: '#666666' }}>Jeans</Link></li>
            <li><Link href="/catalog?category=remeras" style={{ fontSize: '0.9rem', color: '#666666' }}>Remeras</Link></li>
            <li><Link href="/catalog?category=buzos" style={{ fontSize: '0.9rem', color: '#666666' }}>Buzos</Link></li>
            <li><Link href="/catalog?category=camperas" style={{ fontSize: '0.9rem', color: '#666666' }}>Camperas</Link></li>
            <li><Link href="/catalog?category=accesorios" style={{ fontSize: '0.9rem', color: '#666666' }}>Accesorios</Link></li>
          </ul>
        </div>

        {/* PAYMENT & SHIPPING */}
        <div>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '20px',
            color: '#111111'
          }}>
            Compra Segura
          </h4>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333333', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CreditCard size={14} /> MÉTODOS DE PAGO
            </span>
            <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: '1.4' }}>
              Mercado Pago, Transferencia Bancaria, Efectivo en el local
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333333', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Truck size={14} /> ENVÍOS A TODO EL PAÍS
            </span>
            <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: '1.4' }}>
              Motomandado (local), Correo Argentino, Via Cargo
            </p>
          </div>
        </div>

        {/* MAP & LOCATION */}
        <div>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '20px',
            color: '#111111'
          }}>
            Ubicación
          </h4>
          {/* Simple OpenStreetMap / Google Maps Iframe */}
          <div style={{
            width: '100%',
            height: '140px',
            backgroundColor: '#EAEAEA',
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '10px'
          }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14197.809180749033!2d-56.69083539352726!3d-27.587232306917637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x945b0fe21ea41e0b%3A0xe1adbf0ca14ea01c!2sItuzaing%C3%B3%2C%20Corrientes!5e0!3m2!1ses-419!2sar!4v1716912345678!5m2!1ses-419!2sar" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Good Style"
            />
          </div>
          <a 
            href="https://maps.google.com/?q=Ituzaingó,Corrientes,Argentina" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-outline"
            style={{
              display: 'block',
              padding: '10px 14px',
              fontSize: '0.75rem',
              textAlign: 'center'
            }}
          >
            Cómo llegar
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid #EAEAEA',
        paddingTop: '20px',
        textAlign: 'center'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <p style={{ fontSize: '0.8rem', color: '#888888' }}>
            &copy; {new Date().getFullYear()} GOOD STYLE. Todos los derechos reservados.
          </p>
          <Link href="/admin/login" style={{ fontSize: '0.7rem', color: '#CCCCCC', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Acceso Administrativo
          </Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
