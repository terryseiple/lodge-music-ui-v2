import { useState, useEffect } from 'react';

// Music Assistant API via Home Assistant
const HA_URL = 'http://10.0.101.98:8123';
const HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0MzViNTMxMWU2MTQ0YmU1YWM0ZDZiYWQ3OGE3MmJhMiIsImlhdCI6MTc3MTUzNTE2MiwiZXhwIjoyMDg2ODk1MTYyfQ.zl3yZn-USJ_Uuk0hdiHLp9_4UQr_aAVUIXXL-6rPFdE';

export const useMusicAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callService = async (service, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${HA_URL}/api/services/music_assistant/${service}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Play media on a player
  const playMedia = async (entityId, mediaId, mediaType = 'track') => {
    return callService('play_media', {
      entity_id: entityId,
      media_id: mediaId,
      media_type: mediaType,
    });
  };

  // Search library
  const search = async (query, mediaType = 'track', limit = 25) => {
    return callService('search', {
      search: query,
      media_type: [mediaType],
      limit,
    });
  };

  // Get player queue
  const getQueue = async (entityId) => {
    return callService('get_queue', {
      entity_id: entityId,
    });
  };

  // Queue add
  const queueAdd = async (entityId, mediaId) => {
    return callService('play_media', {
      entity_id: entityId,
      media_id: mediaId,
      enqueue: 'add',
    });
  };

  // Queue next
  const queueNext = async (entityId, mediaId) => {
    return callService('play_media', {
      entity_id: entityId,
      media_id: mediaId,
      enqueue: 'next',
    });
  };

  // Play from URI
  const playFromUri = async (entityId, uri) => {
    return callService('play_media', {
      entity_id: entityId,
      media_id: uri,
      media_type: 'custom',
    });
  };

  return {
    loading,
    error,
    playMedia,
    search,
    getQueue,
    queueAdd,
    queueNext,
    playFromUri,
  };
};
