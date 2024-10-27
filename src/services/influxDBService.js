// src/services/influxDBService.js

import apiService from './apiService';

export const fetchInfluxDBData = async (query, bucket, siteId) => {
  console.log("Fetching InfluxDB data with query:", query);
  console.log("Bucket:", bucket);
  console.log("Site ID:", siteId);

  try {
    const response = await apiService.post('/influxdb/read/', {
      query,
      bucket,
      site_id: siteId
    });

    console.log("InfluxDB response:", response.data);

    if (!response.data || !Array.isArray(response.data.data)) {
      console.error("Invalid response from InfluxDB:", response.data);
      return [];
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching InfluxDB data:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchBuckets = async (siteId) => {
  try {
    const response = await apiService.get('/influxdb/buckets/', { params: { site_id: siteId } });
    return response.data.buckets;
  } catch (error) {
    console.error('Error fetching InfluxDB buckets:', error);
    throw error;
  }
};

export const fetchMeasurements = async (bucket, siteId) => {
  try {
    const response = await apiService.get('/influxdb/measurements/', {
      params: { bucket, site_id: siteId }
    });
    return response.data.measurements;
  } catch (error) {
    console.error('Error fetching InfluxDB measurements:', error);
    throw error;
  }
};

export const fetchFields = async (bucket, measurement, siteId) => {
  try {
    console.log(`Sending request to fetch fields for bucket: ${bucket}, measurement: ${measurement}, site_id: ${siteId}`);
    const response = await apiService.get('/influxdb/fields/', {
      params: { bucket, measurement, site_id: siteId }
    });
    console.log('Response from fields endpoint:', response);
    if (!response.data.fields || response.data.fields.length === 0) {
      console.warn(`No fields returned for bucket: ${bucket}, measurement: ${measurement}, site_id: ${siteId}`);
      return [];
    }
    return response.data.fields;
  } catch (error) {
    console.error('Error fetching InfluxDB fields:', error);
    const errorMessage = error.response?.data?.error || error.message;
    throw new Error(`Failed to fetch fields: ${errorMessage}`);
  }
};

export const writeInfluxDBData = async (measurement, tags, fields, timestamp, bucket, siteId) => {
  try {
    const response = await apiService.post('/influxdb/write/', {
      measurement,
      tags,
      fields,
      timestamp,
      bucket,
      site_id: siteId
    });
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to write data to InfluxDB');
    }
    return response.data;
  } catch (error) {
    console.error('Error writing InfluxDB data:', error);
    throw error;
  }
};

export const checkInfluxDBConnection = async (siteId) => {
  try {
    const response = await apiService.get('/influxdb/check-connection/', {
      params: { site_id: siteId }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking InfluxDB connection:', error);
    throw error;
  }
};

export const testInfluxDBConnection = async (siteId) => {
  try {
    const response = await apiService.get('/influxdb/test-connection/', {
      params: { site_id: siteId }
    });
    return response.data;
  } catch (error) {
    console.error('Error testing InfluxDB connection:', error);
    throw error;
  }
};

const processInfluxDBData = (response) => {
  if (response.status !== 'success' || !response.data || !Array.isArray(response.data)) {
    console.error('Unexpected data structure from InfluxDB:', response);
    throw new Error('Unexpected data structure from InfluxDB');
  }

  return response.data.map(point => {
    const processedPoint = { time: point._time };
    Object.keys(point).forEach(key => {
      if (key !== '_time' && key !== '_measurement' && key !== '_start' && key !== '_stop') {
        processedPoint[key] = point[key];
      }
    });
    return processedPoint;
  });
};

export default {
  fetchInfluxDBData,
  fetchBuckets,
  fetchMeasurements,
  fetchFields,
  writeInfluxDBData,
  checkInfluxDBConnection,
  testInfluxDBConnection
};

