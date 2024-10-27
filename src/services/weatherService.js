import apiService from './apiService';

export const getWeatherForecast = async (latitude, longitude) => {
  try {
    const response = await apiService.get(`/weather/forecast/?latitude=${latitude}&longitude=${longitude}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};
