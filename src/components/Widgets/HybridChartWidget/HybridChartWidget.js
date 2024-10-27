import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Typography, Box, CircularProgress, useTheme } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { fetchAggregatedChartData } from '../../../services/aggregatedChartDataService';
import WidgetWrapper from '../WidgetWrapper';
import hybridChartTypes from '../../hybridChartTypes';

function HybridChartWidget({ config, isDesignMode, updateConfig, siteId, showHeader  }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();

  const chartConfigRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  const loadData = useCallback(async () => {
    console.log('loadData called');
    if (isDesignMode) {
      setLoading(false);
      return;
    }

    if (!config || !config.chartConfigId) {
      setError('Invalid chart configuration');
      setLoading(false);
      return;
    }

    try {
      const result = await fetchAggregatedChartData({
        ...config,
        overrideLocationId: config.overrideLocationId,
        siteId: siteId
      });
      console.log('Data fetched:', result);
      setData(result.data);
      chartConfigRef.current = result.chartConfig;
      console.log('Chart config updated:', chartConfigRef.current);
      setLoading(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error loading chart data:', err);
      setError(`Failed to load chart data: ${err.message}`);
      setLoading(false);
    }
  }, [config, isDesignMode, siteId]);

  useEffect(() => {
    console.log('Initial loadData effect');
    loadData();
  }, [loadData]);

  useEffect(() => {
    console.log('Refresh interval effect triggered');
    const setupRefreshInterval = () => {
      if (refreshIntervalRef.current) {
        console.log('Clearing existing interval');
        clearInterval(refreshIntervalRef.current);
      }

      // Look for refreshInterval at the top level of the config
      const refreshInterval = config.refreshInterval || 
                              (chartConfigRef.current && chartConfigRef.current.refreshInterval);

      console.log('Detected refresh interval:', refreshInterval);

      if (refreshInterval && refreshInterval > 0) {
        console.log(`Setting up refresh interval: ${refreshInterval} seconds`);
        refreshIntervalRef.current = setInterval(() => {
          console.log('Refresh interval triggered, calling loadData');
          loadData();
        }, refreshInterval * 1000);
      } else {
        console.log('No valid refresh interval found');
      }
    };

    setupRefreshInterval();

    return () => {
      if (refreshIntervalRef.current) {
        console.log('Cleanup: clearing interval');
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadData, refreshKey, config]);

  const getChartOptions = useCallback(() => {
    if (!data || data.length === 0 || !chartConfigRef.current) {
      console.log('No data or chart config available for options');
      return {};
    }
  
    const chartTypeFunction = hybridChartTypes[chartConfigRef.current.chartType];
    if (!chartTypeFunction) {
      console.error(`Chart type function not found for: ${chartConfigRef.current.chartType}`);
      return {};
    }
  
    const series = data.map(seriesData => ({
      name: seriesData.name,
      type: 'line',
      data: seriesData.data.map(item => [item.time, item.value])
    }));
  
    return chartTypeFunction(data, { ...chartConfigRef.current, series }, theme);
  }, [data, theme]);

  const renderContent = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    return (
      <ReactECharts
        option={getChartOptions()}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    );
  };

  return (
    <WidgetWrapper
      title={config.title || 'Hybrid Chart'}
      showHeader={showHeader}
      onMoreClick={() => {}}
    >
      {isDesignMode ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1">Hybrid Chart Widget</Typography>
        </Box>
      ) : (
        renderContent()
      )}
    </WidgetWrapper>
  );
}

export default HybridChartWidget;