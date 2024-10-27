// src/components/hybridChartTypes/gddAccumulation.js

const calculateGDD = (maxTemp, minTemp, baseTemp = 10) => {
  const avgTemp = (maxTemp + minTemp) / 2;
  return Math.max(0, avgTemp - baseTemp);
};

export const getGDDAccumulationOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  // Ensure data is in the correct format
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for GDD accumulation:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  // Extract required data series
  const maxTempSeries = data.find(series => series.name === 'daily_temperature_2m_max' || series.name === 'temperature_2m_max');
  const minTempSeries = data.find(series => series.name === 'daily_temperature_2m_min' || series.name === 'temperature_2m_min');

  // Log the found series for debugging
  console.log("Max temperature series:", maxTempSeries);
  console.log("Min temperature series:", minTempSeries);

  if (!maxTempSeries || !minTempSeries) {
    console.error("Missing required data series for GDD accumulation. Available series:", data.map(s => s.name));
    return {
      title: {
        text: 'Error: Missing Data for GDD Accumulation',
        left: 'center',
        textStyle: { color: muiTheme.palette.error.main },
      },
      backgroundColor: muiTheme.palette.background.paper,
    };
  }

  // Extract all unique timestamps
  const allTimestamps = [...new Set(maxTempSeries.data.map(item => item.time))].sort();

  let accumulatedGDD = 0;
  const gddData = allTimestamps.map(timestamp => {
    const maxTempData = maxTempSeries.data.find(item => item.time === timestamp);
    const minTempData = minTempSeries.data.find(item => item.time === timestamp);

    if (maxTempData && minTempData) {
      const dailyGDD = calculateGDD(maxTempData.value, minTempData.value);
      accumulatedGDD += dailyGDD;
      return [timestamp, accumulatedGDD];
    }
    return [timestamp, null];
  });

  console.log("Generated GDD accumulation data:", gddData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'GDD Accumulation',
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
        return `${formattedDate} ${formattedTime}<br/>Accumulated GDD: ${value}`;
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
      name: 'Accumulated GDD',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}',
        color: muiTheme.palette.text.secondary,
      },
    },
    series: [{
      name: 'Accumulated GDD',
      type: 'line',
      data: gddData,
      areaStyle: {},
      itemStyle: { color: muiTheme.palette.success.main },
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