// src/components/hybridChartTypes/lineWithZonesChart.js

export const getLineWithZonesChartOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for line with zones chart:", data);
    return {};
  }

  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  const series = data.map(seriesData => ({
    name: seriesData.name,
    type: 'line',
    data: allTimestamps.map(timestamp => {
      const dataPoint = seriesData.data.find(item => item.time === timestamp);
      return dataPoint ? [new Date(timestamp).getTime(), dataPoint.value, dataPoint.metadata] : [new Date(timestamp).getTime(), null, null];
    }),
    lineStyle: {
      width: chartConfig.additionalConfig?.lineWidth || 2,
    },
    symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
    symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
  }));

  const zones = chartConfig.additionalConfig?.zones || [];

  console.log("Generated series:", series);

  const chartOptions = {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        let tooltipContent = `<strong>${new Date(params[0].data[0]).toLocaleString()}</strong><br/>`;
        params.forEach(param => {
          const seriesData = data.find(d => d.name === param.seriesName);
          tooltipContent += `${param.marker} ${param.seriesName}: ${param.data[1]}<br/>`;
          if (seriesData.dataSource === 'influxdb' && param.data[2]) {
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
      axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    series: series.map(s => ({
      ...s,
      markArea: {
        silent: true,
        data: zones.map(zone => [
          { 
            yAxis: zone.from, 
            itemStyle: { 
              color: zone.color || muiTheme.palette.primary.light, 
              opacity: zone.opacity || 0.2 
            } 
          },
          { yAxis: zone.to }
        ])
      }
    })),
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};