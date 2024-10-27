// src/components/hybridChartTypes/greenSpeedPredictor.js

const calculateGreenSpeed = (soilMoisture, temperature, humidity, precipitation) => {
  // Calculation remains the same
  const moistureFactor = 1 - (soilMoisture / 100);
  const tempFactor = Math.max(0, Math.min((temperature - 10) / 20, 1));
  const humidityFactor = 1 - (humidity / 100);
  const precipFactor = Math.max(0, 1 - (precipitation / 10));
  return (moistureFactor * 0.4 + tempFactor * 0.3 + humidityFactor * 0.2 + precipFactor * 0.1) * 12 + 7;
};

const getSpeedColor = (speed) => {
  if (speed < 8) return '#4169E1';
  if (speed < 10) return '#32CD32';
  if (speed < 12) return '#FFD700';
  if (speed < 14) return '#FFA500';
  return '#FF4500';
};

export const getGreenSpeedPredictorOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for green speed predictor:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  const soilMoistureSeries = data.find(series => series.name === 'soil_moisture_0_1cm');
  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const humiditySeries = data.find(series => series.name === 'relative_humidity_2m');
  const precipitationSeries = data.find(series => series.name === 'precipitation');

  if (!soilMoistureSeries || !temperatureSeries || !humiditySeries || !precipitationSeries) {
    console.error("Missing required data series for green speed predictor. Available series:", data.map(s => s.name));
    return {
      title: {
        text: 'Error: Missing Data for Green Speed Predictor',
        left: 'center',
        textStyle: { color: muiTheme.palette.error.main },
      },
      backgroundColor: muiTheme.palette.background.paper,
    };
  }

  const allTimestamps = [...new Set(soilMoistureSeries.data.map(item => item.time))].sort();

  const processedData = allTimestamps.map(timestamp => {
    const soilMoistureData = soilMoistureSeries.data.find(item => item.time === timestamp);
    const temperatureData = temperatureSeries.data.find(item => item.time === timestamp);
    const humidityData = humiditySeries.data.find(item => item.time === timestamp);
    const precipitationData = precipitationSeries.data.find(item => item.time === timestamp);

    if (soilMoistureData && temperatureData && humidityData && precipitationData) {
      const greenSpeed = calculateGreenSpeed(
        soilMoistureData.value,
        temperatureData.value,
        humidityData.value,
        precipitationData.value
      );

      return {
        time: timestamp,
        soilMoisture: soilMoistureData.value,
        temperature: temperatureData.value,
        humidity: humidityData.value,
        precipitation: precipitationData.value,
        greenSpeed: greenSpeed
      };
    }
    return null;
  }).filter(item => item !== null);

  console.log("Processed data:", processedData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Green Speed Predictor',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        const date = new Date(params[0].axisValue);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        let tooltip = `${formattedDate} ${formattedTime}<br/>`;
        params.forEach(param => {
          let value = param.value;
          let unit = param.seriesName === 'Temperature' ? '°C' : 
                     param.seriesName === 'Humidity' ? '%' : 
                     param.seriesName === 'Soil Moisture' ? '%' :
                     param.seriesName === 'Precipitation' ? 'mm' :
                     param.seriesName === 'Predicted Green Speed' ? ' feet' : '';
          
          // Check if value is a number and use toFixed, otherwise display as is
          let displayValue = typeof value === 'number' ? value.toFixed(2) : value;
          
          tooltip += `${param.marker} ${param.seriesName}: ${displayValue}${unit}<br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      data: ['Soil Moisture', 'Temperature', 'Humidity', 'Precipitation', 'Predicted Green Speed'],
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
    yAxis: [
      {
        type: 'value',
        name: 'Moisture (%) &\n Precipitation (mm)',
        position: 'left',
        axisLine: { lineStyle: { color: muiTheme.palette.primary.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Temperature (°C)\n & Humidity (%)',
        position: 'right',
        axisLine: { lineStyle: { color: muiTheme.palette.secondary.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Green Speed\n (feet)',
        position: 'right',
        offset: 90,
        min: 7,
        max: 19,
        axisLine: { lineStyle: { color: muiTheme.palette.success.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      }
    ],
    series: [
      {
        name: 'Soil Moisture',
        type: 'line',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.soilMoisture]),
        lineStyle: { color: muiTheme.palette.primary.light },
      },
      {
        name: 'Precipitation',
        type: 'bar',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.precipitation]),
        itemStyle: { color: muiTheme.palette.primary.dark },
      },
      {
        name: 'Temperature',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.temperature]),
        lineStyle: { color: muiTheme.palette.secondary.light },
      },
      {
        name: 'Humidity',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.humidity]),
        lineStyle: { color: muiTheme.palette.secondary.dark },
      },
      {
        name: 'Predicted Green Speed',
        type: 'bar',
        yAxisIndex: 2,
        data: processedData.map(item => [item.time, item.greenSpeed]),
        itemStyle: {
          color: function(params) {
            return getSpeedColor(params.value[1]);
          }
        },
        z: 10,
      }
    ],
    grid: {
      left: '5%',
      right: '15%',
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