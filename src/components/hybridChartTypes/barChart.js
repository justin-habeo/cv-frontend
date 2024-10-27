// src/components/hybridChartTypes/barChart.js

export const getBarChartOptions = (data, chartConfig, muiTheme) => {
  // Ensure data is in the correct format
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for bar chart:", data);
    return {};
  }

  // Extract all unique timestamps from all series
  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  // Prepare series data
  const series = data.map(seriesData => ({
    name: seriesData.name,
    type: 'bar',
    data: allTimestamps.map(timestamp => {
      const dataPoint = seriesData.data.find(item => item.time === timestamp);
      return dataPoint ? dataPoint.value : null;
    }),
  }));

  return {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
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
      type: 'category',
      data: allTimestamps,
      axisLabel: {
        color: muiTheme.palette.text.secondary,
        rotate: 45,
        align: 'right',
        formatter: (value) => new Date(value).toLocaleString()
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };
};
