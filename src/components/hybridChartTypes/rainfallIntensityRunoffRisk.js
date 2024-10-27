// src/components/hybridChartTypes/rainfallIntensityRunoffRisk.js

const calculateRainfallIntensity = (amount, duration) => {
  // Intensity in mm/hour
  return duration > 0 ? (amount / duration) : 0;
};

const getRunoffRiskColor = (intensity, customThresholds) => {
  const thresholds = customThresholds || [2, 10, 50];
  if (intensity < thresholds[0]) return '#4CAF50'; // Low risk - Green
  if (intensity < thresholds[1]) return '#FFC107'; // Medium risk - Yellow
  if (intensity < thresholds[2]) return '#FF9800'; // High risk - Orange
  return '#F44336'; // Very high risk - Red
};

export const getRainfallIntensityRunoffRiskOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for rainfall intensity runoff risk chart:", data);
    return {};
  }

  const precipitationSeries = data.find(series => series.name === 'precipitation');
  const precipProbSeries = data.find(series => series.name === 'precipitation_probability');

  if (!precipitationSeries) {
    console.error("Missing precipitation data for rainfall intensity runoff risk chart");
    return {};
  }

  const customThresholds = chartConfig.additionalConfig?.intensityThresholds;

  // Process data to calculate rainfall intensity
  const rainfallData = precipitationSeries.data.reduce((acc, item) => {
    if (item.value > 0) {
      const probData = precipProbSeries ? precipProbSeries.data.find(p => p.time === item.time) : null;
      // Estimate duration based on precipitation probability
      // If probability is not available, assume 1 hour duration
      const duration = probData ? (probData.value / 100) * 24 : 1;
      const intensity = calculateRainfallIntensity(item.value, duration);
      acc.push([duration, item.value, intensity, item.time]);
    }
    return acc;
  }, []);

  console.log("Processed rainfall data:", rainfallData);

  if (rainfallData.length === 0) {
    console.warn("No rainfall data to display");
    return {
      title: {
        text: 'No Rainfall Data Available',
        left: 'center',
        textStyle: { color: muiTheme.palette.text.primary },
      },
    };
  }

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Rainfall Intensity and Runoff Risk',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const date = new Date(params.data[3]).toLocaleString();
        return `Time: ${date}<br/>
                Estimated Duration: ${params.data[0].toFixed(2)} hour(s)<br/>
                Amount: ${params.data[1].toFixed(2)} mm<br/>
                Intensity: ${params.data[2].toFixed(2)} mm/hour`;
      }
    },
    xAxis: {
      type: 'value',
      name: 'Estimated\nDuration\n (hours)',
      nameTextStyle: { color: muiTheme.palette.text.secondary },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    yAxis: {
      type: 'value',
      name: 'Amount (mm)',
      nameTextStyle: { color: muiTheme.palette.text.secondary },
      axisLabel: { color: muiTheme.palette.text.secondary },
    },
    visualMap: {
      min: 0,
      max: customThresholds ? Math.max(...customThresholds) : 50,
      dimension: 2,
      inRange: {
        color: ['#4CAF50', '#FFC107', '#FF9800', '#F44336']
      },
      textStyle: {
        color: muiTheme.palette.text.secondary
      },
      orient: 'horizontal',
      left: 'center',
      bottom: '5%'
    },
    series: [{
      type: 'scatter',
      symbolSize: function (data) {
        return Math.max(5, Math.sqrt(data[1]) * (chartConfig.additionalConfig?.bubbleSizeFactor || 5));
      },
      data: rainfallData,
      itemStyle: {
        opacity: chartConfig.additionalConfig?.bubbleOpacity || 0.8,
        color: function(params) {
          return getRunoffRiskColor(params.data[2], customThresholds);
        }
      }
    }],
    grid: {
      left: '5%',
      right: '10%',
      bottom: '15%',
      containLabel: true
    },
    backgroundColor: muiTheme.palette.background.paper,
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};