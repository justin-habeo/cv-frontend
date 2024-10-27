// src/components/hybridChartTypes/scatterWithVisualMappingChart.js

export const getScatterWithVisualMappingOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for scatter with visual mapping chart:", data);
    return {};
  }

  const series = data.map(seriesData => ({
    name: seriesData.name,
    type: 'scatter',
    data: seriesData.data.map(item => [item.time, item.value]),
    symbolSize: function (data) {
      return Math.sqrt(data[1]) * (chartConfig.additionalConfig?.symbolSizeFactor || 5);
    },
    itemStyle: {
      opacity: chartConfig.additionalConfig?.opacity || 0.7,
    },
  }));

  const allValues = data.flatMap(seriesData => seriesData.data.map(item => item.value));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  console.log("Generated series:", series);

  const chartOptions = {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const date = new Date(params.value[0]).toLocaleString();
        return `${params.seriesName}<br/>${date}<br/>Value: ${params.value[1].toFixed(2)}`;
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
      name: chartConfig.additionalConfig?.yAxisName || '',
      nameTextStyle: { color: muiTheme.palette.text.secondary },
      axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
      axisLabel: { color: muiTheme.palette.text.secondary },
      splitLine: { show: chartConfig.additionalConfig?.showGridLines !== false },
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      dimension: 1,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['HIGH', 'LOW'],
      calculable: true,
      inRange: {
        color: chartConfig.additionalConfig?.colorRange || ['#50a3ba', '#eac736', '#d94e5d']
      },
      textStyle: {
        color: muiTheme.palette.text.primary,
      },
    },
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};