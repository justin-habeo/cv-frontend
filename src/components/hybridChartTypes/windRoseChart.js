// src/components/hybridChartTypes/windRoseChart.js

export const getWindRoseChartOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);


  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for wind rose chart:", data);
    return getErrorChartOptions("Invalid data format for wind rose chart", muiTheme);
  }

  const windSpeedSeries = data.find(series => series.name === 'wind_speed_10m');
  const windDirectionSeries = data.find(series => series.name === 'wind_direction_10m');

  if (!windSpeedSeries || !windDirectionSeries) {
    console.error("Missing required data series for wind rose chart. Required: 'wind_speed_10m' and 'wind_direction_10m'");
    console.error("Available series:", data.map(series => series.name));
    return getErrorChartOptions("Missing required data for wind rose chart", muiTheme);
  }

  if (!windSpeedSeries.data || !windDirectionSeries.data || windSpeedSeries.data.length === 0 || windDirectionSeries.data.length === 0) {
    console.error("Wind speed or direction data is empty");
    return getErrorChartOptions("No wind data available", muiTheme);
  }

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const speedRanges = [0, 2, 4, 6, 8, 10, 12, 14];
  const series = speedRanges.map((threshold, index) => ({
    name: `${threshold}-${speedRanges[index + 1] || '+'} m/s`,
    type: 'bar',
    data: directions.map(() => 0),
    coordinateSystem: 'polar',
    stack: 'total',
    itemStyle: {
      color: muiTheme.palette.augmentColor({
        color: { main: chartConfig.additionalConfig?.baseColor || muiTheme.palette.primary.main },
        factor: 0.2 * index
      }).main
    }
  }));

  windSpeedSeries.data.forEach((speedItem, index) => {
    const directionItem = windDirectionSeries.data[index];
    if (speedItem && directionItem && speedItem.time === directionItem.time) {
      const speed = speedItem.value;
      const direction = directionItem.value;
      const dirIndex = Math.round(direction / 22.5) % 16;
      const speedIndex = Math.min(speedRanges.findIndex(threshold => speed < threshold), speedRanges.length - 1);
      if (speedIndex !== -1) {
        series[speedIndex].data[dirIndex]++;
      }
    }
  });

  console.log("Processed series data:", series);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Wind Rose Chart',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function (params) {
        let result = `${params[0].name}<br/>`;
        params.forEach(param => {
          if (param.value !== undefined && param.value !== null) {
            result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: series.map(s => s.name),
      bottom: 0,
      textStyle: { color: muiTheme.palette.text.primary },
    },
    polar: {},
    angleAxis: {
      type: 'category',
      data: directions,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        color: muiTheme.palette.text.secondary,
        fontSize: chartConfig.additionalConfig?.axisLabelFontSize || 12
      },
    },
    radiusAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        color: muiTheme.palette.text.secondary,
        fontSize: chartConfig.additionalConfig?.axisLabelFontSize || 12
      },
    },
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};

const getErrorChartOptions = (errorMessage, muiTheme) => {
  return {
    title: {
      text: errorMessage,
      left: 'center',
      top: 'center',
      textStyle: { color: muiTheme.palette.error.main },
    },
    series: [],
  };
};