export const normalizeChartData = (data, dataSource) => {
  if (dataSource === 'open-meteo') {
    return data; // Open-Meteo data is already in the desired format
  } else if (dataSource === 'influxdb') {
    // Convert InfluxDB data to match Open-Meteo format
    return data.map(point => ({
      time: new Date(point.time).getTime(),
      [point.sensor_name]: point.value,
      // Add any other relevant fields here
    }));
  }
  throw new Error(`Unsupported data source: ${dataSource}`);
};
