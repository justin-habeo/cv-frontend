import React, { useState, useEffect } from 'react';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControl, InputLabel, Select, MenuItem, Grid, Typography, TextField, IconButton, CircularProgress,
  useTheme, Snackbar, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import MuiAlert from '@mui/material/Alert';
import WidgetRegistry from '../Widgets/WidgetRegistry';
import HybridChartDesigner from './HybridChartDesigner';
import LocationSetup from '../LocationSetup/LocationSetup';
import ManualDataCaptureConfigDesigner from './ManualDataCaptureConfigDesigner';
import apiService from '../../services/apiService';
import { getPolygonInfo, getPolygonsForSite } from '../../services/agroMonitoringService';

// Import widget-specific configurations
import SensorMapWidgetConfig from '../Widgets/SensorMapWidget/SensorMapWidgetConfig';
import HybridChartWidgetConfig from '../Widgets/HybridChartWidget/HybridChartWidgetConfig';
import NDVIChartWidgetConfig from '../Widgets/NDVIWidgets/NDVIChartWidgetConfig';
import NDVIImageryWidgetConfig from '../Widgets/NDVIWidgets/NDVIImageryWidgetConfig';
import NDVISummaryWidgetConfig from '../Widgets/NDVIWidgets/NDVISummaryWidgetConfig';
import SoilDataWidgetConfig from '../Widgets/SoilDataWidget/SoilDataWidgetConfig';
import WeatherChartWidgetConfig from '../Widgets/WeatherChartWidget/WeatherChartWidgetConfig';
import ManualDataEntryWidgetConfig from '../Widgets/ManualDataEntryWidget/ManualDataEntryWidgetConfig';
import ManualSensorSimulatorWidgetConfig from '../Widgets/ManualSensorSimulatorWidget/ManualSensorSimulatorWidgetConfig';
import WaterReadingCaptureWidgetConfig from '../Widgets/WaterReadingCaptureWidget/WaterReadingCaptureWidgetConfig';
import SingleStatSensorWidgetConfig from '../Widgets/SingleStatWidgets/SingleStatSensorWidgetConfig';
import SingleStatGradeGaugeWidgetConfig from '../Widgets/SingleStatWidgets/SingleStatGradeGaugeWidgetConfig';
import ImageDisplayWidgetConfig from '../Widgets/ImageDisplayWidget/ImageDisplayWidgetConfig';
import PeopleCounterWidgetConfig from '../Widgets/YoloWidgets/PeopleCounterWidgetConfig';
import CameraStreamWidgetConfig from '../Widgets/YoloWidgets/CameraStreamWidgetConfig';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSelect-icon': {
    color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
  },
}));

