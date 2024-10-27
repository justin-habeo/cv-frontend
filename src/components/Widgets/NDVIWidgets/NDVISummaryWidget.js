import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';
import { getNDVIData } from '../../../services/agroMonitoringService';

function NDVISummaryWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const [ndviData, setNDVIData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleMoreClick = () => {
    console.log('More options clicked for NDVISummaryWidget');
    // Implement additional functionality here
  };

  const renderContent = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    const latestData = ndviData && ndviData.length > 0 ? ndviData[ndviData.length - 1].data : null;

    return latestData ? (
      <Box>
        <Typography variant="body1">Max NDVI: {latestData.max.toFixed(2)}</Typography>
        <Typography variant="body1">Mean NDVI: {latestData.mean.toFixed(2)}</Typography>
        <Typography variant="body1">Min NDVI: {latestData.min.toFixed(2)}</Typography>
        <Typography variant="caption" color="textSecondary">
          Date: {new Date(ndviData[ndviData.length - 1].dt * 1000).toLocaleDateString()}
        </Typography>
      </Box>
    ) : (
      <Typography color="textSecondary">No NDVI data available</Typography>
    );
  };

  return (
    <WidgetWrapper
      title={config.title || 'NDVI Summary'}
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
    >
      {isDesignMode ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1">NDVI Summary Widget</Typography>
        </Box>
      ) : (
        renderContent()
      )}
    </WidgetWrapper>
  );
}

export default NDVISummaryWidget;