// src/components/hybridChartTypes/frostRiskAssessment.js

const calculateFrostRisk = (temperature, dewPoint) => {
  if (temperature <= 0) return 100; // High risk if temperature is at or below freezing
  if (temperature <= 4 && (temperature - dewPoint) <= 2) return 75; // High risk if close to dew point
  if (temperature <= 7) return 50; // Moderate risk
  if (temperature <= 10) return 25; // Low risk
  return 0; // No risk
};

export const getFrostRiskAssessmentOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  // Ensure data is in the correct format
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for frost risk assessment:", data);
    return {};
  }

  if (!chartConfig || !Array.isArray(chartConfig.dataSeries)) {
    console.error("Invalid chartConfig or missing dataSeries:", chartConfig);
    return {};
  }

  // Extract required data series
  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const dewPointSeries = data.find(series => series.name === 'dew_point_2m');

  if (!temperatureSeries || !dewPointSeries) {
    console.error("Missing required data series for frost risk assessment");
    return {};
  }

  // Extract all unique timestamps
  const allTimestamps = [...new Set(temperatureSeries.data.map(item => item.time))].sort();

  const frostRiskData = allTimestamps.map(timestamp => {
    const tempData = temperatureSeries.data.find(item => item.time === timestamp);
    const dewPointData = dewPointSeries.data.find(item => item.time === timestamp);

    if (tempData && dewPointData) {
      const risk = calculateFrostRisk(tempData.value, dewPointData.value);
      return [timestamp, risk];
    }
    return [timestamp, null];
  });

  console.log("Generated frost risk data:", frostRiskData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Frost Risk Assessment',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const date = new Date(params[0].value[0]);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const value = params[0].value[1] ? params[0].value[1].toFixed(2) : 'N/A';
        return `${formattedDate} ${formattedTime}<br/>Frost Risk: ${value}%`;
      }
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
      name: 'Frost Risk (%)',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: muiTheme.palette.text.secondary,
      },
    },
    series: [{
      name: 'Frost Risk',
      type: 'line',
      data: frostRiskData,
      areaStyle: {},
      itemStyle: { color: muiTheme.palette.info.main },
    }],
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    visualMap: {
      top: 50,
      right: 10,
      pieces: [
        {min: 75, color: muiTheme.palette.error.main},
        {min: 50, max: 75, color: muiTheme.palette.warning.main},
        {min: 25, max: 50, color: muiTheme.palette.info.main},
        {max: 25, color: muiTheme.palette.success.main}
      ],
      outOfRange: {
        color: muiTheme.palette.grey[500]
      }
    },
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};