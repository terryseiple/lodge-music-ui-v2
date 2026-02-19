import { useState } from 'react';
import { API_ENDPOINTS, api } from './apiConfig';

export const useVolume = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getVolume = async (deviceId) => {
    try {
      return await api(`${API_ENDPOINTS.VOLUME}/vol/${deviceId}`);
    } catch (err) {
      console.error('Failed to get volume:', err);
      return null;
    }
  };

  const setVolume = async (deviceId, level) => {
    try {
      setLoading(true);
      return await api(`${API_ENDPOINTS.VOLUME}/vol/${deviceId}/set?level=${level}`, {
        method: 'POST',
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const volumeUp = async (deviceId, step = 10) => {
    try {
      return await api(`${API_ENDPOINTS.VOLUME}/vol/${deviceId}/up?step=${step}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Volume up failed:', err);
    }
  };

  const volumeDown = async (deviceId, step = 10) => {
    try {
      return await api(`${API_ENDPOINTS.VOLUME}/vol/${deviceId}/down?step=${step}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Volume down failed:', err);
    }
  };

  const mute = async (deviceId) => {
    try {
      return await api(`${API_ENDPOINTS.VOLUME}/vol/${deviceId}/mute`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Mute failed:', err);
    }
  };

  const unmute = async (deviceId) => {
    try {
      return await api(`${API_ENDPOINTS.VOLUME}/vol/${deviceId}/unmute`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Unmute failed:', err);
    }
  };

  return {
    getVolume,
    setVolume,
    volumeUp,
    volumeDown,
    mute,
    unmute,
    loading,
    error
  };
};
