import { useState } from 'react';
import { API_ENDPOINTS, api } from './apiConfig';

export const useRoon = () => {
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(null);

  const getZones = async () => {
    try {
      setLoading(true);
      const data = await api(`${API_ENDPOINTS.ROON}/zones`);
      setZones(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const control = async (zone, action) => {
    try {
      setLoading(true);
      return await api(`${API_ENDPOINTS.ROON}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ zone }),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const play = (zone) => control(zone, 'play');
  const pause = (zone) => control(zone, 'pause');
  const next = (zone) => control(zone, 'next');
  const prev = (zone) => control(zone, 'prev');
  const stop = (zone) => control(zone, 'stop');

  const getNowPlaying = async (zone) => {
    try {
      return await api(`${API_ENDPOINTS.ROON}/now_playing/${encodeURIComponent(zone)}`);
    } catch (err) {
      return null;
    }
  };

  return {
    getZones,
    play,
    pause,
    next,
    prev,
    stop,
    getNowPlaying,
    zones,
    loading,
    error
  };
};
