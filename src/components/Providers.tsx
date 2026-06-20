'use client';

import React, { useEffect } from 'react';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { recordVisit } from '@/lib/db';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Record visit on page mount
    recordVisit().catch(console.error);
  }, []);

  return (
    <CartProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </CartProvider>
  );
};
export default Providers;
