// src/components/hybridChartTypes/droughtStressIndicator.js

const calculateDroughtStress = (temperature, precipitation, humidity, windSpeed) => {
  // Calculation remains the same
  const evapotranspiration = (0.05 * temperature + 0.1 * windSpeed) * (1 - humidity / 100);
  const waterBalance = precipitation - evapotranspiration;
  return Math.max(0, Math.min(100, 50 - waterBalance * 10)); // Scale to 0-100
};

export const getDroughtStressIndicatorOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  // Ensure data is in the correct format
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for drought stress indicator:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  // Extract required data series
  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const precipitationSeries = data.find(series => series.name === 'precipitation');
  const humiditySeries = data.find(series => series.name === 'relative_humidity_2m');
  const windSpeedSeries = data.find(series => series.name === 'wind_speed_10m');

  if (!temperatureSeries || !precipitationSeries || !humiditySeries || !windSpeedSeries) {
    console.error("Missing required data series for drought stress indicator");
    return {};
  }

  // Extract all unique timestamps
  const allTimestamps = [...new Set(temperatureSeries.data.map(item => item.time))].sort();

  const droughtStressData = allTimestamps.map(timestamp => {
    const tempData = temperatureSeries.data.find(item => item.time === timestamp);
    const precipData = precipitationSeries.data.find(item => item.time === timestamp);
    const humidityData = humiditySeries.data.find(item => item.time === timestamp);
    const windData = windSpeedSeries.data.find(item => item.time === timestamp);

    if (tempData && precipData && humidityData && windData) {
      const stress = calculateDroughtStress(tempData.value, precipData.value, humidityData.value, windData.value);
      return [timestamp, stress];
    }
    return [timestamp, null];
  });

  console.log("Generated drought stress data:", droughtStressData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Drought Stress Indicator',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const date = new Date(params[0].value[0]);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const value = params[0].value[1] ? params[0].value[1].toFixed(2) : 'N/A';
        return `${formattedDate} ${formattedTime}<br/>Drought Stress: ${value}%`;
      }
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
    yAxis: {
      type: 'value',
      name: 'Drought Stress (%)',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: muiTheme.palette.text.secondary,
      },
    },
    series: [{
      name: 'Drought Stress',
      type: 'line',
      data: droughtStressData,
      areaStyle: {},
      itemStyle: { color: muiTheme.palette.warning.main },
    }],
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};