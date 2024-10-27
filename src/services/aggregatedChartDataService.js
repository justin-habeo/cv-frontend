import { fetchOpenMeteoData } from './openMeteoService';
import { fetchInfluxDBData } from './influxDBService';
import apiService from './apiService';

const normalizeOpenMeteoData = (data) => {
  console.log("Normalizing Open-Meteo data:", data);

  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid Open-Meteo data structure:', data);
    return [];
  }

  const groupedData = data.reduce((acc, point) => {
    Object.entries(point).forEach(([key, value]) => {
      if (key !== 'time') {
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({
          time: point.time,
          value: value
        });
      }
    });
    return acc;
  }, {});

  return Object.entries(groupedData).map(([variableName, points]) => ({
    name: variableName,
    dataSource: 'open-meteo',
    data: points
  }));
};

const normalizeInfluxDBData = (data) => {
  console.log("Normalizing InfluxDB data:", data);

  if (!Array.isArray(data) || data.length === 0) {
    console.warn('Empty or invalid InfluxDB data structure:', data);
    return [];
  }

  const groupedData = data.reduce((acc, point) => {
    const measurement = point._measurement;
    if (!acc[measurement]) {
      acc[measurement] = [];
    }
    
    const metadata = {...point};
    delete metadata._time;
    delete metadata.value;
    delete metadata._measurement;

    acc[measurement].push({
      time: point._time,
      value: point.value,
      metadata: metadata
    });
    
    return acc;
  }, {});

  return Object.entries(groupedData).map(([measurement, points]) => ({
    name: measurement,
    dataSource: 'influxdb',
    data: points
  }));
};

const applyOverrideLocation = (series, overrideLocationId) => {
  if (series.dataSource === 'open-meteo' && overrideLocationId) {
    return {
      ...series,
      config: {
        ...series.config,
        locationId: overrideLocationId
      }
    };
  }
  return series;
};

export const fetchAggregatedChartData = async (config) => {
  let chartConfig;
  let data = [];

  // Fetch chart configuration if not provided
  if (config.chartConfigId) {
    try {
      const chartConfigResponse = await apiService.get(`/chart-configs/${config.chartConfigId}/`);
      chartConfig = chartConfigResponse.data.config;
    } catch (error) {
      console.error('Error fetching chart configuration:', error);
      throw new Error('Failed to fetch chart configuration');
    }
  } else {
    chartConfig = config;
  }

  // Ensure siteId is available
  if (!config.siteId) {
    console.error('Site ID is required but not provided');
    throw new Error('Site ID is required');
  }

  // Process each data series
  for (let i = 0; i < chartConfig.dataSeries.length; i++) {
    const series = chartConfig.dataSeries[i];
    console.log("Processing series:", series);
    let seriesData;
    
    if (series.dataSource === 'open-meteo') {
      const openMeteoConfig = {
        ...chartConfig,
        ...series.config,
        locationId: config.locationOverrides?.[i]?.overrideLocationId || series.config.locationId,
      };

      // Ensure we have the correct date range
      if (chartConfig.dateRangeType === 'relative') {
        openMeteoConfig.relativeDateRange = chartConfig.relativeDateRange;
      } else {
        openMeteoConfig.timeRange = chartConfig.timeRange;
      }

      const result = await fetchOpenMeteoData(openMeteoConfig);
      seriesData = normalizeOpenMeteoData(result.data);
    } else if (series.dataSource === 'influxdb') {
      let start, stop;
      if (chartConfig.dateRangeType === 'relative') {
        const { value, unit } = chartConfig.relativeDateRange;
        start = `-${value}${unit.charAt(0)}`;
        stop = 'now()';
      } else {
        // Adjust the time range to ensure we capture all data
        start = chartConfig.timeRange.start ? `${chartConfig.timeRange.start}T00:00:00Z` : '-30d';
        stop = chartConfig.timeRange.end ? `${chartConfig.timeRange.end}T23:59:59Z` : 'now()';
      }

      const query = `
        from(bucket: "${series.config.bucket}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r._measurement == "${series.config.measurement}")
          |> filter(fn: (r) => ${series.config.fields.map(field => `r._field == "${field}"`).join(' or ')})
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> yield(name: "result")
      `;

      console.log("InfluxDB Query:", query);
      console.log("Bucket:", series.config.bucket);
      console.log("Site ID:", config.siteId);

      const rawData = await fetchInfluxDBData(query, series.config.bucket, config.siteId);
      console.log("Raw InfluxDB data:", rawData);

      seriesData = normalizeInfluxDBData(rawData);
      console.log("Normalized InfluxDB data:", seriesData);
    } else {
      console.warn(`Unknown data source: ${series.dataSource}`);
      continue;
    }
    
    if (seriesData.length > 0) {
      data = data.concat(seriesData);
    } else {
      console.warn(`No data returned for series: ${series.name}`);
    }
  }

  console.log("Final aggregated data:", data);

  return {
    data,
    chartConfig,
  };
};

export default {
  fetchAggregatedChartData,
};