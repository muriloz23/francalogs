import { useState, useEffect } from 'react';

export const useDiscordCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Falha ao buscar categorias');
        }
        const data = await response.json();
        setCategories(data.categories || []);
        console.log('📁 Categorias do Discord:', data.categories);
      } catch (err: any) {
        console.error('Erro ao buscar categorias:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
