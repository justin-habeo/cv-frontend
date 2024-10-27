// src/components/Widgets/SingleStatWidgets/SingleStatGradeGaugeWidget.js

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import WidgetWrapper from '../WidgetWrapper';
import influxDBService from '../../../services/influxDBService';
import apiService from '../../../services/apiService';

function SingleStatGradeGaugeWidget({ config, isDesignMode, showHeader }) {
  const [sensorData, setSensorData] = useState(null);
  const [valueRangeProfile, setValueRangeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('Widget config:', config);

  const fetchValueRangeProfile = useCallback(async () => {
    if (config.valueRangeProfileId) {
      try {
        const response = await apiService.get(`/value-range-profiles/${config.valueRangeProfileId}/`);
        console.log('Value Range Profile:', response.data);
        setValueRangeProfile(response.data);
      } catch (error) {
        console.error('Error fetching value range profile:', error);
        setError('Error fetching value range profile');
      }
    }
  }, [config.valueRangeProfileId]);

  const fetchSensorData = useCallback(async () => {
    if (isDesignMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = `from(bucket:"${config.bucket}")
        |> range(start: -${config.timeRange || '1h'})
        |> filter(fn: (r) => r._measurement == "sensor_reading" and r.sensor_id == "${config.sensorId}")
        |> last()`;
      
      const response = await influxDBService.fetchInfluxDBData(query, config.bucket, config.siteId);
      console.log('Sensor Data Response:', response);

      if (response && response.length > 0) {
        setSensorData(prevData => ({
          ...prevData,
          ...response[0],
          _value: response[0]._value,
          _time: response[0]._time
        }));
        setError(null);
      } else {
        setError('No recent data available');
        setSensorData(null);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('Error fetching sensor data');
      setSensorData(null);
    } finally {
      setLoading(false);
    }
  }, [config.bucket, config.sensorId, config.siteId, config.timeRange, isDesignMode]);

  useEffect(() => {
    fetchValueRangeProfile();
  }, [fetchValueRangeProfile]);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, (config.refreshInterval || 5) * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSensorData, config.refreshInterval]);

  const getChartOptions = () => {
    if (!valueRangeProfile || !sensorData) return {};
  
    const value = sensorData._value;
    const ranges = valueRangeProfile.ranges.sort((a, b) => a.lower_bound - b.lower_bound);
    const min = ranges[0].lower_bound;
    const max = ranges[ranges.length - 1].upper_bound;
  
    const axisLine = {
      lineStyle: {
        width: 30,
        color: ranges.map(range => [
          (range.upper_bound - min) / (max - min),
          range.color
        ])
      }
    };
  
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: min,
          max: max,
          splitNumber: ranges.length,
          radius: '100%', // Use 100% of the available radius
          center: ['50%', '60%'], // Move the center slightly down
          axisLine: axisLine,
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '60%', // Increase pointer length
            width: 16,
            offsetCenter: [0, '-10%'],
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 5
            }
          },
          axisLabel: {
            color: '#464646',
            fontSize: 16,
            distance: -50,
            formatter: function (value) {
              return value.toFixed(0);
            }
          },
          title: {
            offsetCenter: [0, '20%'],
            fontSize: 20
          },
          detail: {
            fontSize: 40,
            offsetCenter: [0, '60%'],
            valueAnimation: true,
            formatter: function (value) {
              return value.toFixed(1) + config.unit;
            },
            color: 'auto'
          },
          data: [{
            value: value,
            name: config.sensor?.name || 'Sensor'
          }]
        }
      ]
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    return (
      <ReactECharts
        option={getChartOptions()}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    );
  };

  return (
    <WidgetWrapper title={config.title || 'Grade Gauge'} showHeader={showHeader}>
      <Box height="100%" width="100%">
        {renderContent()}
      </Box>
    </WidgetWrapper>
  );
}

export default SingleStatGradeGaugeWidget;
