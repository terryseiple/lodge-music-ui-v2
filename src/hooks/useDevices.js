import { useState, useEffect } from 'react';
import { API_ENDPOINTS, api } from './apiConfig';

export const useDevices = () => {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        
        // Fetch rooms data (returns object with room names as keys)
        const roomsData = await api(`${API_ENDPOINTS.VOLUME}/rooms`);
        
        // Convert rooms object to array with counts
        const roomsArray = Object.entries(roomsData || {}).map(([name, devs]) => ({
          name,
          count: devs.length,
          devices: devs
        }));
        
        // Fetch all devices
        const devicesData = await api(`${API_ENDPOINTS.VOLUME}/devices`);
        const devicesArray = Object.values(devicesData || {});
        
        setRooms(roomsArray);
        setDevices(devicesArray);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch devices:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return { devices, rooms, loading, error };
};
