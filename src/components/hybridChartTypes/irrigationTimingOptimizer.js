// src/components/hybridChartTypes/irrigationTimingOptimizer.js

const calculateIrrigationNeed = (temperature, precipitationProbability, windSpeed) => {
  // ... (calculation remains the same)
};

export const getIrrigationTimingOptimizerOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for irrigation timing optimizer:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const precipProbSeries = data.find(series => series.name === 'precipitation_probability');
  const windSpeedSeries = data.find(series => series.name === 'wind_speed_10m');

  if (!temperatureSeries || !precipProbSeries || !windSpeedSeries) {
    console.error("Missing required data series for irrigation timing optimizer. Available series:", data.map(s => s.name));
    return {
      title: {
        text: 'Error: Missing Data for Irrigation Timing Optimizer',
        left: 'center',
        textStyle: { color: muiTheme.palette.error.main },
      },
      backgroundColor: muiTheme.palette.background.paper,
    };
  }

  const allTimestamps = [...new Set(temperatureSeries.data.map(item => item.time))].sort();

  const processedData = allTimestamps.map(timestamp => {
    const tempData = temperatureSeries.data.find(item => item.time === timestamp);
    const precipProbData = precipProbSeries.data.find(item => item.time === timestamp);
    const windSpeedData = windSpeedSeries.data.find(item => item.time === timestamp);

    if (tempData && precipProbData && windSpeedData) {
      const irrigationNeed = calculateIrrigationNeed(
        tempData.value,
        precipProbData.value,
        windSpeedData.value
      );

      return {
        time: timestamp,
        temperature: tempData.value,
        precipitationProbability: precipProbData.value,
        windSpeed: windSpeedData.value,
        irrigationNeed: irrigationNeed
      };
    }
    return null;
  }).filter(item => item !== null);

  console.log("Processed data:", processedData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Irrigation Timing Optimizer',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const date = new Date(params[0].axisValue);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        let result = `${formattedDate} ${formattedTime}<br/>`;
        params.forEach(param => {
          if (param.value !== undefined && param.value !== null) {
            let value = Array.isArray(param.value) ? param.value[1] : param.value;
            let unit = param.seriesName === 'Temperature' ? '°C' : 
                       param.seriesName === 'Precipitation Probability' || param.seriesName === 'Irrigation Need' ? '%' :
                       param.seriesName === 'Wind Speed' ? 'm/s' : '';
            
            // Check if value is a number and use toFixed, otherwise display as is
            let displayValue = typeof value === 'number' ? value.toFixed(2) : value;
            
            result += `${param.marker} ${param.seriesName}: ${displayValue}${unit}<br/>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: ['Temperature', 'Precipitation Probability', 'Wind Speed', 'Irrigation Need'],
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
        name: 'Temperature (°C)',
        position: 'left',
        axisLine: { lineStyle: { color: muiTheme.palette.primary.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      },
      {
        type: 'value',
        name: 'Probability (%) / Wind Speed (m/s)',
        position: 'right',
        axisLine: { lineStyle: { color: muiTheme.palette.secondary.main } },
        axisLabel: { color: muiTheme.palette.text.secondary },
      }
    ],
    series: [
      {
        name: 'Temperature',
        type: 'line',
        yAxisIndex: 0,
        data: processedData.map(item => [item.time, item.temperature]),
        itemStyle: { color: muiTheme.palette.primary.main },
      },
      {
        name: 'Precipitation Probability',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.precipitationProbability]),
        itemStyle: { color: muiTheme.palette.secondary.main },
      },
      {
        name: 'Wind Speed',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.windSpeed]),
        itemStyle: { color: muiTheme.palette.info.main },
      },
      {
        name: 'Irrigation Need',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(item => [item.time, item.irrigationNeed]),
        itemStyle: { color: muiTheme.palette.success.main },
        areaStyle: {
          color: muiTheme.palette.success.light,
          opacity: 0.3
        },
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