import { useState } from 'react';
import { API_ENDPOINTS, api } from './apiConfig';

export const useCast = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // YouTube Music
  const searchYouTubeMusic = async (query, filter = 'songs', limit = 20) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ q: query, filter, limit });
      return await api(`${API_ENDPOINTS.CAST}/ytmusic/search?${params}`);
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calm Radio
  const getCalmCategories = async () => {
    try {
      return await api(`${API_ENDPOINTS.CAST}/calm/categories`);
    } catch (err) {
      console.error('Failed to get Calm categories:', err);
      return [];
    }
  };

  const getCalmChannels = async (category = '', search = '') => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      return await api(`${API_ENDPOINTS.CAST}/calm/channels?${params}`);
    } catch (err) {
      console.error('Failed to get Calm channels:', err);
      return [];
    }
  };

  const searchCalm = async (query) => {
    try {
      return await api(`${API_ENDPOINTS.CAST}/calm/search/${encodeURIComponent(query)}`);
    } catch (err) {
      console.error('Calm search failed:', err);
      return [];
    }
  };

  return {
    searchYouTubeMusic,
    getCalmCategories,
    getCalmChannels,
    searchCalm,
    loading,
    error
  };
};
