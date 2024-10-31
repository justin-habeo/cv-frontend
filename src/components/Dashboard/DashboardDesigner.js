/**
 * s10-smartgrow-frontend License
 * 
 * Copyright © 2024, Justin Morris Albertyn
 * 
 * Use of this software is restricted to projects where the copyright holder or authorized developer is directly involved.
 * For more details, see the LICENSE file in the project root.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, useTheme } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { styled } from '@mui/material/styles';
import DashboardConfig from './DashboardConfig';
import WidgetRegistry from '../Widgets/WidgetRegistry';
import PolygonDrawingTool from './PolygonDrawingTool';
import ZoneDrawingTool from './ZoneDrawingTool';
import HybridChartDesigner from './HybridChartDesigner';
import apiService from '../../services/apiService';
import LocationSetup from '../LocationSetup/LocationSetup';
import debounce from 'lodash/debounce';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useBrand } from '../../contexts/BrandContext';
import ErrorBoundary from './ErrorBoundary';

const ResponsiveGridLayout = WidthProvider(Responsive);

const SIDEBAR_WIDTH = 240;
const COLLAPSED_SIDEBAR_WIDTH = 64;
const CONTENT_MARGIN = 10;
const BUTTON_ROW_HEIGHT = 48;

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

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  padding: theme.spacing(0.5, 1),
  minWidth: 'auto',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

function DashboardDesigner({ selectedDashboard, selectedSite, isSidebarOpen, sidebarWidth, isDesignMode, onToggle, containerWidth }) {
  const [config, setConfig] = useState({ widgets: [] });
  const [configOpen, setConfigOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [isPolygonDrawerOpen, setIsPolygonDrawerOpen] = useState(false);
  const [isZoneDrawerOpen, setIsZoneDrawerOpen] = useState(false);
  const [isLocationSetupOpen, setIsLocationSetupOpen] = useState(false);
  const [isHybridChartDesignerOpen, setIsHybridChartDesignerOpen] = useState(false); // Add this state
  const { currentTheme, toggleTheme } = useCustomTheme();
  const [chartConfigs, setChartConfigs] = useState([]);
  const { brand, toggleBrand } = useBrand();
  const theme = useTheme();

  const fetchChartConfigs = useCallback(async () => {
    try {
      const response = await apiService.get(`/chart-configs/?site=${selectedSite}`);
      setChartConfigs(response.data);
    } catch (error) {
      console.error('Error fetching chart configurations:', error);
    }
  }, [selectedSite]);
  
  const fetchConfig = useCallback(async () => {
    if (!selectedDashboard) {
      setConfig({ widgets: [] });
      setDashboardName('');
      return;
    }
  
    try {
      const response = await apiService.get(`/dashboards/${selectedDashboard}/`);
      const fetchedConfig = response.data.config || { widgets: [] };
      setDashboardName(response.data.name);

      const updatedWidgets = fetchedConfig.widgets
        .filter(widget => widget.type && widget.layout)
        .map((widget, index) => ({
          ...widget,
          layout: {
            x: widget.layout?.x ?? 0,
            y: widget.layout?.y ?? index * 2,
            w: widget.layout?.w ?? 3,
            h: widget.layout?.h ?? 2,
            i: widget.layout?.i ?? index.toString()
          }
        }));
      
      setConfig({ ...fetchedConfig, widgets: updatedWidgets });
    } catch (error) {
      console.error('Error fetching dashboard config:', error);
      setConfig({ widgets: [] });
    }
  }, [selectedDashboard]);

  useEffect(() => {
    fetchConfig();
    fetchChartConfigs();
  }, [fetchConfig, fetchChartConfigs]);

  const saveConfig = useCallback(
    debounce(async (updatedConfig) => {
      if (!selectedDashboard || !dashboardName || !updatedConfig.widgets) return;

      try {
        const dataToSend = {
          name: dashboardName,
          config: updatedConfig,
          site: selectedSite
        };
        await apiService.put(`/dashboards/${selectedDashboard}/`, dataToSend);
      } catch (error) {
        console.error('Error saving dashboard config:', error);
      }
    }, 1000),
    [selectedDashboard, dashboardName, selectedSite]
  );

  const handleOpenConfig = async () => {
    await Promise.all([fetchConfig(), fetchChartConfigs()]);
    setConfigOpen(true);
  };

  const handleConfigSave = async (newConfig) => {
    const updatedWidgets = newConfig.widgets.map(widget => ({
      ...widget,
      config: {
        ...widget.config,
        title: widget.config.title || `Untitled ${widget.type}`,
      },
      layout: {
        ...widget.layout,
        w: Math.max(widget.minWidth || 1, Math.min(widget.maxWidth || Infinity, widget.layout.w)),
        h: Math.max(widget.minHeight || 1, Math.min(widget.maxHeight || Infinity, widget.layout.h)),
      },
    }));

    const updatedConfig = { ...newConfig, widgets: updatedWidgets };
    setConfig(updatedConfig);
    setDashboardName(newConfig.name || dashboardName);
    saveConfig(updatedConfig);
  };

  const handleLayoutChange = (layout) => {
    const updatedWidgets = config.widgets.map((widget) => {
      const newLayout = layout.find(l => l.i === widget.layout.i) || widget.layout;
      return {
        ...widget,
        layout: {
          x: newLayout.x,
          y: newLayout.y,
          w: newLayout.w,
          h: newLayout.h,
          i: newLayout.i
        }
      };
    });
    setConfig(prevConfig => ({ ...prevConfig, widgets: updatedWidgets }));
    saveConfig({ ...config, widgets: updatedWidgets });
  };

  const updateWidgetConfig = (widgetId, newConfig) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      widgets: prevConfig.widgets.map(widget => 
        widget.layout.i === widgetId
          ? { ...widget, config: { ...widget.config, ...newConfig } }
          : widget
      )
    }));
  };

  const handlePolygonCreated = (newPolygon) => {
    console.log('New polygon created:', newPolygon);
    // Add logic to handle the new polygon (e.g., add it to a list of polygons)
  };

  const handleZoneCreated = (newZone) => {
    console.log('New zone created:', newZone);
    // Add logic to handle the new zone (e.g., add it to a list of zones)
  };

  const handleChartCreated = async (chartConfig) => {
    try {
      const response = await apiService.post('/chart-configs/', {
        ...chartConfig,
        site: selectedSite
      });
      console.log('New chart configuration created:', response.data);
      await fetchChartConfigs(); // Refresh the chart configurations
    } catch (error) {
      console.error('Error creating chart configuration:', error);
    }
  };
  
  const handleHybridChartCreated = useCallback(async (chartConfig) => {
    try {
      console.log('Saving hybrid chart configuration:', chartConfig);
      const response = await apiService.post('/chart-configs/', {
        ...chartConfig,
        site: selectedSite
      });
      console.log('New hybrid chart configuration created:', response.data);
      await fetchChartConfigs(); // Refresh the chart configurations
      setIsHybridChartDesignerOpen(false);
    } catch (error) {
      console.error('Error creating hybrid chart configuration:', error);
    }
  }, [selectedSite, fetchChartConfigs]);

  if (!selectedDashboard) {
    return <Typography variant="h4">Please select a dashboard to design</Typography>;
  }

  return (
    <StyledBox>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        height: `${BUTTON_ROW_HEIGHT}px`,
        padding: '0 16px',
        backgroundColor: theme.palette.primary.main,
      }}>
        <StyledButton 
          onClick={handleOpenConfig}
          variant="contained" 
          color="primary"
          size="small"
        >
          Add/Remove Widgets
        </StyledButton>
        <StyledButton 
          onClick={() => setIsPolygonDrawerOpen(true)} 
          variant="contained" 
          color="secondary"
          size="small"
        >
          Draw Polygon
        </StyledButton>
        <StyledButton 
          onClick={() => setIsZoneDrawerOpen(true)} 
          variant="contained" 
          color="secondary"
          size="small"
        >
          Draw Zone
        </StyledButton>
        <StyledButton 
          onClick={() => setIsHybridChartDesignerOpen(true)} 
          variant="contained" 
          color="primary"
          size="small"
        >
          Create Hybrid Chart
        </StyledButton>
        <StyledButton 
          onClick={() => setIsLocationSetupOpen(true)} 
          variant="contained" 
          color="primary"
          size="small"
        >
          SETUP LOCATIONS
        </StyledButton>
        <StyledButton 
          onClick={() => {
            fetchConfig();
            fetchChartConfigs();
          }} 
          variant="contained" 
          color="primary"
          size="small"
        >
          Refresh Dashboard
        </StyledButton>
        
        <StyledButton 
          onClick={toggleBrand} 
          variant="contained" 
          color="primary"
          size="small"
        >
          Switch to {brand === 'smartgrow' ? 'SmartMode' : 'SmartMode'}
        </StyledButton>
      </Box>
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        width: '100%',
        height: `calc(100% - ${BUTTON_ROW_HEIGHT}px)`,
      }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: config.widgets.map(widget => widget.layout) }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          margin={[CONTENT_MARGIN, CONTENT_MARGIN]}
          containerPadding={[0, 0]}
          onLayoutChange={handleLayoutChange}
          isDraggable={isDesignMode}
          isResizable={isDesignMode}
          width={containerWidth}
        >
          {config.widgets.map((widget) => {
            const WidgetComponent = WidgetRegistry[widget.type]?.component;
            return WidgetComponent ? (
              <div key={widget.layout.i} data-grid={{
                ...widget.layout,
                minW: widget.minWidth,
                minH: widget.minHeight,
                maxW: widget.maxWidth,
                maxH: widget.maxHeight,
                isDraggable: isDesignMode,
                isResizable: isDesignMode,
              }}>
                <StyledPaper>
                  <ErrorBoundary key={widget.id}>
                    <WidgetComponent 
                      config={widget.config} 
                      updateConfig={(newConfig) => updateWidgetConfig(widget.layout.i, newConfig)}
                      widgetType={widget.type}
                      isDesignMode={isDesignMode}
                    />
                  </ErrorBoundary>
                </StyledPaper>
              </div>
            ) : null;
          })}
        </ResponsiveGridLayout>
      </Box>
      <DashboardConfig
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onSave={handleConfigSave}
        config={config}
        dashboardName={dashboardName}
        selectedSite={selectedSite}
        dashboardId={selectedDashboard}
        chartConfigs={chartConfigs}
        refreshChartConfigs={fetchChartConfigs}
      />
      <StyledDialog open={isPolygonDrawerOpen} onClose={() => setIsPolygonDrawerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Draw Polygon</DialogTitle>
        <DialogContent>
          <PolygonDrawingTool 
            siteId={selectedSite} 
            onPolygonCreated={handlePolygonCreated}
            onClose={() => setIsPolygonDrawerOpen(false)}
          />
        </DialogContent>
      </StyledDialog>
      <StyledDialog open={isZoneDrawerOpen} onClose={() => setIsZoneDrawerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Draw Zone</DialogTitle>
        <DialogContent>
          <ZoneDrawingTool 
            siteId={selectedSite} 
            onZoneCreated={handleZoneCreated}
            onClose={() => setIsZoneDrawerOpen(false)}
          />
        </DialogContent>
      </StyledDialog>
      <StyledDialog open={isHybridChartDesignerOpen} onClose={() => setIsHybridChartDesignerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Hybrid Chart</DialogTitle>
        <DialogContent>
          <HybridChartDesigner
            siteId={selectedSite}
            onSave={handleHybridChartCreated}
            onClose={() => setIsHybridChartDesignerOpen(false)}
          />
        </DialogContent>
      </StyledDialog>
      <LocationSetup 
        open={isLocationSetupOpen} 
        onClose={() => setIsLocationSetupOpen(false)} 
        siteId={selectedSite}
      />
    </StyledBox>
  );

}

export default DashboardDesigner;
