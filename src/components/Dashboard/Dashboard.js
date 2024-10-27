/**
 * s10-smartgrow-frontend License
 * 
 * Copyright © 2024, Justin Morris Albertyn
 * 
 * Use of this software is restricted to projects where the copyright holder or authorized developer is directly involved.
 * For more details, see the LICENSE file in the project root.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import WidgetRegistry from '../Widgets/WidgetRegistry';
import apiService from '../../services/apiService';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { styled } from '@mui/material/styles';
import ErrorBoundary from './ErrorBoundary';

const ResponsiveGridLayout = WidthProvider(Responsive);

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  margin: 0,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

function Dashboard({ selectedDashboard, isSidebarOpen, sidebarWidth, isDesignMode, onToggle, containerWidth, siteId  }) {
  const [config, setConfig] = useState({ widgets: [] });
  const [dashboardName, setDashboardName] = useState('');
  const theme = useTheme();

  const fetchConfig = useCallback(async () => {
    if (!selectedDashboard) {
      return <Typography variant="h4">Please select a dashboard</Typography>;
    }

    try {
      const response = await apiService.get(`/dashboards/${selectedDashboard}/`);
      console.log('Raw response from API:', response);
      
      if (response.data && response.data.id) {
        const fetchedConfig = response.data.config || { widgets: [] };
        console.log('Config data:', fetchedConfig);

        setDashboardName(response.data.name);

        const updatedWidgets = fetchedConfig.widgets
          .filter(widget => widget.type && widget.layout)
          .map((widget, index) => {
            const layout = widget.layout || {};
            return {
              ...widget,
              layout: {
                x: layout.x ?? 0,
                y: layout.y ?? index * 2,
                w: layout.w ?? 3,
                h: layout.h ?? 2,
                i: layout.i ?? index.toString()
              }
            };
          });
        console.log('Fetched dashboard config:', { ...fetchedConfig, widgets: updatedWidgets });
        setConfig({ ...fetchedConfig, widgets: updatedWidgets });
      } else {
        console.error('No dashboard configuration found or invalid data structure');
        setConfig({ widgets: [] });
      }
    } catch (error) {
      console.error('Error fetching dashboard config:', error);
      setConfig({ widgets: [] });
    }
  }, [selectedDashboard]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig, selectedDashboard]);

  useEffect(() => {
    if (config && config.widgets && config.widgets.length > 0) {
      // Process widgets
    } else {
      console.log('No widgets found for this dashboard');
    }
  }, [config]);

  console.log('Current config in Dashboard:', config);

  if (!selectedDashboard) {
    return <Typography variant="h4">Please select a dashboard</Typography>;
  }

  const contentWidth = `calc(100vw - ${isSidebarOpen ? sidebarWidth : 64}px)`;
  const marginLeft = isSidebarOpen ? `${sidebarWidth}px` : '64px';

  return (
    <StyledBox>
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        width: '100%',
        height: '100%',
      }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: config.widgets.map(widget => widget.layout) }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={false}
          isResizable={false}
          margin={[10, 10]}
          containerPadding={[0, 0]}
          width={containerWidth}
        >
          {config.widgets.map((widget, index) => {
            const WidgetComponent = WidgetRegistry[widget.type]?.component;
            return WidgetComponent ? (
              <div key={widget.layout.i} data-grid={widget.layout}>
                <StyledPaper>
                  <ErrorBoundary key={widget.id}>
                    <WidgetComponent 
                      key={`${widget.layout.i}-${isDesignMode}`}
                      config={{
                        ...widget.config,
                        dashboardId: selectedDashboard,
                      }}
                      widgetType={widget.type} 
                      isDesignMode={isDesignMode}
                      siteId={siteId} 
                      showHeader={widget.config.showHeader !== false} 
                    />
                  </ErrorBoundary>
                </StyledPaper>
              </div>
            ) : null;
          })}
          </ResponsiveGridLayout>
        </Box>
      </StyledBox>
  );
}

export default Dashboard;