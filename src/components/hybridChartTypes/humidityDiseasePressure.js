// src/components/hybridChartTypes/humidityDiseasePressure.js

const calculateDiseasePressureIndex = (humidity, temperature, dewPoint) => {
  console.log("Calculating Disease Pressure Index:", { humidity, temperature, dewPoint });
  const humidityFactor = humidity / 100;
  const temperatureFactor = Math.max(0, Math.min(1, (temperature - 10) / 20));
  const leafWetnessFactor = Math.max(0, Math.min(1, 1 - (temperature - dewPoint) / 5));

  const index = (humidityFactor * 0.4 + temperatureFactor * 0.3 + leafWetnessFactor * 0.3) * 100;
  console.log("Calculated Disease Pressure Index:", index);
  return index;
};

const getDiseasePressureColor = (index) => {
  if (index < 30) return '#4CAF50';
  if (index < 60) return '#FFC107';
  if (index < 80) return '#FF9800';
  return '#F44336';
};

export const getHumidityDiseasePressureOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for humidity disease pressure chart:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  const humiditySeries = data.find(series => series.name === 'relative_humidity_2m');
  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const dewPointSeries = data.find(series => series.name === 'dew_point_2m');

  if (!humiditySeries || !temperatureSeries || !dewPointSeries) {
    console.error("Missing required data series for humidity disease pressure chart. Available series:", data.map(s => s.name));
    return {
      title: {
        text: 'Error: Missing Data for Humidity Disease Pressure Chart',
        left: 'center',
        textStyle: { color: muiTheme.palette.error.main },
      },
      backgroundColor: muiTheme.palette.background.paper,
    };
  }

  const allTimestamps = [...new Set(humiditySeries.data.map(item => item.time))].sort();

  const processedData = allTimestamps.map(timestamp => {
    const humidityData = humiditySeries.data.find(item => item.time === timestamp);
    const temperatureData = temperatureSeries.data.find(item => item.time === timestamp);
    const dewPointData = dewPointSeries.data.find(item => item.time === timestamp);
  
    if (humidityData && temperatureData && dewPointData) {
      const diseasePressure = calculateDiseasePressureIndex(
        humidityData.value,
        temperatureData.value,
        dewPointData.value
      );
  
      console.log("Processed data point:", {
        time: timestamp,
        humidity: humidityData.value,
        temperature: temperatureData.value,
        dewPoint: dewPointData.value,
        diseasePressure: diseasePressure
      });
  
      return {
        time: timestamp,
        humidity: humidityData.value,
        temperature: temperatureData.value,
        dewPoint: dewPointData.value,
        diseasePressure: diseasePressure
      };
    }
    return null;
  }).filter(item => item !== null);

  console.log("Processed data:", processedData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Humidity and Disease Pressure',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        const date = new Date(params[0].axisValue);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        let result = `${formattedDate} ${formattedTime}<br/>`;
        params.forEach(param => {
          if (param.value !== undefined && param.value !== null) {
            let value = Array.isArray(param.value) ? param.value[1] : param.value;
            let unit = param.seriesName === 'Temperature' || param.seriesName === 'Dew Point' ? '°C' : 
                       param.seriesName === 'Humidity' || param.seriesName === 'Disease Pressure Index' ? '%' : '';
            
            // Check if value is a number and use toFixed, otherwise display as is
            let displayValue = typeof value === 'number' ? value.toFixed(2) : value;
            
            result += `${param.marker} ${param.seriesName}: ${displayValue}${unit}<br/>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: ['Humidity', 'Temperature', 'Dew Point', 'Disease Pressure Index'],
      bottom: 10,
      textStyle: { color: muiTheme.palette.text.primary },
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
        name: 'Humidity (%) /\n Disease Pressure\n Index',
        min: 0,
        max: 100,
        nameTextStyle: { color: muiTheme.palette.text.secondary },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Temperature (°C)',
        nameTextStyle: { color: muiTheme.palette.text.secondary },
        axisLabel: { color: muiTheme.palette.text.secondary },
      }
    ],
    series: [
      {
        name: 'Humidity',
        type: 'bar',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.humidity]),
        itemStyle: { color: muiTheme.palette.primary.main },
        opacity: 0.7,
      },
      {
        name: 'Temperature',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.temperature]),
        smooth: true,
        lineStyle: { color: '#FF9800' },
      },
      {
        name: 'Dew Point',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.dewPoint]),
        smooth: true,
        lineStyle: { color: '#4CAF50' },
      },
      {
        name: 'Disease Pressure Index',
        type: 'line',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.diseasePressure]),
        smooth: true,
        lineStyle: { 
          width: 4,
          color: muiTheme.palette.error.main
        },
        itemStyle: {
          color: muiTheme.palette.error.main
        },
        areaStyle: {
          opacity: 0.3,
          color: (params) => {
            return getDiseasePressureColor(params.value[1]);
          }
        },
        z: 10 // Ensure this series is drawn on top
      }
    ],
    visualMap: {
      show: false,
      dimension: 1,
      pieces: [
        {min: 0, max: 30, color: '#4CAF50'},
        {min: 30, max: 60, color: '#FFC107'},
        {min: 60, max: 80, color: '#FF9800'},
        {min: 80, max: 100, color: '#F44336'}
      ]
    },
    grid: {
      left: '3%',
      right: '4%',
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