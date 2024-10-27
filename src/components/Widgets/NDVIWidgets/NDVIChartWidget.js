import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import WidgetWrapper from '../WidgetWrapper';
import { getNDVIData } from '../../../services/agroMonitoringService';

function NDVIChartWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const [ndviData, setNDVIData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (isDesignMode) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        if (!config.agromonitoringPolygonId) {
          setError('No polygon selected');
          return;
        }
        if (!config.startDate || !config.endDate) {
          setError('Start and end dates are required');
          return;
        }
        const data = await getNDVIData(config.agromonitoringPolygonId, config.startDate, config.endDate);
        setNDVIData(data.ndvi_data);
      } catch (err) {
        setError('Failed to fetch NDVI data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [config.agromonitoringPolygonId, config.startDate, config.endDate, isDesignMode]);

  const chartOptions = {
    title: {
      text: 'NDVI Over Time',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ndviData ? ndviData.map(d => new Date(d.dt * 1000).toLocaleDateString()) : [],
      axisLabel: {
        color: theme.palette.text.secondary,
      },
    },
    yAxis: {
      type: 'value',
      name: 'NDVI Value',
      axisLabel: {
        color: theme.palette.text.secondary,
      },
    },
    series: [{
      data: ndviData ? ndviData.map(d => d.data.mean) : [],
      type: 'line',
      name: 'NDVI',
      itemStyle: {
        color: theme.palette.primary.main,
      },
    }],
    backgroundColor: 'transparent',
  };

  const handleMoreClick = () => {
    console.log('More options clicked for NDVIChartWidget');
    // Implement additional functionality here
  };

  const renderContent = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    return (
      <Box height="100%">
        <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
      </Box>
    );
  };

  return (
    <WidgetWrapper
      title={config.title || 'NDVI Chart'}
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
    >
      {isDesignMode ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1">NDVI Chart Widget</Typography>
        </Box>
      ) : (
        renderContent()
      )}
    </WidgetWrapper>
  );
}

export default NDVIChartWidget;