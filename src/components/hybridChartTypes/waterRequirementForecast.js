// src/components/hybridChartTypes/waterRequirementForecast.js

export const getWaterRequirementForecastOptions = (data, chartConfig, muiTheme) => {
  console.log("Data received:", data);
  console.log("Chart config received:", chartConfig);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format for water requirement forecast chart:", data);
    return {};
  }

  const temperatureSeries = data.find(series => series.name === 'temperature_2m');
  const precipitationSeries = data.find(series => series.name === 'precipitation');
  const evapotranspirationSeries = data.find(series => series.name === 'evapotranspiration');
  const soilMoistureSeries = data.find(series => series.name === 'soil_moisture_0_1cm');

  if (!temperatureSeries || !precipitationSeries || !evapotranspirationSeries || !soilMoistureSeries) {
    console.error("Missing required data series for water requirement forecast chart");
    return {};
  }

  const allTimestamps = [...new Set(data.flatMap(series => series.data.map(item => item.time)))].sort();

  const processedData = allTimestamps.map(timestamp => {
    const tempData = temperatureSeries.data.find(item => item.time === timestamp);
    const precipData = precipitationSeries.data.find(item => item.time === timestamp);
    const evapotransData = evapotranspirationSeries.data.find(item => item.time === timestamp);
    const soilMoistureData = soilMoistureSeries.data.find(item => item.time === timestamp);
  
    return {
      time: timestamp,
      temperature: tempData ? tempData.value : null,
      precipitation: precipData ? precipData.value : null,
      evapotranspiration: evapotransData ? evapotransData.value : null,
      soilMoisture: soilMoistureData ? soilMoistureData.value : null
    };
  });

  console.log("Processed data:", processedData);

  const chartOptions = {
    title: {
      text: chartConfig.name || 'Water Requirement Forecast',
      left: 'center',
      textStyle: { color: muiTheme.palette.text.primary },
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function (params) {
        const date = new Date(params[0].axisValue).toLocaleString();
        let tooltip = `${date}<br/>`;
        params.forEach(param => {
          if (param.value !== null && param.value !== undefined) {
            let value = Array.isArray(param.value) ? param.value[1] : param.value;
            if (value !== null && value !== undefined) {
              let unit = param.seriesName === 'Temperature' ? '°C' : 
                         param.seriesName === 'Precipitation' ? 'mm' : 
                         param.seriesName === 'Evapotranspiration' ? 'mm' : '%';
              tooltip += `${param.marker} ${param.seriesName}: ${value.toFixed(2)}${unit}<br/>`;
            }
          }
        });
        return tooltip;
      }
    },
    legend: {
      data: ['Precipitation', 'Temperature', 'Evapotranspiration', 'Soil Moisture'],
      bottom: 0,
      textStyle: { color: muiTheme.palette.text.primary },
    },
    grid: {
      left: '5%',
      right: '12%',
      bottom: '15%',
      top: '12%',
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
    yAxis: [
      {
        type: 'value',
        name: 'Precipitation (mm)',
        position: 'left',
        axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
        axisLabel: { color: muiTheme.palette.text.secondary },
        nameTextStyle: {
          color: muiTheme.palette.text.secondary,
          align: 'center',
          padding: [0, 0, 0, 50],
        }
      },
      {
        type: 'value',
        name: 'Temperature\n(°C)',
        position: 'right',
        offset: 80,
        axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
        axisLabel: { color: muiTheme.palette.text.secondary },
        nameTextStyle: {
          color: muiTheme.palette.text.secondary,
          align: 'center',
          padding: [0, 0, 0, 50],
        }
      },
      {
        type: 'value',
        name: 'Other \nMetrics',
        position: 'right',
        axisLine: { lineStyle: { color: muiTheme.palette.text.secondary } },
        axisLabel: { color: muiTheme.palette.text.secondary },
        nameTextStyle: {
          color: muiTheme.palette.text.secondary,
          align: 'center',
          padding: [0, 0, 0, 50],
        }
      }
    ],
    series: [
      {
        name: 'Precipitation',
        type: 'bar',
        yAxisIndex: 0,
        data: processedData.map(d => [d.time, d.precipitation]),
        itemStyle: { color: chartConfig.additionalConfig?.precipitationColor || '#4ECDC4' },
        barWidth: chartConfig.additionalConfig?.barWidth || '60%',
      },
      {
        name: 'Temperature',
        type: 'line',
        yAxisIndex: 1,
        data: processedData.map(d => [d.time, d.temperature]),
        lineStyle: { color: chartConfig.additionalConfig?.temperatureColor || '#FF6B6B' },
        itemStyle: { color: chartConfig.additionalConfig?.temperatureColor || '#FF6B6B' },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      },
      {
        name: 'Evapotranspiration',
        type: 'line',
        yAxisIndex: 2,
        data: processedData.map(d => [d.time, d.evapotranspiration]),
        lineStyle: { color: chartConfig.additionalConfig?.evapotranspirationColor || '#45B7D1' },
        itemStyle: { color: chartConfig.additionalConfig?.evapotranspirationColor || '#45B7D1' },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      },
      {
        name: 'Soil Moisture',
        type: 'line',
        yAxisIndex: 2,
        data: processedData.map(d => [d.time, d.soilMoisture]),
        lineStyle: { color: chartConfig.additionalConfig?.soilMoistureColor || '#FFA500' },
        itemStyle: { color: chartConfig.additionalConfig?.soilMoistureColor || '#FFA500' },
        symbol: chartConfig.additionalConfig?.showDataPoints ? 'circle' : 'none',
        symbolSize: chartConfig.additionalConfig?.dataPointSize || 4,
      }
    ],
    backgroundColor: muiTheme.palette.background.paper,
    textStyle: { color: muiTheme.palette.text.primary },
    dataZoom: chartConfig.additionalConfig?.enableZoom ? [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ] : undefined,
  };

  console.log("Final chart options:", chartOptions);
  return chartOptions;
};