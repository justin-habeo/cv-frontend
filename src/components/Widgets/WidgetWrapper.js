import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const WidgetWrapper = ({ title, children, onMoreClick, showHeader = true }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          p: showHeader ? 2 : 0,
          '& > .widget-content': {
            padding: showHeader ? 0 : '2mm',
          }
        }}
      >
        {showHeader && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2" color="black">
              {title}
            </Typography>
            <IconButton onClick={onMoreClick} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
        <Box flex={1} overflow="auto" className="widget-content">
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WidgetWrapper;