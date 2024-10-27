export const getHeatmapChartOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for heatmap chart:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  const heatmapData = data.flatMap((series, seriesIndex) => 
    series.data.map(item => [
      allTimestamps.indexOf(item.time),
      seriesIndex,
      item.value
    ])
  );

  console.log("Processed heatmap data:", heatmapData);

  // Function to format date labels
  const formatDate = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Calculate a suitable interval for x-axis labels
  const labelInterval = Math.ceil(allTimestamps.length / 10); // Adjust 10 to show more or fewer labels

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Heatmap Chart',
      left: 'center',
      top: '20px',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        if (!params.value) return ''; // Return empty string if value is undefined
        const date = new Date(allTimestamps[params.value[0]]);
        const formattedDate = formatDate(date);
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const seriesName = data[params.value[1]].name;
        return `${formattedDate} ${formattedTime}<br/>${seriesName}: ${params.value[2]}`;
      }
    },
    grid: {
      height: '60%',
      top: '80px',
      left: '3%',
      right: '10%',
      bottom: '180px',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: allTimestamps,
      splitArea: { show: true },
      axisLabel: {
        color: muiTheme.palette.text.secondary,
        formatter: (value, index) => {
          // Only show label for every nth item
          return index % labelInterval === 0 ? formatDate(value) : '';
        },
        interval: 0,
        rotate: 45,
        align: 'left',
        verticalAlign: 'top',
        padding: [10, 0, 0, 0],
        margin: 40,
      },
      axisLine: {
        show: true // Show x-axis line
      },
      axisTick: {
        show: true // Show x-axis ticks
      },
      position: 'bottom' // Move x-axis to the bottom
    },
    yAxis: {
      type: 'category',
      data: data.map(series => series.name),
      splitArea: { show: true },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    visualMap: {
      min: Math.min(...heatmapData.map(item => item[2])),
      max: Math.max(...heatmapData.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '20px',
      color: chartConfig.additionalConfig?.heatmapColors || ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
      textStyle: { color: muiTheme.palette.text.primary },
    },
    series: [{
      name: 'Heatmap',
      type: 'heatmap',
      data: heatmapData,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        bottom: '60px'
      },
      {
        type: 'inside',
        xAxisIndex: 0,
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