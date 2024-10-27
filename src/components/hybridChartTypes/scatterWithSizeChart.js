// src/components/hybridChartTypes/scatterWithSizeChart.js

export const getScatterWithSizeOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for scatter with size chart:", data);
    return {};
  }

  const series = data.map(seriesData => {
    const values = seriesData.data.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    return {
      name: seriesData.name,
      type: 'scatter',
      data: seriesData.data.map(item => [item.time, item.value]),
      symbolSize: function (dataItem) {
        const normalizedValue = (dataItem[1] - minValue) / valueRange;
        const minSize = chartConfig.additionalConfig?.scatterSize?.[0] || 5;
        const maxSize = chartConfig.additionalConfig?.scatterSize?.[1] || 20;
        return normalizedValue * (maxSize - minSize) + minSize;
      },
      itemStyle: {
        opacity: chartConfig.additionalConfig?.opacity || 0.7,
      },
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
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};