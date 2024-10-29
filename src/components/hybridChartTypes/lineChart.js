// src/components/hybridChartTypes/lineChart.js

export const getLineChartOptions = (data, chartConfig, muiTheme) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for line chart:", data);
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
    connectNulls: true,
  }));

  return {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: {
        color: muiTheme.palette.text.primary,
      },
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
      bottom: 10,
      textStyle: {
        color: muiTheme.palette.text.primary,
      },
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
          const formatDate = (date) => {
            return date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' +
                   String(date.getDate()).padStart(2, '0');
          };
          const formatTime = (date) => {
            return String(date.getHours()).padStart(2, '0') + ':' +
                   String(date.getMinutes()).padStart(2, '0');
          };
          return formatDate(date) + '\n' + formatTime(date);
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
      axisLine: {
        onZero: false
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    series: series,
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: {
      color: muiTheme.palette.text.primary,
    },
  };
};