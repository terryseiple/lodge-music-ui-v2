import { useState } from 'react';
import { API_ENDPOINTS, api } from './apiConfig';

export const useOrchestrator = () => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const play = async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api(`${API_ENDPOINTS.ORCHESTRATOR}/play`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      
      setPlaying(true);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stop = async (room, source = 'all') => {
    try {
      setLoading(true);
      
      await api(`${API_ENDPOINTS.ORCHESTRATOR}/stop`, {
        method: 'POST',
        body: JSON.stringify({ room, source }),
      });
      
      setPlaying(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStatus = async () => {
    try {
      return await api(`${API_ENDPOINTS.ORCHESTRATOR}/status`);
    } catch (err) {
      console.error('Status check failed:', err);
      return null;
    }
  };

  return { play, stop, getStatus, playing, loading, error };
};
