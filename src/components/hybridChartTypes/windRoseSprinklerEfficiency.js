// src/components/hybridChartTypes/windRoseSprinklerEfficiency.js

const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

const getWindDirectionIndex = (degree) => {
  // Ensure the degree is between 0 and 360
  degree = (degree + 360) % 360;
  // Shift by 11.25 degrees to center the directions
  return Math.floor(((degree + 11.25) % 360) / 22.5);
};

const getWindSpeedLevel = (speed) => {
  if (speed < 0.5) return 0;
  if (speed < 2) return 1;
  if (speed < 4) return 2;
  if (speed < 6) return 3;
  if (speed < 8) return 4;
  return 5;
};

export const getWindRoseSprinklerEfficiencyOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for wind rose sprinkler efficiency chart:", data);
    return getErrorChartOptions("Invalid data format for wind rose sprinkler efficiency chart", muiTheme);
  }

  const windSpeedSeries = data.find(series => series.name === 'wind_speed_10m');
  const windDirectionSeries = data.find(series => series.name === 'wind_direction_10m');

  if (!windSpeedSeries || !windDirectionSeries) {
    console.error("Missing required data series for wind rose sprinkler efficiency chart");
    return getErrorChartOptions("Missing required data for wind rose sprinkler efficiency chart", muiTheme);
  }

  const startDate = new Date(chartConfig.timeRange?.start || windSpeedSeries.data[0].time);
  const endDate = new Date(chartConfig.timeRange?.end || windSpeedSeries.data[windSpeedSeries.data.length - 1].time);

  const windData = new Array(16).fill(0).map(() => new Array(6).fill(0));
  let totalObservations = 0;

  windSpeedSeries.data.forEach((speedItem, index) => {
    const directionItem = windDirectionSeries.data[index];
    if (speedItem && directionItem && speedItem.time === directionItem.time) {
      const itemDate = new Date(speedItem.time);
      if (itemDate >= startDate && itemDate <= endDate) {
        const dirIndex = getWindDirectionIndex(directionItem.value);
        const speedLevel = getWindSpeedLevel(speedItem.value);
        windData[dirIndex][speedLevel]++;
        totalObservations++;
      }
    }
  });

  console.log("Processed wind data:", windData);
  console.log("Total observations:", totalObservations);

  if (totalObservations === 0) {
    console.error('No valid observations found for Wind Rose Sprinkler Efficiency chart');
    return getErrorChartOptions("No valid data for Wind Rose Sprinkler Efficiency chart", muiTheme);
  }

  const seriesData = windDirections.flatMap((dir, dirIndex) => 
    new Array(6).fill(0).map((_, speedLevel) => ({
      value: [dirIndex, speedLevel, (windData[dirIndex][speedLevel] / totalObservations) * 100],
      itemStyle: {
        color: muiTheme.palette.augmentColor({
          color: { main: chartConfig.additionalConfig?.baseColor || muiTheme.palette.primary.main },
          factor: 0.2 * speedLevel
        }).main
      }
    }))
  );

  const chartOptions = {
    title: {
      text: `${chartConfig.name || 'Wind Rose for Sprinkler Efficiency'}\n${startDate.toDateString()} - ${endDate.toDateString()}`,
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        if (!params || !params.value) {
          return 'No data';
        }
        const dirIndex = Math.floor(params.value[0]);
        const speedLevel = params.value[1];
        const percentage = params.value[2].toFixed(2);
        const direction = windDirections[dirIndex];
        const speedRange = ['0-0.5', '0.5-2', '2-4', '4-6', '6-8', '8+'][speedLevel];
        return `${direction}, ${speedRange} m/s: ${percentage}% of observations`;
      }
    },
    polar: {},
    angleAxis: {
      type: 'category',
      data: windDirections,
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          color: muiTheme.palette.divider,
          type: 'dashed'
        }
      },
      axisLine: { show: false },
      axisLabel: { 
        color: muiTheme.palette.text.secondary,
        fontSize: chartConfig.additionalConfig?.axisLabelFontSize || 12
      }
    },
    radiusAxis: {
      type: 'category',
      data: ['0-0.5', '0.5-2', '2-4', '4-6', '6-8', '8+'],
      axisLine: { show: false },
      axisLabel: {
        rotate: 45,
        formatter: '{value} m/s',
        color: muiTheme.palette.text.secondary,
        fontSize: chartConfig.additionalConfig?.axisLabelFontSize || 12
      }
    },
    series: [{
      type: 'custom',
      coordinateSystem: 'polar',
      renderItem: function (params, api) {
        const values = [api.value(0), api.value(1)];
        const coord = api.coord(values);
        const size = api.size([1, 1], values);
        return {
          type: 'sector',
          shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r0: coord[2] - size[0] / 2,
            r: coord[2] + size[0] / 2,
            startAngle: (-coord[3] - size[1] / 2) * Math.PI / 180,
            endAngle: (-coord[3] + size[1] / 2) * Math.PI / 180
          },
          style: api.style({
            fill: api.visual('color')
          })
        };
      },
      data: seriesData
    }],
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