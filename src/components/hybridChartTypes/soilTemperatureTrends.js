export const getSoilTemperatureTrendsOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for soil temperature trends chart:", data);
    return {};
  }

  const airTempSeries = data.find(series => series.name === 'temperature_2m');
  const soilTemp0cmSeries = data.find(series => series.name === 'soil_temperature_0cm');
  const soilTemp6cmSeries = data.find(series => series.name === 'soil_temperature_6cm');
  const soilTemp18cmSeries = data.find(series => series.name === 'soil_temperature_18cm');

  if (!airTempSeries || !soilTemp0cmSeries || !soilTemp6cmSeries || !soilTemp18cmSeries) {
    console.error("Missing required data series for soil temperature trends chart");
    return {};
  }

  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  const createSeries = (seriesData, name, color) => ({
    name: name,
    type: 'line',
    data: allTimestamps.map(timestamp => {
      const dataPoint = seriesData.data.find(item => item.time === timestamp);
      return dataPoint ? [new Date(timestamp).getTime(), dataPoint.value, dataPoint.metadata] : [new Date(timestamp).getTime(), null, null];
    }),
    smooth: chartConfig.additionalConfig?.smoothLine !== false,
    lineStyle: { 
      color: color,
      width: chartConfig.additionalConfig?.lineWidth || 2,
    },
    symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
    symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
  });

  const series = [
    createSeries(airTempSeries, 'Air Temperature', '#FF9800'),
    createSeries(soilTemp0cmSeries, 'Soil Temp (0cm)', '#4CAF50'),
    createSeries(soilTemp6cmSeries, 'Soil Temp (6cm)', '#2196F3'),
    createSeries(soilTemp18cmSeries, 'Soil Temp (18cm)', '#9C27B0'),
  ];

  console.log("Generated series:", series);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Soil Temperature Trends',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
      top: 0,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        let tooltipContent = `<strong>${new Date(params[0].data[0]).toLocaleString()}</strong><br/>`;
        params.forEach(param => {
          tooltipContent += `${param.marker} ${param.seriesName}: ${param.data[1]}<br/>`;
          if (param.data[2]) {  // Check if metadata exists
            Object.entries(param.data[2]).forEach(([key, value]) => {
              if (key !== 'result' && key !== 'table' && !key.startsWith('_')) {
                tooltipContent += `<span style="display: inline-block; width: 10px;"></span>○ ${key}: ${value}<br/>`;
              }
            });
          }
        });
        return tooltipContent;
      }
    },
    legend: {
      data: ['Air Temperature', 'Soil Temp (0cm)', 'Soil Temp (6cm)', 'Soil Temp (18cm)'],
      bottom: 10,
      padding: [10, 10],
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
    yAxis: {
      type: 'value',
      name: 'Temperature (°C)',
      nameTextStyle: { color: muiTheme.palette.text.secondary },
      axisLabel: { color: muiTheme.palette.text.secondary },
      splitLine: { show: chartConfig.additionalConfig?.showGridLines !== false },
    },
    series: series,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};