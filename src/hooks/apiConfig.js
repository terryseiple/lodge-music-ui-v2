// Lodge Music System API Endpoints - via CORS proxy
export const API_ENDPOINTS = {
  ORCHESTRATOR: '/api/orchestrator',
  SPOTIFY: '/api/spotify',
  ROON: '/api/roon',
  CAST: '/api/cast',
  VOLUME: '/api/volume',
};

// Generic fetch wrapper with error handling
export const api = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
