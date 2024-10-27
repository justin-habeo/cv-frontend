import apiService from './apiService';
import { subDays } from 'date-fns';

const getDateRange = (providedStartDate, providedEndDate) => {
  const endDate = providedEndDate && providedEndDate !== '' 
    ? new Date(providedEndDate) 
    : new Date();

  const startDate = providedStartDate && providedStartDate !== ''
    ? new Date(providedStartDate)
    : subDays(endDate, 7);

  return { startDate, endDate };
};

export const fetchOpenMeteoData = async (config) => {
  let chartConfig;
  let location;

  console.log("In service: Config = ", config);

  // Fetch chart configuration
  if (config.chartConfigId) {
    try {
      const chartConfigResponse = await apiService.get(`/chart-configs/${config.chartConfigId}/`);
      chartConfig = chartConfigResponse.data.config;
    } catch (error) {
      console.error('Error fetching chart configuration:', error);
      throw new Error('Failed to fetch chart configuration');
    }
  } else {
    // Using the config directly (for preview in Chart Designer)
    chartConfig = config;
  }

  console.log("In service chartConfig : ", chartConfig);
  console.log("In service config      : ", config);

  if (!chartConfig) {
    throw new Error('Invalid chart configuration');
  }

  // Determine location
  if (config.locationId) {
    try {
      const locationResponse = await apiService.get(`/locations/${config.locationId}/`);
      location = {
        latitude: locationResponse.data.latitude,
        longitude: locationResponse.data.longitude
      };
    } catch (error) {
      console.error('Error fetching location details:', error);
      throw new Error('Failed to fetch location details');
    }
  } else if (config.latitude && config.longitude) {
    location = {
      latitude: config.latitude,
      longitude: config.longitude
    };
  } else if (chartConfig.location) {
    location = chartConfig.location;
  } else if (chartConfig.defaultLocationId) {
    // New case: handle defaultLocationId from chartConfig
    try {
      const locationResponse = await apiService.get(`/locations/${chartConfig.defaultLocationId}/`);
      location = {
        latitude: locationResponse.data.latitude,
        longitude: locationResponse.data.longitude
      };
    } catch (error) {
      console.error('Error fetching default location details:', error);
      throw new Error('Failed to fetch default location details');
    }
  } else {
    throw new Error('No valid location provided');
  }

  // Determine date range
  let startDate, endDate;


  if (chartConfig.dateRange && chartConfig.dateRange.start && chartConfig.dateRange.end) {
    startDate = chartConfig.dateRange.start;
    endDate = chartConfig.dateRange.end;
  } else if (chartConfig.timeRange && chartConfig.timeRange.start && chartConfig.timeRange.end) {
    startDate = chartConfig.timeRange.start;
    endDate = chartConfig.timeRange.end;
  } else {
    startDate = config.start_date;
    endDate = config.end_date;
  }

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    hourly: (chartConfig.hourlyVariables || []).join(','),
    daily: (chartConfig.dailyVariables || []).join(','),
    start_date: startDate,
    end_date: endDate,
    timezone: 'auto'
  });

  try {
    const response = await apiService.get(`/open-meteo/data/?${params}`);
    const processedData = processOpenMeteoData(response.data);

    return {
      data: processedData,
      chartConfig: {
        ...chartConfig,
        location: location
      }
    };
  } catch (error) {
    console.error('Error fetching Open Meteo data:', error);
    throw error;
  }
};

export default {
  fetchOpenMeteoData
};

const processOpenMeteoData = (data) => {
  const processedData = [];
  const hourlyTime = data.hourly?.time || [];
  const dailyTime = data.daily?.time || [];

  // Process hourly data
  for (let i = 0; i < hourlyTime.length; i++) {
    const dataPoint = { time: hourlyTime[i] };
    for (const key in data.hourly) {
      if (key !== 'time') {
        dataPoint[key] = data.hourly[key][i];
      }
    }
    processedData.push(dataPoint);
  }

  // Process daily data
  for (let i = 0; i < dailyTime.length; i++) {
    const dataPoint = processedData.find(d => d.time.startsWith(dailyTime[i])) || { time: dailyTime[i] };
    for (const key in data.daily) {
      if (key !== 'time') {
        dataPoint[`daily_${key}`] = data.daily[key][i];
      }
    }
    if (!processedData.includes(dataPoint)) {
      processedData.push(dataPoint);
    }
  }

  return processedData.sort((a, b) => new Date(a.time) - new Date(b.time));
};