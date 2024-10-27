import apiService from './apiService';

export const getSoilData = async (lat, lon) => {
  try {
    const response = await apiService.get(`/agromonitoring/soil-data/?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw error;
  }
};
