// src/components/hybridChartTypes/stackedColumnChart.js

export const getStackedColumnChartOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for stacked column chart:", data);
    return {};
  }

  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  const series = data.map(seriesData => ({
    name: seriesData.name,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    barWidth: chartConfig.additionalConfig?.barWidth || '60%',
    data: allTimestamps.map(timestamp => {
      const dataPoint = seriesData.data.find(item => item.time === timestamp);
      return dataPoint ? dataPoint.value : null;
    }),
  }));

  console.log("Generated series:", series);

  const chartOptions = {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        const date = new Date(params[0].axisValue).toLocaleString();
        let result = `${date}<br/>`;
        params.forEach(param => {
          if (param.value !== null) {
            result += `${param.marker} ${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
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
      type: 'category',
      data: allTimestamps,
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
      name: chartConfig.additionalConfig?.yAxisName || '',
      nameTextStyle: { color: muiTheme.palette.text.secondary },
      axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
      axisLabel: { color: muiTheme.palette.text.secondary },
      splitLine: { show: chartConfig.additionalConfig?.showGridLines !== false },
    },
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};