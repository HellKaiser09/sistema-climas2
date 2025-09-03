'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';


interface Product {
  id?: string; // UUID generado automáticamente
  name: string;
  description?: string | null;
  price: number; // numeric(10,2) mapeado a number
  stock_quantity?: number | null;
  category?: string | null;
  is_active?: boolean | null;
  created_at?: string; // timestamp como string ISO
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchProducto = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (data) {
        setProducts(data);
        console.log('Productos cargados:', data); // <-- Aquí agregamos el console.log
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchProducto();
}, []);
}