function DashboardConfig({ 
  open, 
  onClose, 
  onSave, 
  config, 
  dashboardName, 
  selectedSite, 
  dashboardId, 
  chartConfigs,
  refreshChartConfigs
}) {
  const [localConfig, setLocalConfig] = useState({ widgets: [] });
  const [loadingPolygonInfo, setLoadingPolygonInfo] = useState(false);
  const [sitePolygons, setSitePolygons] = useState([]);
  const [loadingPolygons, setLoadingPolygons] = useState(false);
  const [polygonError, setPolygonError] = useState(null);
  const [chartConfigurations, setChartConfigurations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLocationSetupOpen, setIsLocationSetupOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [manualDataCaptureConfigs, setManualDataCaptureConfigs] = useState([]);
  const [isManualDataCaptureConfigOpen, setIsManualDataCaptureConfigOpen] = useState(false);
  const [siteSensors, setSiteSensors] = useState([]);
  const [isHybridChartDesignerOpen, setIsHybridChartDesignerOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      refreshChartConfigs();
      fetchChartConfigurations(selectedSite);
    }
  }, [open, refreshChartConfigs, selectedSite]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);


  useEffect(() => {
    if (selectedSite) {
      fetchSiteSensors();
    }
  }, [selectedSite]);
  
  const fetchSiteSensors = async () => {
    try {
      const response = await apiService.get(`/sensors/?site=${selectedSite}`);
      setSiteSensors(response.data);
    } catch (error) {
      console.error('Error fetching site sensors:', error);
    }
  };
  
  useEffect(() => {
    if (selectedSite) {
      fetchSitePolygons(selectedSite);
      fetchChartConfigurations(selectedSite);
      fetchLocations(selectedSite);
      fetchManualDataCaptureConfigs(selectedSite);
    }
  }, [selectedSite]);

  const fetchSitePolygons = async (siteId) => {
    setLoadingPolygons(true);
    setPolygonError(null);
    try {
      const polygons = await getPolygonsForSite(siteId);
      setSitePolygons(polygons);
    } catch (error) {
      console.error('Error fetching site polygons:', error);
      setPolygonError('Failed to fetch polygons. Please try again.');
    } finally {
      setLoadingPolygons(false);
    }
  };

  const fetchChartConfigurations = async (siteId) => {
    try {
      const response = await apiService.get(`/chart-configs/by_site/?site=${siteId}`);
      setChartConfigurations(response.data);
    } catch (error) {
      console.error('Error fetching chart configurations:', error);
    }
  };

  const fetchLocations = async (siteId) => {
    try {
      const response = await apiService.get(`/locations/?site=${siteId}`);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  
  const fetchManualDataCaptureConfigs = async (siteId) => {
    try {
      const response = await apiService.get(`/manual-data-capture-configs/by-site/?site=${siteId}`);
      setManualDataCaptureConfigs(response.data);
    } catch (error) {
      console.error('Error fetching manual data capture configs:', error);
    }
  };

  const handleLocationCreated = (newLocation) => {
    setLocations(prevLocations => [...prevLocations, newLocation]);
    setIsLocationSetupOpen(false);
  };

  const handleManualDataCaptureConfigCreated = (newConfig) => {
    setManualDataCaptureConfigs(prevConfigs => [...prevConfigs, newConfig]);
    setIsManualDataCaptureConfigOpen(false);
  };

  const handlePolygonIdChange = async (index, agromonitoringPolygonId) => {
    setLoadingPolygonInfo(true);
    try {
      const polygonInfo = await getPolygonInfo(agromonitoringPolygonId);
      setLocalConfig(prevConfig => {
        const newWidgets = [...prevConfig.widgets];
        newWidgets[index] = {
          ...newWidgets[index],
          config: {
            ...newWidgets[index].config,
            agromonitoringPolygonId,
            bounds: {
              topLeft: [polygonInfo.geo_json.coordinates[0][0][1], polygonInfo.geo_json.coordinates[0][0][0]],
              bottomRight: [polygonInfo.geo_json.coordinates[0][2][1], polygonInfo.geo_json.coordinates[0][2][0]]
            }
          }
        };
        return { ...prevConfig, widgets: newWidgets };
      });
    } catch (error) {
      console.error('Error fetching polygon info:', error);
      setPolygonError('Failed to fetch polygon information. Please try again.');
    } finally {
      setLoadingPolygonInfo(false);
    }
  };

  const handleAddWidget = () => {
    setLocalConfig(prevConfig => {
      const newWidgets = [
        ...prevConfig.widgets, 
        { 
          type: '', 
          config: {
            title: 'New Widget',
            currentDate: new Date().toISOString().split('T')[0],
          },
          layout: { x: 0, y: Infinity, w: 3, h: 2, i: Date.now().toString() }
        }
      ];
      // Force the new widget's accordion to be expanded
      setTimeout(() => {
        const accordions = document.querySelectorAll('.MuiAccordion-root');
        if (accordions.length > 0) {
          const lastAccordion = accordions[accordions.length - 1];
          lastAccordion.classList.add('Mui-expanded');
          const accordionDetails = lastAccordion.querySelector('.MuiAccordionDetails-root');
          if (accordionDetails) {
            accordionDetails.style.display = 'block';
          }
        }
      }, 0);
      return { ...prevConfig, widgets: newWidgets };
    });
  };


  const handleDeleteWidget = (index) => {
    setLocalConfig(prevConfig => ({
      ...prevConfig,
      widgets: prevConfig.widgets.filter((_, i) => i !== index)
    }));
  };

  const handleWidgetChange = (index, field, value) => {
    setLocalConfig(prevConfig => {
      const newWidgets = [...prevConfig.widgets];
      if (field === 'type') {
        newWidgets[index] = { 
          ...newWidgets[index], 
          type: value, 
          config: {
            ...newWidgets[index].config,
            title: `New ${value}`,
            showHeader: true, // Set default value for new widgets
          }
        };
      } else if (field.startsWith('config.')) {
        const configField = field.split('config.')[1];
        newWidgets[index] = { 
          ...newWidgets[index], 
          config: {
            ...newWidgets[index].config,
            [configField]: value
          }
        };
      } else {
        newWidgets[index] = { ...newWidgets[index], [field]: value };
      }
      return { ...prevConfig, widgets: newWidgets };
    });
  };

  const handleSave = () => {
    const updatedConfig = {
      ...localConfig,
      name: dashboardName,
      siteId: selectedSite,
      widgets: localConfig.widgets.map(widget => ({
        ...widget,
        config: {
          ...widget.config,
          dashboardId: dashboardId,
        },
      })),
    };
    console.log('Saving configuration:', updatedConfig);
    onSave(updatedConfig);
    onClose();
  };

  const handleSaveChartConfig = async (chartConfig) => {
    try {
      const response = await apiService.post('/api/v1/chart-configs/', {
        ...chartConfig,
        site: selectedSite
      });
      await fetchChartConfigurations(selectedSite);
    } catch (error) {
      console.error('Error saving chart configuration:', error);
    }
  };
  
  const handleSaveHybridChartConfig = async (chartConfig) => {
    try {
      const response = await apiService.post('/api/v1/chart-configs/', {
        ...chartConfig,
        site: selectedSite
      });
      await fetchChartConfigurations(selectedSite);
    } catch (error) {
      console.error('Error saving hybrid chart configuration:', error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const renderWidgetSpecificOptions = (widget, index) => {
    const commonProps = {
      widget,
      index,
      handleWidgetChange,
      locations,
      sitePolygons,
      selectedSite,
      chartConfigurations,
      setIsLocationSetupOpen,
      handlePolygonIdChange,
      manualDataCaptureConfigs,
    };
  
    switch (widget.type) {
      case 'SensorMapWidget':
        return <SensorMapWidgetConfig {...commonProps} />;
      case 'HybridChartWidget':
          return <HybridChartWidgetConfig {...commonProps} />;
      case 'NDVIChartWidget':
        return <NDVIChartWidgetConfig {...commonProps} />;
      case 'NDVIImageryWidget':
        return <NDVIImageryWidgetConfig {...commonProps} />;
      case 'NDVISummaryWidget':
        return <NDVISummaryWidgetConfig {...commonProps} />;
      case 'SoilDataWidget':
        return <SoilDataWidgetConfig {...commonProps} />;
      case 'WeatherChartWidget':
        return <WeatherChartWidgetConfig {...commonProps} />;
      case 'ManualDataEntryWidget':
        return <ManualDataEntryWidgetConfig {...commonProps} />;
      case 'ManualSensorSimulatorWidget':
        return <ManualSensorSimulatorWidgetConfig {...commonProps} sensors={siteSensors} />;
      case 'WaterReadingCaptureWidget':
        return <WaterReadingCaptureWidgetConfig {...commonProps} siteId={selectedSite} />;
      case 'SingleStatSensorCompactWidget':
        return <SingleStatSensorWidgetConfig {...commonProps} siteId={selectedSite} />;
      case 'SingleStatSensorWidget':
        return <SingleStatSensorWidgetConfig {...commonProps} siteId={selectedSite} />;
      case 'SingleStatGradeGaugeWidget':
        return <SingleStatGradeGaugeWidgetConfig {...commonProps} siteId={selectedSite} />;
      case 'ImageDisplayWidget':
        return <ImageDisplayWidgetConfig {...commonProps} siteId={selectedSite} />;
      case 'CameraStreamWidget':
        return <CameraStreamWidgetConfig {...commonProps} />;
      case 'PeopleCounterWidget':
        return <PeopleCounterWidgetConfig {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth className="dashboard-config-dialog">
        <DialogTitle>Configure Dashboard: {dashboardName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>Dashboard ID: {dashboardId}</Typography>
          {polygonError && (
            <Typography color="error" align="center" style={{ marginBottom: '20px' }}>
              {polygonError}
            </Typography>
          )}
          {loadingPolygons ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={3}>
              {localConfig.widgets.map((widget, index) => (
                <Grid item xs={12} key={index}>
                  <Accordion defaultExpanded={index === localConfig.widgets.length - 1}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`widget-${index}-content`}
                      id={`widget-${index}-header`}
                    >
                      <Typography>{widget.config.title || `Widget ${index + 1}`}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={11}>
                          <FormControl fullWidth>
                            <InputLabel id={`widget-select-label-${index}`}>Widget Type</InputLabel>
                            <StyledSelect
                              labelId={`widget-select-label-${index}`}
                              value={widget.type}
                              onChange={(e) => handleWidgetChange(index, 'type', e.target.value)}
                              label="Widget Type"
                            >
                              {Object.keys(WidgetRegistry).map((key) => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                              ))}
                            </StyledSelect>
                          </FormControl>
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton onClick={() => handleDeleteWidget(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} style={{ marginTop: '10px' }}>
                        <Grid item xs={12}>
                          <TextField
                            label="Widget Title"
                            value={widget.config.title || ''}
                            onChange={(e) => handleWidgetChange(index, 'config.title', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={widget.config.showHeader !== false}
                                onChange={(e) => handleWidgetChange(index, 'config.showHeader', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Show Widget Header"
                          />
                        </Grid>
                        {renderWidgetSpecificOptions(widget, index)}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          )}
          <Button 
            onClick={handleAddWidget} 
            variant="outlined" 
            color="primary" 
            startIcon={<AddIcon />}
            style={{ marginTop: '20px', marginRight: '10px' }}
          >
            Add Widget
          </Button>
          <Button
            onClick={() => setIsManualDataCaptureConfigOpen(true)}
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            style={{ marginTop: '20px' }}
          >
            Create Manual Data Capture Config
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </StyledDialog>

      <Dialog open={isHybridChartDesignerOpen} onClose={() => setIsHybridChartDesignerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Design Hybrid Chart</DialogTitle>
        <DialogContent>
          <HybridChartDesigner
            onSave={(chartConfig) => {
              handleSaveHybridChartConfig(chartConfig);
              setIsHybridChartDesignerOpen(false);
            }}
            onClose={() => setIsHybridChartDesignerOpen(false)}
            siteId={selectedSite}
          />
        </DialogContent>
      </Dialog>

      <LocationSetup 
        open={isLocationSetupOpen} 
        onClose={() => setIsLocationSetupOpen(false)} 
        siteId={selectedSite} 
        onLocationCreated={handleLocationCreated} 
      />

      <Dialog open={isManualDataCaptureConfigOpen} onClose={() => setIsManualDataCaptureConfigOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Manual Data Capture Configuration</DialogTitle>
        <DialogContent>
          <ManualDataCaptureConfigDesigner
            onSave={handleManualDataCaptureConfigCreated}
            onClose={() => setIsManualDataCaptureConfigOpen(false)}
            siteId={selectedSite}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
  

}

export default DashboardConfig;