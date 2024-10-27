

// src/Widgets/YoloWidgets/PeopleCounterWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';

const PeopleCounterWidget = ({ config, showHeader = true }) => {
  const [counts, setCounts] = useState({ current: 0, entering: 0, exiting: 0 });
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://your-backend/ws/cv/zone/${config.zoneId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setLoading(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'detection_update') {
        setCounts(prevCounts => ({
          ...prevCounts,
          current: data.data.person_count
        }));
      }
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [config.zoneId]);

  return (
    <WidgetWrapper title={config.title} showHeader={showHeader}>
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h3" component="div">
              {counts.current}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              People in Zone
            </Typography>
          </>
        )}
      </Box>
    </WidgetWrapper>
  );
};

export default PeopleCounterWidget;
