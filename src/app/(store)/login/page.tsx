'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Check, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

function LoginContent() {
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // If already logged in, redirect to profile
  useEffect(() => {
    if (user && !loading) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  // Check if reset was successful from URL params
  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setSuccessMsg('Tu contraseña ha sido restablecida. Por favor, inicia sesión con tu nueva contraseña.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Error al iniciar sesión. Verifica tus datos.');
        } else {
          router.push('/profile');
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMsg('Las contraseñas no coinciden.');
          setSubmitLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          setSubmitLoading(false);
          return;
        }
        const { error } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message || 'Error al registrarse. Intenta de nuevo.');
        } else {
          setSuccessMsg('¡Registro exitoso! Por favor verifica tu correo para confirmar tu cuenta e inicia sesión.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message || 'Error al enviar el correo de recuperación.');
        } else {
          setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo electrónico.');
        }
      }
    } catch (err) {
      console.error("Auth action error:", err);
      setErrorMsg('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666666' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '60px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="auth-form-card fade-in">
          {/* Logo Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              lineHeight: 1,
              color: '#111111'
            }}>
              GOOD <span style={{ color: 'var(--primary-color)' }}>STYLE</span>
            </span>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888888', marginTop: '6px' }}>
              Autenticación
            </p>
          </div>

          <h2 style={{ fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Crear Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
          </h2>

          {/* Feedback Messages */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#FCE8E6',
              color: '#C5221F',
              padding: '12px 16px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#E6F4EA',
              color: '#137333',
              padding: '12px 16px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888888', display: 'flex' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888888', display: 'flex' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium"
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confirmar Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888888', display: 'flex' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-premium"
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ alignSelf: 'flex-end', fontSize: '0.75rem', color: '#666666', borderBottom: '1px solid #CCCCCC', paddingBottom: '2px' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="btn-secondary transition-all-premium"
              style={{ padding: '14px', width: '100%', marginTop: '10px', display: 'flex', gap: '8px' }}
            >
              <span>{submitLoading ? 'Procesando...' : 'Confirmar'}</span>
              {!submitLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Form Switchers */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #EAEAEA', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
            {mode === 'login' && (
              <p style={{ color: '#666666' }}>
                ¿No tenés una cuenta?{' '}
                <button
                  onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ fontWeight: 700, color: 'var(--primary-color)' }}
                >
                  Registrate aquí
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p style={{ color: '#666666' }}>
                ¿Ya tenés una cuenta?{' '}
                <button
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ fontWeight: 700, color: 'var(--primary-color)' }}
                >
                  Iniciá sesión
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-color)' }}
              >
                Volver a Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666666' }}>Cargando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
