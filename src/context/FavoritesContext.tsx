'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface FavoritesContextType {
  favorites: string[]; // List of product IDs
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();

  // Load favorites (from Supabase if logged in, otherwise localStorage)
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', `favorites_${user.id}`)
            .maybeSingle();
            
          if (!error && data && data.value) {
            setFavorites(data.value.favorites || []);
          } else {
            // Sync local guest favorites to account if any exist
            const storedFavs = localStorage.getItem('good_style_favorites');
            if (storedFavs) {
              const parsed = JSON.parse(storedFavs);
              if (parsed.length > 0) {
                setFavorites(parsed);
                await supabase.from('settings').upsert({ 
                  key: `favorites_${user.id}`, 
                  value: { favorites: parsed } 
                });
              }
            }
          }
        } catch (err) {
          console.error('Error loading db favorites:', err);
        }
      } else {
        const storedFavs = localStorage.getItem('good_style_favorites');
        if (storedFavs) {
          try {
            setFavorites(JSON.parse(storedFavs));
          } catch (e) {
            console.error('Failed to parse favorites');
          }
        } else {
          setFavorites([]);
        }
      }
      setInitialized(true);
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (productId: string) => {
    let updatedFavs: string[] = [];
    
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        updatedFavs = prev.filter((id) => id !== productId);
      } else {
        updatedFavs = [...prev, productId];
      }
      
      // Save locally
      localStorage.setItem('good_style_favorites', JSON.stringify(updatedFavs));
      
      // Sync to Supabase
      if (user) {
        supabase
          .from('settings')
          .upsert({ key: `favorites_${user.id}`, value: { favorites: updatedFavs } })
          .catch((err) => console.error('Error syncing favorites to Supabase:', err));
      }

      return updatedFavs;
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
