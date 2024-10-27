// src/components/Widgets/SoilDataWidget/SoilDataWidget.js
import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, useTheme } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';
import { getSoilData } from '../../../services/soilDataService';

const DataRow = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={1}
      p={1}
      borderRadius={1}
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Typography variant="body2" color="textSecondary">{label}</Typography>
      <Typography variant="body1" color="primary" fontWeight="medium">{value}</Typography>
    </Box>
  );
};

function SoilDataWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoilData = async () => {
      if (config.latitude && config.longitude && !isDesignMode) {
        try {
          setLoading(true);
          const data = await getSoilData(config.latitude, config.longitude);
          setSoilData(data);
        } catch (err) {
          setError('Failed to fetch soil data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (isDesignMode) {
        // Use mock data in design mode
        setSoilData({
          t0: 22.5,
          t10: 20.1,
          moisture: 35.8
        });
        setLoading(false);
      } else {
        setError('Latitude and longitude not set');
        setLoading(false);
      }
    };

    fetchSoilData();
  }, [config.latitude, config.longitude, isDesignMode]);

  const handleMoreClick = () => {
    // Handle more options click
    console.log('More options clicked for SoilDataWidget');
    // You can implement additional functionality here, such as opening a modal with more options
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
      return <Typography color="error">{error}</Typography>;
    }

    if (soilData) {
      return (
        <>
          <DataRow label="Surface Temperature" value={soilData.t0 ? `${soilData.t0.toFixed(1)}°C` : 'N/A'} />
          <DataRow label="Temperature at 10cm depth" value={soilData.t10 ? `${soilData.t10.toFixed(1)}°C` : 'N/A'} />
          <DataRow label="Soil Moisture" value={soilData.moisture ? `${soilData.moisture.toFixed(1)}%` : 'N/A'} />
        </>
      );
    }

    return <Typography color="textSecondary">No soil data available</Typography>;
  };

  return (
    <WidgetWrapper 
      title={config.title || 'Soil Data'}
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
    >
      {renderContent()}
    </WidgetWrapper>
  );
}

export default SoilDataWidget;