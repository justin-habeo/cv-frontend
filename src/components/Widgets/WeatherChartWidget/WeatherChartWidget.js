import React, { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Typography, Box, Tabs, Tab, useTheme, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';
import { getWeatherForecast } from '../../../services/weatherService';
import apiService from '../../../services/apiService';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`weather-tabpanel-${index}`} aria-labelledby={`weather-tab-${index}`}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function WeatherChartWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const [tabValue, setTabValue] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const theme = useTheme();

  const fetchLocationDetails = useCallback(async (locationId) => {
    try {
      const response = await apiService.get(`/locations/${locationId}/`);
      setSelectedLocation(response.data);
    } catch (error) {
      console.error('Error fetching location details:', error);
      setError('Failed to fetch location details');
    }
  }, []);

  useEffect(() => {
    if (config.locationId) {
      fetchLocationDetails(config.locationId);
    } else {
      setSelectedLocation(null);
    }
  }, [config.locationId, fetchLocationDetails]);

  const fetchWeatherData = useCallback(async () => {
    if (isDesignMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let latitude, longitude;

    if (selectedLocation) {
      latitude = selectedLocation.latitude;
      longitude = selectedLocation.longitude;
    } else if (config.latitude && config.longitude) {
      latitude = config.latitude;
      longitude = config.longitude;
    } else {
      setError('No location selected');
      setLoading(false);
      return;
    }

    try {
      const data = await getWeatherForecast(latitude, longitude);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isDesignMode, selectedLocation, config.latitude, config.longitude]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const generateChartOption = useCallback(() => {
    if (!weatherData) return {};

    const times = weatherData.hourly.time.slice(0, 24).map(time => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const temperatures = weatherData.hourly.temperature_2m.slice(0, 24);
    const precipitation = weatherData.hourly.precipitation.slice(0, 24);

    return {
      backgroundColor: 'transparent',
      textStyle: { color: theme.palette.text.primary },
      title: {
        text: 'Hourly Weather Forecast',
        left: 'center',
        textStyle: { color: theme.palette.text.primary },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: theme.palette.divider },
        },
      },
      legend: {
        data: ['Temperature', 'Precipitation'],
        bottom: 10,
        textStyle: { color: theme.palette.text.secondary },
      },
      xAxis: [{
        type: 'category',
        data: times,
        axisPointer: { type: 'shadow' },
        axisLine: { lineStyle: { color: theme.palette.divider } },
        axisLabel: { color: theme.palette.text.secondary },
      }],
      yAxis: [
        {
          type: 'value',
          name: 'Temperature (°C)',
          axisLabel: {
            formatter: '{value} °C',
            color: theme.palette.text.secondary,
          },
          axisLine: { lineStyle: { color: theme.palette.divider } },
        },
        {
          type: 'value',
          name: 'Precipitation (mm)',
          axisLabel: {
            formatter: '{value} mm',
            color: theme.palette.text.secondary,
          },
          axisLine: { lineStyle: { color: theme.palette.divider } },
        }
      ],
      series: [
        {
          name: 'Temperature',
          type: 'line',
          data: temperatures,
          yAxisIndex: 0,
          itemStyle: { color: theme.palette.primary.main },
        },
        {
          name: 'Precipitation',
          type: 'bar',
          data: precipitation,
          yAxisIndex: 1,
          itemStyle: { color: theme.palette.secondary.main },
        }
      ]
    };
  }, [weatherData, theme]);

  const handleMoreClick = () => {
    console.log('More options clicked for WeatherChartWidget');
    // Implement additional functionality here
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="350px">
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    return (
      <>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {selectedLocation ? `Location: ${selectedLocation.name}` : 
           (config.latitude && config.longitude) ? `Coordinates: ${config.latitude}, ${config.longitude}` : 
           'No location set'}
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="weather forecast tabs">
          <Tab label="Hourly Forecast" />
          <Tab label="Daily Forecast" />
          <Tab label="Historical Weather" />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          {weatherData ? (
            <ReactECharts option={generateChartOption()} style={{ height: '300px' }} />
          ) : (
            <Typography color="textSecondary">No weather data available</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography color="textSecondary">Daily Forecast (To be implemented)</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography color="textSecondary">Historical Weather (To be implemented)</Typography>
        </TabPanel>
      </>
    );
  };

  return (
    <WidgetWrapper
      title={config.title || 'Weather Forecast'}
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
    >
      {isDesignMode ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1">Weather Chart Widget</Typography>
        </Box>
      ) : (
        renderContent()
      )}
    </WidgetWrapper>
  );
}

export default WeatherChartWidget;