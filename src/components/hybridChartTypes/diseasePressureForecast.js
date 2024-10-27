// src/components/hybridChartTypes/diseasePressureForecast.js

const estimateLeafWetness = (relativeHumidity, temperature, dewPoint) => {
  return (relativeHumidity >= 80 || temperature <= dewPoint + 2) ? 1 : 0;
};

const calculateDollarSpotRisk = (temperature, leafWetness) => {
  if (temperature >= 10 && temperature <= 30 && leafWetness === 1) {
    return ((temperature - 10) / 20) * 100; // Scale to 0-100
  }
  return 0;
};

const calculateBrownPatchRisk = (temperature, relativeHumidity, leafWetness) => {
  if (temperature >= 15 && temperature <= 35 && relativeHumidity >= 70 && leafWetness === 1) {
    return ((temperature - 15) / 20) * 100; // Scale to 0-100
  }
  return 0;
};

const calculatePythiumRisk = (temperature, leafWetness) => {
  if (temperature >= 20 && temperature <= 35 && leafWetness === 1) {
    return ((temperature - 20) / 15) * 100; // Scale to 0-100
  }
  return 0;
};

export const getDiseasePressureForecastOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  // Ensure data is in the correct format
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for disease pressure forecast:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  // Extract required data series
  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const humiditySeries = data.find(series => series.name === 'relative_humidity_2m');
  const dewPointSeries = data.find(series => series.name === 'dew_point_2m');

  if (!temperatureSeries || !humiditySeries || !dewPointSeries) {
    console.error("Missing required data series for disease pressure forecast");
    return {};
  }

  // Extract all unique timestamps
  const allTimestamps = [...new Set(temperatureSeries.data.map(item => item.time))].sort();

  const diseasePressureData = allTimestamps.map(timestamp => {
    const tempData = temperatureSeries.data.find(item => item.time === timestamp);
    const humidityData = humiditySeries.data.find(item => item.time === timestamp);
    const dewPointData = dewPointSeries.data.find(item => item.time === timestamp);

    if (tempData && humidityData && dewPointData) {
      const leafWetness = estimateLeafWetness(humidityData.value, tempData.value, dewPointData.value);
      const dollarSpot = calculateDollarSpotRisk(tempData.value, leafWetness);
      const brownPatch = calculateBrownPatchRisk(tempData.value, humidityData.value, leafWetness);
      const pythium = calculatePythiumRisk(tempData.value, leafWetness);

      return { time: timestamp, dollarSpot, brownPatch, pythium };
    }
    return null;
  }).filter(item => item !== null);

  console.log("Generated disease pressure data:", diseasePressureData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Disease Pressure Forecast',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        let tooltip = new Date(params[0].axisValue).toLocaleString() + '<br/>';
        params.forEach(param => {
          tooltip += param.marker + ' ' + param.seriesName + ': ' + param.value[1].toFixed(2) + '%<br/>';
        });
        return tooltip;
      }
    },
    legend: {
      data: ['Dollar Spot Risk', 'Brown Patch Risk', 'Pythium Risk'],
      bottom: 10,
      textStyle: { color: muiTheme.palette.text.secondary },
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
      name: 'Disease Pressure',
      max: 100,
      axisLabel: { 
        color: muiTheme.palette.text.secondary,
        formatter: '{value}%'
      },
    },
    series: [
      {
        name: 'Dollar Spot Risk',
        type: 'line',
        stack: 'risk',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: diseasePressureData.map(item => [item.time, item.dollarSpot]),
        itemStyle: { color: muiTheme.palette.primary.main },
      },
      {
        name: 'Brown Patch Risk',
        type: 'line',
        stack: 'risk',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: diseasePressureData.map(item => [item.time, item.brownPatch]),
        itemStyle: { color: muiTheme.palette.secondary.main },
      },
      {
        name: 'Pythium Risk',
        type: 'line',
        stack: 'risk',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: diseasePressureData.map(item => [item.time, item.pythium]),
        itemStyle: { color: muiTheme.palette.error.main },
      }
    ],
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