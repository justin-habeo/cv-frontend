import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Typography, TextField, Select, MenuItem, Button, 
  FormControl, InputLabel, Grid, Checkbox, FormControlLabel,
  Paper, useTheme, Slider, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import ReactECharts from 'echarts-for-react';
import { fetchBuckets, fetchMeasurements, fetchFields } from '../../services/influxDBService';
import { fetchAggregatedChartData } from '../../services/aggregatedChartDataService';
import apiService from '../../services/apiService';
import hybridChartTypes, { hybridChartTypesArray } from '../hybridChartTypes';
import RelativeDateRangeSelector from '../common/RelativeDateRangeSelector';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSelect-icon': {
    color: theme.palette.text.secondary,
  },
}));

const HybridChartDesigner = ({ onSave, onClose, siteId }) => {

  const getDateRange = () => {
    if (chartConfig.dateRangeType === 'custom') {
      return {
        start: chartConfig.timeRange.start,
        end: chartConfig.timeRange.end
      };
    } else {
      const end = new Date();
      const start = new Date(end);
      const { value, unit } = chartConfig.relativeDateRange;
      
      switch (unit) {
        case 'hours':
          start.setHours(start.getHours() - value);
          break;
        case 'days':
          start.setDate(start.getDate() - value);
          break;
        case 'weeks':
          start.setDate(start.getDate() - (value * 7));
          break;
        case 'months':
          start.setMonth(start.getMonth() - value);
          break;
      }
  
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }
  };

  const getRequiredVariables = (chartType) => {
    switch (chartType) {
      case 'drought-stress-indicator':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'precipitation', 'relative_humidity_2m', 'wind_speed_10m'],
          daily: []
        };
      case 'irrigation-timing-optimizer':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'precipitation_probability', 'wind_speed_10m'],
          daily: []
        };
      case 'gdd-accumulation':
        return {
          dataSource: 'open-meteo',
          hourly: [],
          daily: ['temperature_2m_max', 'temperature_2m_min']
        };
      case 'frost-risk-assessment':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'dew_point_2m'],
          daily: []
        };
      case 'water-requirement-forecast':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'precipitation', 'evapotranspiration', 'soil_moisture_0_1cm'],
          daily: []
        };
      case 'wind-rose-sprinkler-efficiency':
        return {
          dataSource: 'open-meteo',
          hourly: ['wind_speed_10m', 'wind_direction_10m'],
          daily: []
        };
      case 'soil-temperature-trends':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'soil_temperature_0cm', 'soil_temperature_6cm', 'soil_temperature_18cm'],
          daily: []
        };
      case 'humidity-disease-pressure':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'relative_humidity_2m', 'dew_point_2m'],
          daily: []
        };
      case 'rainfall-intensity-runoff-risk':
        return {
          dataSource: 'open-meteo',
          hourly: ['precipitation', 'precipitation_probability'],
          daily: []
        };
      case 'turf-stress-index':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m', 'shortwave_radiation'],
          daily: []
        };
      case 'green-speed-predictor':
        return {
          dataSource: 'open-meteo',
          hourly: ['soil_moisture_0_1cm', 'temperature_2m', 'relative_humidity_2m', 'precipitation'],
          daily: []
        };
      case 'disease-pressure-forecast':
        return {
          dataSource: 'open-meteo',
          hourly: ['temperature_2m', 'relative_humidity_2m', 'dew_point_2m'],
          daily: []
        };
      // Add cases for other chart types that have required variables
      default:
        return { dataSource: null, hourly: [], daily: [] };
    }
  };

  const [previewData, setPreviewData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tempLocation, setTempLocation] = useState(null);
  const [hasPreviewedChart, setHasPreviewedChart] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [fields, setFields] = useState([]);
  const isSavingRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const chartRef = useRef(null);

  const [chartConfig, setChartConfig] = useState({
    name: '',
    defaultLocationId: '',
    dataSource: 'open-meteo',
    dateRangeType: 'relative', // 'relative' or 'custom'
    relativeDateRange: {
      value: 7,
      unit: 'days'
    },
    timeRange: {
      start: '',
      end: '',
    },
    hourlyVariables: [],
    dailyVariables: [],
    chartType: 'line',
    additionalConfig: {
      thresholds: [],
      scatterSize: [5, 20],
      heatmapColors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
      irrigationOptimizer: {
        temperatureWeight: 0.4,
        precipitationWeight: 0.4,
        windSpeedWeight: 0.2,
        idealTemperature: 10,
        maxWindSpeed: 10,
      }
    },
    refreshInterval: 0,
    allowLocationOverride: false,
  });

  const [dataSeries, setDataSeries] = useState([{
    name: 'Series 1',
    dataSource: 'open-meteo',
    config: {
      hourlyVariables: [],
      dailyVariables: []
    }
  }]);

  // Use refs for values that don't need to trigger re-renders
  const dateRangeRef = useRef({
    start: '',
    end: '',
  });

  const theme = useTheme();
  const muiTheme = useMuiTheme();

  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const buildInfluxDBQuery = useCallback((index, series) => {
    console.log("buildInfluxDBQuery");
    const currentSeries = series[index];
    if (currentSeries.config.bucket && currentSeries.config.measurement && currentSeries.config.fields?.length > 0) {
      let start, stop;
  
      if (chartConfig.dateRangeType === 'relative') {
        const { value, unit } = chartConfig.relativeDateRange;
        start = `-${value}${unit.charAt(0)}`;  // e.g., '-7d' for 7 days
        stop = 'now()';
      } else {
        // For custom date range
        start = chartConfig.timeRange.start ? `time(v: "${chartConfig.timeRange.start}")` : '-30d';
        stop = chartConfig.timeRange.end ? `time(v: "${chartConfig.timeRange.end}")` : 'now()';
      }
  
      const query = `
        from(bucket: "${currentSeries.config.bucket}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r._measurement == "${currentSeries.config.measurement}")
          |> filter(fn: (r) => ${currentSeries.config.fields.map(field => `r._field == "${field}"`).join(' or ')})
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      `;
      return query;
    }
    return '';
  }, [chartConfig.dateRangeType, chartConfig.relativeDateRange, chartConfig.timeRange]);

  const handleChange = useCallback((fieldOrEvent, value) => {
    console.log("handleChange");
    let field, newValue;
  
    if (typeof fieldOrEvent === 'object' && fieldOrEvent !== null) {
      // It's an event object
      field = fieldOrEvent.target.name;
      newValue = fieldOrEvent.target.value;
    } else {
      // It's called with field and value directly
      field = fieldOrEvent;
      newValue = value;
    }
  
    setChartConfig(prevConfig => ({
      ...prevConfig,
      [field]: newValue
    }));
  
    // Special handling for chart type changes
    if (field === 'chartType') {
      const requiredVars = getRequiredVariables(newValue);
      
      setDataSeries(prevSeries => {
        const newSeries = [...prevSeries];
        
        // Ensure the first series is open-meteo and includes required variables
        if (requiredVars.dataSource === 'open-meteo') {
          if (newSeries.length === 0 || newSeries[0].dataSource !== 'open-meteo') {
            newSeries[0] = {
              name: 'Series 1',
              dataSource: 'open-meteo',
              config: {
                hourlyVariables: [...requiredVars.hourly],
                dailyVariables: [...requiredVars.daily]
              }
            };
          } else {
            newSeries[0] = {
              ...newSeries[0],
              config: {
                ...newSeries[0].config,
                hourlyVariables: [...new Set([...newSeries[0].config.hourlyVariables, ...requiredVars.hourly])],
                dailyVariables: [...new Set([...newSeries[0].config.dailyVariables, ...requiredVars.daily])]
              }
            };
          }
        }
        
        return newSeries;
      });
  
      setChartConfig(prevConfig => ({
        ...prevConfig,
        additionalConfig: {}, // Reset additional config
        timeRange: { start: '', end: '' }, // Reset time range
      }));
    }
  
    // Handle data source changes
    if (field === 'dataSource') {
      setDateRange({ start: '', end: '' }); // Reset date range
      setPreviewData([]); // Clear preview data
      setHasPreviewedChart(false); // Reset the preview state
    }
  
    // Handle refresh interval changes
    if (field === 'refreshInterval') {
      // TODO: Implement refresh logic
      console.log(`Chart will refresh every ${newValue} seconds`);
    }
  
    // Reset preview data when changing chart type or data source
    if (field === 'chartType' || field === 'dataSource') {
      setPreviewData([]);
      setHasPreviewedChart(false);
    }
  }, [getRequiredVariables]);

  const handleDataSeriesChange = useCallback((index, field, value, skipQueryBuild = false) => {

    setDataSeries(prevSeries => {
      const newSeries = [...prevSeries];
      const requiredVars = getRequiredVariables(chartConfig.chartType);
  
      if (field === 'seriesType') {
        newSeries[index] = { 
          ...newSeries[index], 
          config: {
            ...newSeries[index].config,
            seriesType: value,
          }
        };
      } else {

        // Special handling for the first series if there are required variables
        if (index === 0 && requiredVars.dataSource) {
          // Prevent changing data source of first series if it conflicts with required variables
          if (field === 'dataSource' && value !== requiredVars.dataSource) {
            console.warn("Cannot change data source of first series for this chart type");
            return newSeries;
          }
    
          // Ensure required variables are always selected for the first series
          if (field === 'config.hourlyVariables' || field === 'config.dailyVariables') {
            const configField = field.split('.')[1];
            const currentVariables = newSeries[0].config[configField] || [];
            const requiredVarsForType = requiredVars[configField === 'hourlyVariables' ? 'hourly' : 'daily'];
    
            if (requiredVarsForType.includes(value)) {
              // If trying to deselect a required variable, prevent it
              if (currentVariables.includes(value)) {
                console.warn(`Cannot deselect required variable: ${value}`);
                return newSeries;
              }
            }
    
            // Update the variables, ensuring required ones are always included
            newSeries[0].config[configField] = [
              ...new Set([...currentVariables, value, ...requiredVarsForType])
            ];
    
            return newSeries;
          }
        }
    
        // Handle changes for all series
        if (field.startsWith('config.')) {
          const configField = field.split('.')[1];
          if (configField === 'hourlyVariables' || configField === 'dailyVariables') {
            const currentVariables = newSeries[index].config[configField] || [];
            if (currentVariables.includes(value)) {
              newSeries[index].config[configField] = currentVariables.filter(v => v !== value);
            } else {
              newSeries[index].config[configField] = [...currentVariables, value];
            }
          } else {
            newSeries[index].config = {
              ...newSeries[index].config,
              [configField]: value
            };
          }
    
          // We no longer build the query here for InfluxDB
        } else if (field === 'dataSource') {
          newSeries[index] = { 
            ...newSeries[index], 
            [field]: value,
            config: {
              ...newSeries[index].config,
              hourlyVariables: [],
              dailyVariables: [],
              // Reset InfluxDB specific fields when changing data source
              bucket: null,
              measurement: null,
              fields: [],
              query: ''
            }
          };
        } else {
          newSeries[index] = { ...newSeries[index], [field]: value };
        }
      }
  
      return newSeries;
    });
  }, [chartConfig.chartType]);

  const handleBucketChange = (event, index) => {
    const bucket = event.target.value;
    handleDataSeriesChange(index, 'config.bucket', bucket);
    fetchMeasurements(bucket, siteId).then(setMeasurements);
    handleDataSeriesChange(index, 'config.measurement', '');
    handleDataSeriesChange(index, 'config.fields', []);
  };
  
  const handleMeasurementChange = async (event, index) => {
    const measurement = event.target.value;
    handleDataSeriesChange(index, 'config.measurement', measurement);
    handleDataSeriesChange(index, 'config.fields', []);
    if (measurement) {
      const fetchedFields = await fetchFields(dataSeries[index].config.bucket, measurement, siteId);
      setFields(fetchedFields);
    }
  };
  
  const handleFieldChange = (event, index) => {
    console.log("handleFieldChange");
    const selectedFields = event.target.value;
    
    setDataSeries(prevSeries => {
      const newSeries = [...prevSeries];
      newSeries[index].config.fields = selectedFields;
  
      // Build the query here
      if (newSeries[index].dataSource === 'influxdb') {
        const query = buildInfluxDBQuery(index, newSeries);
        newSeries[index].config.query = query;
      }
  
      return newSeries;
    });
  };

  const handleLocationChange = (event) => {
    console.log("handleLocationChange");
    const { value } = event.target;
    const selectedLocation = locations.find(loc => loc.id === value);
    setTempLocation(selectedLocation);
    setChartConfig(prevConfig => ({
      ...prevConfig,
      defaultLocationId: value
    }));
  };

  const handleTimeRangeChange = (event) => {
    console.log("handleTimeRangeChange");
    const { name, value } = event.target;
    setChartConfig(prevConfig => ({
      ...prevConfig,
      timeRange: {
        ...prevConfig.timeRange,
        [name]: value // This will already be in YYYY-MM-DD format from the date input
      }
    }));
  };

  const handleVariableToggle = (variable, type) => {
    console.log("handleVariableToggle");
    const requiredVars = getRequiredVariables(chartConfig.chartType)[type === 'hourlyVariables' ? 'hourly' : 'daily'];
    if (requiredVars.includes(variable)) return; // Prevent toggling required variables
  
    setChartConfig(prevConfig => ({
      ...prevConfig,
      [type]: prevConfig[type].includes(variable)
        ? prevConfig[type].filter(v => v !== variable)
        : [...prevConfig[type], variable]
    }));
  };

  const handleAdditionalConfigChange = (key, value) => {
    console.log("handleAdditionalConfigChange");
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        [key]: value
      }
    }));
  };

  const handleAddDataSeries = () => {
    console.log("handleAddDataSeries");
    setDataSeries([...dataSeries, {
      name: `Series ${dataSeries.length + 1}`,
      dataSource: 'open-meteo',
      config: {}
    }]);
  };

  const handleRemoveDataSeries = useCallback((index) => {
    console.log("handleRemoveDataSeries");
    const requiredVars = getRequiredVariables(chartConfig.chartType);
  
    setDataSeries(prevSeries => {
      // Prevent removing the first series if it's required for the current chart type
      if (index === 0 && requiredVars.dataSource) {
        console.warn("Cannot remove the first series for this chart type as it contains required variables.");
        return prevSeries;
      }
  
      const newSeries = prevSeries.filter((_, i) => i !== index);
  
      // If we're removing the first series and there are other series left,
      // we need to ensure the new first series meets the requirements
      if (index === 0 && newSeries.length > 0 && requiredVars.dataSource) {
        const firstSeries = {...newSeries[0]};
        
        if (firstSeries.dataSource !== requiredVars.dataSource) {
          firstSeries.dataSource = requiredVars.dataSource;
          firstSeries.config = {
            hourlyVariables: [...requiredVars.hourly],
            dailyVariables: [...requiredVars.daily],
            locationId: firstSeries.config.locationId // Preserve the location if it exists
          };
        } else {
          // Ensure all required variables are included
          firstSeries.config.hourlyVariables = [
            ...new Set([...firstSeries.config.hourlyVariables, ...requiredVars.hourly])
          ];
          firstSeries.config.dailyVariables = [
            ...new Set([...firstSeries.config.dailyVariables, ...requiredVars.daily])
          ];
        }
  
        newSeries[0] = firstSeries;
      }
  
      return newSeries;
    });
  }, [chartConfig.chartType, getRequiredVariables]);

  const handlePreview = useCallback(async (forceFetch = false) => {
    console.log("handlePreview");
    if (!forceFetch && chartConfig.dateRangeType === 'custom' && 
        (!chartConfig.timeRange.start || !chartConfig.timeRange.end)) {
      console.log("Custom time range not set, skipping preview");
      return;
    }
  
    setHasPreviewedChart(false);
    try {
      const timeRange = getDateRange();
      const result = await fetchAggregatedChartData({
        chartType: chartConfig.chartType,
        timeRange: timeRange,
        dataSeries: dataSeries,
        additionalConfig: chartConfig.additionalConfig,
        locationId: chartConfig.defaultLocationId,
        siteId: siteId,
      });
      if (Array.isArray(result.data)) {
        setPreviewData(result.data);
        setHasPreviewedChart(true);
      } else {
        console.error("Fetched data is not an array:", result.data);
        setHasPreviewedChart(false);
      }
    } catch (error) {
      console.error('Error fetching preview data:', error);
      setHasPreviewedChart(false);
    }
  }, [chartConfig, dataSeries, siteId, getDateRange]);

  const handleSave = useCallback(() => {
    if (isSavingRef.current) {
      console.log('Save operation already in progress, skipping');
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    isSavingRef.current = true;
    const timeRange = getDateRange();

    const chartConfigData = {
      name: chartConfig.name,
      site: siteId,
      chartType: chartConfig.chartType,
      refreshInterval: chartConfig.refreshInterval,
      config: {
        additionalConfig: chartConfig.additionalConfig,
        dateRangeType: chartConfig.dateRangeType,
        relativeDateRange: chartConfig.relativeDateRange,
        timeRange: timeRange,
        dataSeries: dataSeries.map(series => ({
          ...series,
          config: {
            ...series.config,
            timeRange: timeRange,
            siteId: siteId, // Add siteId to each series config
          }
        }))
      }
    };

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Saving chart configuration:', chartConfigData);
        onSave(chartConfigData);  // Call onSave instead of apiService directly
      } catch (error) {
        console.error('Failed to save chart configuration:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, 300);
  }, [chartConfig, dataSeries, siteId, onSave, getDateRange]);

  const hourlyOptions = [
    'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature',
    'precipitation_probability', 'precipitation', 'rain', 'showers', 'snowfall', 'snow_depth',
    'weather_code', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low',
    'cloud_cover_mid', 'cloud_cover_high', 'visibility', 'evapotranspiration',
    'et0_fao_evapotranspiration', 'vapour_pressure_deficit', 'wind_speed_10m', 'wind_speed_80m',
    'wind_speed_120m', 'wind_speed_180m', 'wind_direction_10m', 'wind_direction_80m',
    'wind_direction_120m', 'wind_direction_180m', 'wind_gusts_10m', 'temperature_80m',
    'temperature_120m', 'temperature_180m', 'soil_temperature_0cm', 'soil_temperature_6cm',
    'soil_temperature_18cm', 'soil_temperature_54cm', 'soil_moisture_0_to_1cm',
    'soil_moisture_1_to_3cm', 'soil_moisture_3_to_9cm', 'soil_moisture_9_to_27cm',
    'soil_moisture_27_to_81cm'
  ];
  
  const dailyOptions = [
    'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'apparent_temperature_max',
    'apparent_temperature_min', 'sunrise', 'sunset', 'daylight_duration', 'sunshine_duration',
    'uv_index_max', 'uv_index_clear_sky_max', 'precipitation_sum', 'rain_sum', 'showers_sum',
    'snowfall_sum', 'precipitation_hours', 'precipitation_probability_max', 'wind_speed_10m_max',
    'wind_gusts_10m_max', 'wind_direction_10m_dominant', 'shortwave_radiation_sum',
    'et0_fao_evapotranspiration'
  ];
  
  /* line-with-threshold helper functions
   */
  const handleLineWithThresholdConfigChange = (field, value) => {
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        [field]: value
      }
    }));
  };
  
  // Add this new function to handle threshold changes
  const handleThresholdChange = (index, field, value) => {
    setChartConfig(prevConfig => {
      const newThresholds = [...(prevConfig.additionalConfig.thresholds || [])];
      newThresholds[index] = {
        ...newThresholds[index],
        [field]: value
      };
      return {
        ...prevConfig,
        additionalConfig: {
          ...prevConfig.additionalConfig,
          thresholds: newThresholds
        }
      };
    });
  };
  
  // Add this function to add a new threshold
  const addThreshold = () => {
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        thresholds: [
          ...(prevConfig.additionalConfig.thresholds || []),
          { name: '', value: 0, color: '#000000', lineType: 'solid', lineWidth: 2 }
        ]
      }
    }));
  };
  
  // Add this function to remove a threshold
  const removeThreshold = (index) => {
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        thresholds: prevConfig.additionalConfig.thresholds.filter((_, i) => i !== index)
      }
    }));
  };

  // Add these new functions
  const handleLineWithZonesConfigChange = (field, value) => {
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        [field]: value
      }
    }));
  };

  /* line-with-zones helper functions
   */
  const handleZoneChange = (index, field, value) => {
    setChartConfig(prevConfig => {
      const newZones = [...(prevConfig.additionalConfig.zones || [])];
      newZones[index] = {
        ...newZones[index],
        [field]: value
      };
      return {
        ...prevConfig,
        additionalConfig: {
          ...prevConfig.additionalConfig,
          zones: newZones
        }
      };
    });
  };

  const addZone = () => {
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        zones: [
          ...(prevConfig.additionalConfig.zones || []),
          { name: '', from: 0, to: 0, color: '#000000', opacity: 0.2 }
        ]
      }
    }));
  };

  const removeZone = (index) => {
    setChartConfig(prevConfig => ({
      ...prevConfig,
      additionalConfig: {
        ...prevConfig.additionalConfig,
        zones: prevConfig.additionalConfig.zones.filter((_, i) => i !== index)
      }
    }));
  };


  // ******  Effect hooks

  useEffect(() => {
    return () => {
      // Cleanup function
      if (chartRef.current) {
        const resizeObserver = chartRef.current.__resizeObserver__;
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      }
    };
  }, []);

  // Clean up the timeout on component unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchBuckets(siteId).then(setBuckets);
  }, [siteId]);

  useEffect(() => {
    if (selectedBucket) {
      fetchMeasurements(selectedBucket, siteId).then(setMeasurements);
    }
  }, [selectedBucket, siteId]);

  useEffect(() => {
    if (selectedBucket && selectedMeasurement) {
      fetchFields(selectedBucket, selectedMeasurement, siteId).then(setFields);
    }
  }, [selectedBucket, selectedMeasurement, siteId]);

  // Rebuild query when time range changes.
  useEffect(() => {
    setDataSeries(prevSeries => {
      return prevSeries.map((series, index) => {
        if (series.dataSource === 'influxdb') {
          const query = buildInfluxDBQuery(index, prevSeries);
          return {
            ...series,
            config: {
              ...series.config,
              query
            }
          };
        }
        return series;
      });
    });
  }, [chartConfig.timeRange, buildInfluxDBQuery]);

  // Rebuild query when date range changes.
  useEffect(() => {
    setDataSeries(prevSeries => {
      return prevSeries.map((series, index) => {
        if (series.dataSource === 'influxdb') {
          const query = buildInfluxDBQuery(index, prevSeries);
          return {
            ...series,
            config: {
              ...series.config,
              query
            }
          };
        }
        return series;
      });
    });
  }, [chartConfig.dateRangeType, chartConfig.relativeDateRange, chartConfig.timeRange, buildInfluxDBQuery]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await apiService.get(`/locations/?site=${siteId}`);
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [siteId]);
  
  // Add a new useEffect to trigger preview
  useEffect(() => {
    const shouldFetchPreview = dataSeries.every(series => {
      if (series.dataSource === 'open-meteo') {
        return series.config.locationId && 
               (series.config.hourlyVariables?.length > 0 || series.config.dailyVariables?.length > 0);
      } else if (series.dataSource === 'influxdb') {
        return series.config.bucket && series.config.measurement && series.config.fields?.length > 0;
      }
      return false;
    });
  
    if (shouldFetchPreview && chartConfig.timeRange.start && chartConfig.timeRange.end) {
      handlePreview();
    }
  }, [dataSeries, chartConfig.timeRange, handlePreview]);

  useEffect(() => {
    if (chartConfig && chartConfig.refreshInterval > 0) {
      // TODO: Implement refresh logic
      console.log(`Chart will refresh every ${chartConfig.refreshInterval} seconds`);
    }
  }, [chartConfig]);

  useEffect(() => {
    if (chartConfig.dataSource === 'influxdb' && selectedBucket && selectedMeasurement && selectedFields.length > 0) {
      buildInfluxDBQuery();
    }
  }, [chartConfig.dataSource, selectedBucket, selectedMeasurement, selectedFields, buildInfluxDBQuery]);


  const getChartOptions = useCallback(() => {
    if (!previewData || !Array.isArray(previewData) || previewData.length === 0) {
      console.log("Preview data is not in the expected format:", previewData);
      return {};
    }
  
    const chartTypeFunction = hybridChartTypes[chartConfig.chartType];
    if (!chartTypeFunction) {
      console.error(`Chart type function not found for: ${chartConfig.chartType}`);
      return {};
    }
  
    const configForChart = {
      ...chartConfig,
      dataSeries: dataSeries.map((series, index) => ({
        ...series,
        config: {
          ...series.config,
          seriesType: series.config.seriesType || 'line'
        },
        name: previewData[index]?.name || `Series ${index + 1}` // Ensure name is set
      }))
    };
  
    try {
      return chartTypeFunction(previewData, configForChart, theme);
    } catch (error) {
      console.error("Error generating chart options:", error);
      return {
        title: {
          text: "Error generating chart",
          left: 'center',
          top: 'center',
          textStyle: { color: theme.palette.error.main },
        },
        series: [],
      };
    }
  }, [chartConfig, previewData, dataSeries, theme]);

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom>Design Hybrid Chart</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Chart Name"
            name="name"
            value={chartConfig.name}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
  
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <StyledSelect
              labelId="chart-type-label"
              name="chartType"
              value={chartConfig.chartType}
              onChange={(e) => handleChange('chartType', e.target.value)}
              label="Chart Type"
            >
              {hybridChartTypesArray.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Chart
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        </Grid>
  
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Refresh Interval (seconds)</InputLabel>
            <Select
              value={chartConfig.refreshInterval || 0}
              onChange={(e) => handleChange('refreshInterval', e.target.value)}
              label="Refresh Interval (seconds)"
            >
              <MenuItem value={0}>No refresh</MenuItem>
              <MenuItem value={30}>30 seconds</MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
              <MenuItem value={300}>5 minutes</MenuItem>
              <MenuItem value={600}>10 minutes</MenuItem>
            </Select>
          </FormControl>
        </Grid>
  
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={chartConfig.allowLocationOverride}
                onChange={(e) => handleChange('allowLocationOverride', e.target.checked)}
              />
            }
            label="Allow Location Override"
          />
        </Grid>
  
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Date Range Type</InputLabel>
            <Select
              value={chartConfig.dateRangeType}
              onChange={(e) => handleChange('dateRangeType', e.target.value)}
              label="Date Range Type"
            >
              <MenuItem value="relative">Relative</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </Grid>
  
        {chartConfig.dateRangeType === 'relative' ? (
          <Grid item xs={12}>
            <RelativeDateRangeSelector
              value={chartConfig.relativeDateRange.value}
              unit={chartConfig.relativeDateRange.unit}
              onChange={(value, unit) => handleChange('relativeDateRange', { value, unit })}
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={6}>
              <StyledTextField
                fullWidth
                label="Start Date"
                name="start"
                type="date"
                value={chartConfig.timeRange.start}
                onChange={handleTimeRangeChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledTextField
                fullWidth
                label="End Date"
                name="end"
                type="date"
                value={chartConfig.timeRange.end}
                onChange={handleTimeRangeChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        )}  
  
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Data Series</Typography>
          {dataSeries.map((series, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Series Name"
                    value={series.name}
                    onChange={(e) => handleDataSeriesChange(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel>Data Source</InputLabel>
                    <Select
                      value={series.dataSource}
                      onChange={(e) => handleDataSeriesChange(index, 'dataSource', e.target.value)}
                    >
                      <MenuItem value="open-meteo">Open-Meteo</MenuItem>
                      <MenuItem value="influxdb">InfluxDB</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {(chartConfig.chartType === 'area-with-line' || chartConfig.chartType === 'bar-line-combination') && (
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel>Series Type</InputLabel>
                      <Select
                        value={series.config.seriesType || 'line'}
                        onChange={(e) => handleDataSeriesChange(index, 'seriesType', e.target.value)}
                        label="Series Type"
                      >
                        <MenuItem value="line">Line</MenuItem>
                        {chartConfig.chartType === 'area-with-line' && <MenuItem value="area">Area</MenuItem>}
                        {chartConfig.chartType === 'bar-line-combination' && <MenuItem value="bar">Bar</MenuItem>}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {chartConfig.chartType === 'line-with-threshold' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Line With Threshold Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Line Width"
                          type="number"
                          value={chartConfig.additionalConfig?.lineWidth || 2}
                          onChange={(e) => handleLineWithThresholdConfigChange('lineWidth', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showDataPoints || false}
                              onChange={(e) => handleLineWithThresholdConfigChange('showDataPoints', e.target.checked)}
                            />
                          }
                          label="Show Data Points"
                        />
                      </Grid>
                      {chartConfig.additionalConfig?.showDataPoints && (
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Data Point Size"
                            type="number"
                            value={chartConfig.additionalConfig?.dataPointSize || 4}
                            onChange={(e) => handleLineWithThresholdConfigChange('dataPointSize', Number(e.target.value))}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Thresholds</Typography>
                        {chartConfig.additionalConfig?.thresholds?.map((threshold, index) => (
                          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={3}>
                                <TextField
                                  fullWidth
                                  label="Name"
                                  value={threshold.name}
                                  onChange={(e) => handleThresholdChange(index, 'name', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <TextField
                                  fullWidth
                                  label="Value"
                                  type="number"
                                  value={threshold.value}
                                  onChange={(e) => handleThresholdChange(index, 'value', Number(e.target.value))}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  fullWidth
                                  label="Color"
                                  type="color"
                                  value={threshold.color}
                                  onChange={(e) => handleThresholdChange(index, 'color', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <FormControl fullWidth>
                                  <InputLabel>Line Type</InputLabel>
                                  <Select
                                    value={threshold.lineType}
                                    onChange={(e) => handleThresholdChange(index, 'lineType', e.target.value)}
                                  >
                                    <MenuItem value="solid">Solid</MenuItem>
                                    <MenuItem value="dashed">Dashed</MenuItem>
                                    <MenuItem value="dotted">Dotted</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  fullWidth
                                  label="Line Width"
                                  type="number"
                                  value={threshold.lineWidth}
                                  onChange={(e) => handleThresholdChange(index, 'lineWidth', Number(e.target.value))}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button onClick={() => removeThreshold(index)} variant="outlined" color="secondary">
                                  Remove Threshold
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                        <Button onClick={addThreshold} variant="outlined" color="primary">
                          Add Threshold
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'line-with-zones' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Line With Zones Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Line Width"
                          type="number"
                          value={chartConfig.additionalConfig?.lineWidth || 2}
                          onChange={(e) => handleLineWithZonesConfigChange('lineWidth', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showDataPoints || false}
                              onChange={(e) => handleLineWithZonesConfigChange('showDataPoints', e.target.checked)}
                            />
                          }
                          label="Show Data Points"
                        />
                      </Grid>
                      {chartConfig.additionalConfig?.showDataPoints && (
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Data Point Size"
                            type="number"
                            value={chartConfig.additionalConfig?.dataPointSize || 4}
                            onChange={(e) => handleLineWithZonesConfigChange('dataPointSize', Number(e.target.value))}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Zones</Typography>
                        {chartConfig.additionalConfig?.zones?.map((zone, index) => (
                          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={3}>
                                <TextField
                                  fullWidth
                                  label="Name"
                                  value={zone.name}
                                  onChange={(e) => handleZoneChange(index, 'name', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  fullWidth
                                  label="From"
                                  type="number"
                                  value={zone.from}
                                  onChange={(e) => handleZoneChange(index, 'from', Number(e.target.value))}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  fullWidth
                                  label="To"
                                  type="number"
                                  value={zone.to}
                                  onChange={(e) => handleZoneChange(index, 'to', Number(e.target.value))}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  fullWidth
                                  label="Color"
                                  type="color"
                                  value={zone.color}
                                  onChange={(e) => handleZoneChange(index, 'color', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  fullWidth
                                  label="Opacity"
                                  type="number"
                                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                                  value={zone.opacity}
                                  onChange={(e) => handleZoneChange(index, 'opacity', Number(e.target.value))}
                                />
                              </Grid>
                              <Grid item xs={1}>
                                <Button onClick={() => removeZone(index)} variant="outlined" color="secondary">
                                  Remove
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                        <Button onClick={addZone} variant="outlined" color="primary">
                          Add Zone
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'scatter' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Scatter Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Symbol Size"
                          type="number"
                          value={chartConfig.additionalConfig?.symbolSize || 8}
                          onChange={(e) => handleAdditionalConfigChange('symbolSize', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Opacity"
                          type="number"
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                          value={chartConfig.additionalConfig?.opacity || 0.7}
                          onChange={(e) => handleAdditionalConfigChange('opacity', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Y-Axis Name"
                          value={chartConfig.additionalConfig?.yAxisName || ''}
                          onChange={(e) => handleAdditionalConfigChange('yAxisName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showGridLines !== false}
                              onChange={(e) => handleAdditionalConfigChange('showGridLines', e.target.checked)}
                            />
                          }
                          label="Show Grid Lines"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'scatter-with-size' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Scatter with Size Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Min Symbol Size"
                          type="number"
                          value={chartConfig.additionalConfig?.scatterSize?.[0] || 5}
                          onChange={(e) => handleAdditionalConfigChange('scatterSize', [Number(e.target.value), chartConfig.additionalConfig?.scatterSize?.[1] || 20])}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Max Symbol Size"
                          type="number"
                          value={chartConfig.additionalConfig?.scatterSize?.[1] || 20}
                          onChange={(e) => handleAdditionalConfigChange('scatterSize', [chartConfig.additionalConfig?.scatterSize?.[0] || 5, Number(e.target.value)])}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Opacity"
                          type="number"
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                          value={chartConfig.additionalConfig?.opacity || 0.7}
                          onChange={(e) => handleAdditionalConfigChange('opacity', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Y-Axis Name"
                          value={chartConfig.additionalConfig?.yAxisName || ''}
                          onChange={(e) => handleAdditionalConfigChange('yAxisName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showGridLines !== false}
                              onChange={(e) => handleAdditionalConfigChange('showGridLines', e.target.checked)}
                            />
                          }
                          label="Show Grid Lines"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'scatter-with-visual-mapping' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Scatter with Visual Mapping Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Symbol Size Factor"
                          type="number"
                          value={chartConfig.additionalConfig?.symbolSizeFactor || 5}
                          onChange={(e) => handleAdditionalConfigChange('symbolSizeFactor', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Opacity"
                          type="number"
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                          value={chartConfig.additionalConfig?.opacity || 0.7}
                          onChange={(e) => handleAdditionalConfigChange('opacity', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Y-Axis Name"
                          value={chartConfig.additionalConfig?.yAxisName || ''}
                          onChange={(e) => handleAdditionalConfigChange('yAxisName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showGridLines !== false}
                              onChange={(e) => handleAdditionalConfigChange('showGridLines', e.target.checked)}
                            />
                          }
                          label="Show Grid Lines"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Color Range</Typography>
                        <Grid container spacing={1}>
                          {(chartConfig.additionalConfig?.colorRange || ['#50a3ba', '#eac736', '#d94e5d']).map((color, index) => (
                            <Grid item key={index}>
                              <TextField
                                type="color"
                                value={color}
                                onChange={(e) => {
                                  const newColorRange = [...(chartConfig.additionalConfig?.colorRange || ['#50a3ba', '#eac736', '#d94e5d'])];
                                  newColorRange[index] = e.target.value;
                                  handleAdditionalConfigChange('colorRange', newColorRange);
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'soil-temperature-trends' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Soil Temperature Trends Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Line Width"
                          type="number"
                          value={chartConfig.additionalConfig?.lineWidth || 2}
                          onChange={(e) => handleAdditionalConfigChange('lineWidth', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.smoothLine !== false}
                              onChange={(e) => handleAdditionalConfigChange('smoothLine', e.target.checked)}
                            />
                          }
                          label="Smooth Line"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showDataPoints || false}
                              onChange={(e) => handleAdditionalConfigChange('showDataPoints', e.target.checked)}
                            />
                          }
                          label="Show Data Points"
                        />
                      </Grid>
                      {chartConfig.additionalConfig?.showDataPoints && (
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Data Point Size"
                            type="number"
                            value={chartConfig.additionalConfig?.dataPointSize || 4}
                            onChange={(e) => handleAdditionalConfigChange('dataPointSize', Number(e.target.value))}
                          />
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showGridLines !== false}
                              onChange={(e) => handleAdditionalConfigChange('showGridLines', e.target.checked)}
                            />
                          }
                          label="Show Grid Lines"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'stacked-area' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Stacked Area Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Area Opacity"
                          type="number"
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                          value={chartConfig.additionalConfig?.areaOpacity || 0.7}
                          onChange={(e) => handleAdditionalConfigChange('areaOpacity', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Line Width"
                          type="number"
                          value={chartConfig.additionalConfig?.lineWidth || 2}
                          onChange={(e) => handleAdditionalConfigChange('lineWidth', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showDataPoints || false}
                              onChange={(e) => handleAdditionalConfigChange('showDataPoints', e.target.checked)}
                            />
                          }
                          label="Show Data Points"
                        />
                      </Grid>
                      {chartConfig.additionalConfig?.showDataPoints && (
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Data Point Size"
                            type="number"
                            value={chartConfig.additionalConfig?.dataPointSize || 4}
                            onChange={(e) => handleAdditionalConfigChange('dataPointSize', Number(e.target.value))}
                          />
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Y-Axis Name"
                          value={chartConfig.additionalConfig?.yAxisName || ''}
                          onChange={(e) => handleAdditionalConfigChange('yAxisName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showGridLines !== false}
                              onChange={(e) => handleAdditionalConfigChange('showGridLines', e.target.checked)}
                            />
                          }
                          label="Show Grid Lines"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'stacked-column' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Stacked Column Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Bar Width (%)"
                          type="number"
                          inputProps={{ min: 1, max: 100 }}
                          value={parseInt(chartConfig.additionalConfig?.barWidth) || 60}
                          onChange={(e) => handleAdditionalConfigChange('barWidth', `${e.target.value}%`)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Y-Axis Name"
                          value={chartConfig.additionalConfig?.yAxisName || ''}
                          onChange={(e) => handleAdditionalConfigChange('yAxisName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showGridLines !== false}
                              onChange={(e) => handleAdditionalConfigChange('showGridLines', e.target.checked)}
                            />
                          }
                          label="Show Grid Lines"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'turf-stress-index' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Turf Stress Index Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Stress Index Line Width"
                          type="number"
                          value={chartConfig.additionalConfig?.stressIndexLineWidth || 4}
                          onChange={(e) => handleAdditionalConfigChange('stressIndexLineWidth', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showDataPoints || false}
                              onChange={(e) => handleAdditionalConfigChange('showDataPoints', e.target.checked)}
                            />
                          }
                          label="Show Data Points"
                        />
                      </Grid>
                      {chartConfig.additionalConfig?.showDataPoints && (
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Data Point Size"
                            type="number"
                            value={chartConfig.additionalConfig?.dataPointSize || 4}
                            onChange={(e) => handleAdditionalConfigChange('dataPointSize', Number(e.target.value))}
                          />
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.enableZoom || false}
                              onChange={(e) => handleAdditionalConfigChange('enableZoom', e.target.checked)}
                            />
                          }
                          label="Enable Zoom"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {chartConfig.chartType === 'water-requirement-forecast' && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Water Requirement Forecast Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Bar Width (%)"
                          type="number"
                          inputProps={{ min: 1, max: 100 }}
                          value={parseInt(chartConfig.additionalConfig?.barWidth) || 60}
                          onChange={(e) => handleAdditionalConfigChange('barWidth', `${e.target.value}%`)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.showDataPoints || false}
                              onChange={(e) => handleAdditionalConfigChange('showDataPoints', e.target.checked)}
                            />
                          }
                          label="Show Data Points"
                        />
                      </Grid>
                      {chartConfig.additionalConfig?.showDataPoints && (
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Data Point Size"
                            type="number"
                            value={chartConfig.additionalConfig?.dataPointSize || 4}
                            onChange={(e) => handleAdditionalConfigChange('dataPointSize', Number(e.target.value))}
                          />
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chartConfig.additionalConfig?.enableZoom || false}
                              onChange={(e) => handleAdditionalConfigChange('enableZoom', e.target.checked)}
                            />
                          }
                          label="Enable Zoom"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Color Configuration</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Precipitation Color"
                          type="color"
                          value={chartConfig.additionalConfig?.precipitationColor || '#4ECDC4'}
                          onChange={(e) => handleAdditionalConfigChange('precipitationColor', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Temperature Color"
                          type="color"
                          value={chartConfig.additionalConfig?.temperatureColor || '#FF6B6B'}
                          onChange={(e) => handleAdditionalConfigChange('temperatureColor', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Evapotranspiration Color"
                          type="color"
                          value={chartConfig.additionalConfig?.evapotranspirationColor || '#45B7D1'}
                          onChange={(e) => handleAdditionalConfigChange('evapotranspirationColor', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Soil Moisture Color"
                          type="color"
                          value={chartConfig.additionalConfig?.soilMoistureColor || '#FFA500'}
                          onChange={(e) => handleAdditionalConfigChange('soilMoistureColor', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {(chartConfig.chartType === 'wind-rose' || chartConfig.chartType === 'wind-rose-sprinkler-efficiency') && (
                  <Grid item xs={12}>
                    <Typography variant="h6">{chartConfig.chartType === 'wind-rose' ? 'Wind Rose' : 'Wind Rose Sprinkler Efficiency'} Chart Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Base Color"
                          type="color"
                          value={chartConfig.additionalConfig?.baseColor || muiTheme.palette.primary.main}
                          onChange={(e) => handleAdditionalConfigChange('baseColor', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Axis Label Font Size"
                          type="number"
                          value={chartConfig.additionalConfig?.axisLabelFontSize || 12}
                          onChange={(e) => handleAdditionalConfigChange('axisLabelFontSize', Number(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {series.dataSource === 'open-meteo' && (
                  <>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id={`location-label-${index}`}>Location</InputLabel>
                        <StyledSelect
                          labelId={`location-label-${index}`}
                          value={series.config.locationId || ''}
                          onChange={(e) => handleDataSeriesChange(index, 'config', {...series.config, locationId: e.target.value})}
                          label="Location"
                        >
                          {locations.map((location) => (
                            <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                          ))}
                        </StyledSelect>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1">Hourly Variables</Typography>
                      {hourlyOptions.map(option => (
                        <FormControlLabel
                          key={`hourly-${option}`}
                          control={
                            <Checkbox
                              checked={series.config.hourlyVariables?.includes(option) || false}
                              onChange={() => handleDataSeriesChange(index, 'config.hourlyVariables', option)}
                              color="primary"
                            />
                          }
                          label={option}
                        />
                      ))}
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1">Daily Variables</Typography>
                      {dailyOptions.map(option => (
                        <FormControlLabel
                          key={`daily-${option}`}
                          control={
                            <Checkbox
                              checked={series.config.dailyVariables?.includes(option) || false}
                              onChange={() => handleDataSeriesChange(index, 'config.dailyVariables', option)}
                              color="primary"
                            />
                          }
                          label={option}
                        />
                      ))}
                    </Grid>
                  </>
                )}
                {series.dataSource === 'influxdb' && (
                  <>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Bucket</InputLabel>
                        <Select
                          value={series.config.bucket || ''}
                          onChange={(e) => handleBucketChange(e, index)}
                          label="Bucket"
                        >
                          {buckets.map((bucket) => (
                            <MenuItem key={bucket} value={bucket}>{bucket}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Measurement</InputLabel>
                        <Select
                          value={series.config.measurement || ''}
                          onChange={(e) => handleMeasurementChange(e, index)}
                          label="Measurement"
                          disabled={!series.config.bucket}
                        >
                          {measurements.map((measurement) => (
                            <MenuItem key={measurement} value={measurement}>{measurement}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Fields</InputLabel>
                        <Select
                          multiple
                          value={series.config.fields || []}
                          onChange={(e) => handleFieldChange(e, index)}
                          label="Fields"
                          renderValue={(selected) => selected.join(', ')}
                          disabled={!series.config.measurement}
                        >
                          {fields.map((field) => (
                            <MenuItem key={field} value={field}>
                              <Checkbox checked={(series.config.fields || []).indexOf(field) > -1} />
                              <ListItemText primary={field} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="InfluxDB Query"
                        multiline
                        rows={4}
                        value={series.config.query || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={2}>
                  <Button 
                    onClick={() => handleRemoveDataSeries(index)} 
                    variant="outlined" 
                    color="secondary"
                    disabled={index === 0 && getRequiredVariables(chartConfig.chartType).dataSource}
                  >
                    Remove Series
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button onClick={handleAddDataSeries} variant="outlined" color="primary">
            Add Data Series
          </Button>
        </Grid>
  
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            onClick={handlePreview}
            fullWidth
            color="secondary"
          >
            Preview Chart
          </Button>
        </Grid>
  
        <Grid item xs={12}>
          {hasPreviewedChart ? (
            <ReactECharts 
              ref={chartRef}
              option={getChartOptions()} 
              style={{ height: '400px', width: '100%' }}
              theme={theme.palette.mode}
              opts={{ renderer: 'svg' }}
            />
          ) : (
            <Paper 
              style={{ 
                height: '400px', 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: theme.palette.background.default
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Select chart options and click "Preview" to see the chart
              </Typography>
            </Paper>
          )}
        </Grid>
  
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            fullWidth
            color="primary"
            disabled={isSavingRef.current}
          >
            {isSavingRef.current ? 'Saving...' : 'Save Chart Configuration'}
          </Button>
        </Grid>
  
      </Grid>
    </StyledPaper>
  );
  
};

export default HybridChartDesigner;