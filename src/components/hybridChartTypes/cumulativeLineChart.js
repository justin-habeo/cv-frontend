// src/components/hybridChartTypes/cumulativeLineChart.js

export const getCumulativeLineChartOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  // Ensure data is in the correct format
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for cumulative line chart:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  // Extract all unique timestamps from all series
  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  // Prepare series data
  const series = data.map((seriesData, index) => {
    const seriesConfig = chartConfig.dataSeries[index]?.config || {};
    let sum = 0;
    return {
      name: seriesData.name || `Series ${index + 1}`,
      type: 'line',
      data: allTimestamps.map(timestamp => {
        const dataPoint = seriesData.data.find(item => item.time === timestamp);
        if (dataPoint) {
          sum += dataPoint.value;
          return [timestamp, sum];
        }
        return [timestamp, null];
      }),
    };
  });

  console.log("Generated series:", series);

  const chartOptions = {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        let result = new Date(params[0].axisValue).toLocaleString() + '<br/>';
        params.forEach(param => {
          if (param.value[1] !== null) {
            result += param.marker + ' ' + param.seriesName + ': ' + param.value[1].toFixed(2) + '<br/>';
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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
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
    yAxis: {
      type: 'value',
      name: 'Cumulative Value',
      axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};