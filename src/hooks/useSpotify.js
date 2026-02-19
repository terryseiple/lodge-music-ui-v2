import { useState } from 'react';
import { API_ENDPOINTS, api } from './apiConfig';

export const useSpotify = () => {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const search = async (query, type = 'track,album,playlist', limit = 20) => {
    try {
      setSearching(true);
      setError(null);
      
      const params = new URLSearchParams({ q: query, type, limit });
      const data = await api(`${API_ENDPOINTS.SPOTIFY}/search?${params}`);
      
      setResults(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Spotify search failed:', err);
      return null;
    } finally {
      setSearching(false);
    }
  };

  const getDevices = async () => {
    try {
      return await api(`${API_ENDPOINTS.SPOTIFY}/devices`);
    } catch (err) {
      console.error('Failed to get Spotify devices:', err);
      return [];
    }
  };

  const getNowPlaying = async () => {
    try {
      return await api(`${API_ENDPOINTS.SPOTIFY}/now_playing`);
    } catch (err) {
      return null;
    }
  };

  return { search, getDevices, getNowPlaying, searching, results, error };
};
