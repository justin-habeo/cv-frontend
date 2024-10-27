// src/services/agromonitoringService.js

import apiService from './apiService';

const AGROMONITORING_BASE_URL = '/agromonitoring';

export const getPolygonsForSite = async (siteId) => {
  try {
    // Update this URL to match your backend API route
    const response = await apiService.get(`/polygons/?site=${siteId}`);
    console.log('Polygons fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching polygons for site:', error);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const getPolygonInfo = async (agromonitoringPolygonId) => {
  try {
    const response = await apiService.get(`/polygons/by-agromonitoring-id/`, {
      params: { agromonitoring_polygon_id: agromonitoringPolygonId }
    });
    if (!response.data || !response.data.geo_json) {
      throw new Error('Invalid polygon data received');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching polygon info:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error('Failed to fetch polygon information: ' + (error.response?.data?.error || error.message));
  }
};


export const getNDVIData = async (polygonId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      polygon_id: polygonId,
      start_date: startDate,
      end_date: endDate,
    });
    const response = await apiService.get(`${AGROMONITORING_BASE_URL}/ndvi-data/?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NDVI data:', error);
    throw error;
  }
};

export const getNDVIImage = async (polygonId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      polygon_id: polygonId,
      start_date: startDate,
      end_date: endDate,
    });
    const response = await apiService.get(`${AGROMONITORING_BASE_URL}/ndvi-image/?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NDVI image:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

export const getNDVIImages = async (polygonId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      polygon_id: polygonId,
      start_date: startDate,
      end_date: endDate,
    });
    const response = await apiService.get(`${AGROMONITORING_BASE_URL}/ndvi-images/?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NDVI images:', error);
    throw error;
  }
};


export const createPolygon = async (polygonData) => {
  try {
    const response = await apiService.post(`${AGROMONITORING_BASE_URL}/polygon/`, polygonData);
    return response.data;
  } catch (error) {
    console.error('Error creating polygon in Agromonitoring:', error);
    throw error;
  }
};

export const updatePolygon = async (polygonId, polygonData) => {
  try {
    const response = await apiService.put(`${AGROMONITORING_BASE_URL}/polygons/${polygonId}/`, polygonData);
    return response.data;
  } catch (error) {
    console.error('Error updating polygon:', error);
    throw error;
  }
};

export const deletePolygon = async (polygonId) => {
  try {
    await apiService.delete(`${AGROMONITORING_BASE_URL}/polygons/${polygonId}/`);
  } catch (error) {
    console.error('Error deleting polygon:', error);
    throw error;
  }
};

export const getSatelliteImagery = async (polygonId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      polygon_id: polygonId,
      start_date: startDate,
      end_date: endDate,
    });
    const response = await apiService.get(`${AGROMONITORING_BASE_URL}/satellite-imagery/?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching satellite imagery:', error);
    throw error;
  }
};

export const getWeatherForecast = async (polygonId) => {
  try {
    const response = await apiService.get(`${AGROMONITORING_BASE_URL}/weather-forecast/${polygonId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

export const getSoilData = async (polygonId) => {
  try {
    const response = await apiService.get(`${AGROMONITORING_BASE_URL}/soil-data/${polygonId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw error;
  }
};

export default {
  getPolygonsForSite,
  getPolygonInfo,
  getNDVIData,
  getNDVIImage,
  getNDVIImages,
  createPolygon,
  updatePolygon,
  deletePolygon,
  getSatelliteImagery,
  getWeatherForecast,
  getSoilData
};