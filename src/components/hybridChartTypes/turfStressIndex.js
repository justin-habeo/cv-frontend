// src/components/hybridChartTypes/turfStressIndex.js

const calculateTurfStressIndex = (temperature, humidity, windSpeed, solarRadiation) => {
  // This is a simplified calculation and should be adjusted based on actual turf stress models
  const tempFactor = Math.max(0, (temperature - 20) / 10); // Assumes stress increases above 20°C
  const humidityFactor = humidity / 100;
  const windFactor = Math.min(windSpeed / 10, 1); // Assumes max stress at 10 m/s
  const solarFactor = solarRadiation / 1000; // Assumes max stress at 1000 W/m²

  return (tempFactor * 0.4 + humidityFactor * 0.3 + windFactor * 0.2 + solarFactor * 0.1) * 100;
};

export const getTurfStressIndexOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for turf stress index chart:", data);
    return {};
  }

  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const humiditySeries = data.find(series => series.name === 'relative_humidity_2m');
  const windSpeedSeries = data.find(series => series.name === 'wind_speed_10m');
  const solarRadiationSeries = data.find(series => series.name === 'shortwave_radiation');

  if (!temperatureSeries || !humiditySeries || !windSpeedSeries || !solarRadiationSeries) {
    console.error("Missing required data series for turf stress index chart");
    return {};
  }

  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  const processedData = allTimestamps.map(timestamp => {
    const tempData = temperatureSeries.data.find(item => item.time === timestamp);
    const humidityData = humiditySeries.data.find(item => item.time === timestamp);
    const windSpeedData = windSpeedSeries.data.find(item => item.time === timestamp);
    const solarRadiationData = solarRadiationSeries.data.find(item => item.time === timestamp);
  
    if (tempData && humidityData && windSpeedData && solarRadiationData) {
      const stressIndex = calculateTurfStressIndex(
        tempData.value,
        humidityData.value,
        windSpeedData.value,
        solarRadiationData.value
      );
  
      return {
        time: timestamp,
        temperature: tempData.value,
        humidity: humidityData.value,
        windSpeed: windSpeedData.value,
        solarRadiation: solarRadiationData.value,
        stressIndex: stressIndex
      };
    }
    return {
      time: timestamp,
      temperature: null,
      humidity: null,
      windSpeed: null,
      solarRadiation: null,
      stressIndex: null
    };
  });

  console.log("Processed data:", processedData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Turf Stress Index',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        const date = new Date(params[0].axisValue).toLocaleString();
        let tooltip = `${date}<br/>`;
        params.forEach(param => {
          if (param.value && param.value[1] !== null && param.value[1] !== undefined) {
            let value = param.value[1];
            let unit = param.seriesName === 'Temperature' ? '°C' : 
                       param.seriesName === 'Humidity' ? '%' : 
                       param.seriesName === 'Wind Speed' ? 'm/s' : 
                       param.seriesName === 'Solar Radiation' ? 'W/m²' : '';
            tooltip += `${param.marker} ${param.seriesName}: ${value.toFixed(2)}${unit}<br/>`;
          }
        });
        return tooltip;
      }
    },
    legend: {
      data: ['Temperature', 'Humidity', 'Wind Speed', 'Solar Radiation', 'Turf Stress Index'],
      bottom: 0,
      textStyle: { color: muiTheme.palette.text.secondary },
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        color: muiTheme.palette.text.secondary,
        formatter: (value) => {
          const date = new Date(value);
          return [
            date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0'),
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0')
          ].join('\n');
        },
        interval: 0,
        align: 'center',
        verticalAlign: 'top',
        padding: [10, 0, 0, 0],
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Temperature (°C) &\n Humidity (%)',
        position: 'left',
        axisLine: { lineStyle: { color: muiTheme.palette.primary.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Wind Speed\n(m/s)',
        position: 'right',
        offset: 60,
        axisLine: { lineStyle: { color: muiTheme.palette.secondary.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Solar \nRadiation\n(W/m²)',
        position: 'right',
        axisLine: { lineStyle: { color: muiTheme.palette.warning.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Stress \nIndex',
        position: 'right',
        offset: 120,
        max: 100,
        axisLine: { lineStyle: { color: muiTheme.palette.error.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      }
    ],
    series: [
      {
        name: 'Temperature',
        type: 'line',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.temperature]),
        lineStyle: { color: muiTheme.palette.primary.light },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      },
      {
        name: 'Humidity',
        type: 'line',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.humidity]),
        lineStyle: { color: muiTheme.palette.primary.dark },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      },
      {
        name: 'Wind Speed',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.windSpeed]),
        lineStyle: { color: muiTheme.palette.secondary.main },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      },
      {
        name: 'Solar Radiation',
        type: 'line',
        yAxisIndex: 2,
        data: processedData.map(item => [item.time, item.solarRadiation]),
        lineStyle: { color: muiTheme.palette.warning.main },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      },
      {
        name: 'Turf Stress Index',
        type: 'line',
        yAxisIndex: 3,
        data: processedData.map(item => [item.time, item.stressIndex]),
        lineStyle: { 
          color: muiTheme.palette.error.main,
          width: chartConfig.additionalConfig?.stressIndexLineWidth || 4,
        },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
        z: 5,
        emphasis: {
          lineStyle: { width: (chartConfig.additionalConfig?.stressIndexLineWidth || 4) + 2 }
        },
      }
    ],
    dataZoom: chartConfig.additionalConfig?.enableZoom ? [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ] : undefined,
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};