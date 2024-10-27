import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, InfoWindow } from '@react-google-maps/api';
import { Typography, CircularProgress, Button, Box } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';
import influxDBService from '../../../services/influxDBService';
import apiService from '../../../services/apiService';
import { GOOGLE_MAPS_OPTIONS } from '../../../config/googleMapsConfig';

function SensorMapWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const [sensors, setSensors] = useState(config.sensors || []);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [valueRangeProfile, setValueRangeProfile] = useState(null);
  const sensorsRef = useRef(config.sensors || []);
  const markersRef = useRef([]);
  const refreshIntervalRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const center = {
    lat: parseFloat(sensors[0]?.latitude) || 37.144636,
    lng: parseFloat(sensors[0]?.longitude) || -8.327300
  };

  const zoom = 15;

  const fetchValueRangeProfile = useCallback(async () => {
    if (config.valueRangeProfileId && !valueRangeProfile) {
      try {
        const response = await apiService.get(`/value-range-profiles/${config.valueRangeProfileId}/`);
        setValueRangeProfile(response.data);
      } catch (error) {
        console.error('Error fetching value range profile:', error);
        setMapError('Error fetching value range profile');
      }
    }
  }, [config.valueRangeProfileId, valueRangeProfile]);

  const getMarkerColor = useCallback((value) => {
    if (!valueRangeProfile || value === null || value === undefined) return '#808080';

    const epsilon = 0.000001;
    const range = valueRangeProfile.ranges.find(r => 
      value >= r.lower_bound && value < (r.upper_bound + epsilon)
    );
    return range ? range.color : '#808080';
  }, [valueRangeProfile]);

  const getMarkerIcon = useCallback((value) => {
    const color = getMarkerColor(value);
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 20,
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 3,
      strokeColor: color,
      strokeOpacity: 0.8,
    };
  }, [getMarkerColor]);

  const fetchSensorData = useCallback(async () => {
    if (isDesignMode) {
      setLoading(false);
      return;
    }

    if (!config.sensors || config.sensors.length === 0) {
      console.warn('No sensors provided in config');
      setLoading(false);
      return;
    }

    try {
      await fetchValueRangeProfile();
      const updatedSensors = await Promise.all(config.sensors.map(async (sensor) => {
        try {
          const query = `from(bucket:"sensor_bucket")
            |> range(start: -60m)
            |> filter(fn: (r) => r._measurement == "sensor_reading" and r.sensor_id == "${sensor.id}")
            |> last()`;
          const response = await influxDBService.fetchInfluxDBData(query, 'sensor_bucket', config.siteId);
          const lastReading = response[0]?._value ?? null;
          return { ...sensor, last_reading: lastReading };
        } catch (error) {
          console.error(`Error fetching data for sensor ${sensor.id}:`, error);
          return sensor;
        }
      }));
      setSensors(updatedSensors);
      sensorsRef.current = updatedSensors;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setMapError('Error fetching sensor data');
    } finally {
      setLoading(false);
    }
  }, [config.sensors, config.siteId, isDesignMode, fetchValueRangeProfile]);

  useEffect(() => {
    fetchSensorData();

    const refreshInterval = (config.refreshInterval || 5) * 60 * 1000;
    refreshIntervalRef.current = setInterval(fetchSensorData, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchSensorData, config.refreshInterval]);

  const updateMarkers = useCallback(() => {
    if (mapInstanceRef.current && sensorsRef.current.length > 0 && valueRangeProfile) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      sensorsRef.current.forEach((sensor) => {
        if (sensor.latitude && sensor.longitude) {
          const position = { lat: parseFloat(sensor.latitude), lng: parseFloat(sensor.longitude) };
          const marker = new window.google.maps.Marker({
            position: position,
            map: mapInstanceRef.current,
            icon: getMarkerIcon(sensor.last_reading),
          });
          marker.addListener('click', () => setSelectedSensor(sensor));
          markersRef.current.push(marker);
        }
      });
    }
  }, [getMarkerIcon, valueRangeProfile]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers, sensors]);

  const onLoad = useCallback((map) => {
    mapInstanceRef.current = map;
    setIsMapReady(true);
  
    if (map.getCenter() && map.getBounds()) {
      setMapCenter(map.getCenter().toJSON());
      setMapZoom(map.getZoom());
      setMapBounds(map.getBounds().toJSON());
    } else {
      const listener = map.addListener('idle', () => {
        setMapCenter(map.getCenter().toJSON());
        setMapZoom(map.getZoom());
        setMapBounds(map.getBounds().toJSON());
        window.google.maps.event.removeListener(listener);
      });
    }
  }, []);

  const onUnmount = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    mapInstanceRef.current = null;
    setIsMapReady(false);
  }, []);

  useEffect(() => {
    if (isMapReady && mapInstanceRef.current && sensorsRef.current.length > 0 && valueRangeProfile) {
      console.log('Updating map');
      const bounds = new window.google.maps.LatLngBounds();
  
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
  
      sensorsRef.current.forEach((sensor) => {
        if (sensor.latitude && sensor.longitude) {
          const position = { lat: parseFloat(sensor.latitude), lng: parseFloat(sensor.longitude) };
          bounds.extend(position);
  
          const marker = new window.google.maps.Marker({
            position: position,
            map: mapInstanceRef.current,
            icon: getMarkerIcon(sensor.last_reading),
          });
  
          marker.addListener('click', () => setSelectedSensor(sensor));
          markersRef.current.push(marker);
        }
      });

      // Only update map position if it hasn't been set before or if sensors have changed
      if (!mapCenter || !mapZoom || !mapBounds || sensorsRef.current.length !== sensors.length) {
        mapInstanceRef.current.fitBounds(bounds);
        const listener = mapInstanceRef.current.addListener('idle', () => {
          window.google.maps.event.removeListener(listener);
          setMapCenter(mapInstanceRef.current.getCenter().toJSON());
          setMapZoom(mapInstanceRef.current.getZoom());
          setMapBounds(mapInstanceRef.current.getBounds().toJSON());
          console.log('Map fitted to bounds');
        });
      } else {
        // Use stored map position
        mapInstanceRef.current.setCenter(mapCenter);
        mapInstanceRef.current.setZoom(mapZoom);
      }
    }
  }, [isMapReady, sensors.length, mapCenter, mapZoom, mapBounds, getMarkerIcon, valueRangeProfile]);

  const handleMoreClick = () => {
    console.log('More options clicked for SensorMapWidget');
    // Implement additional functionality here
  };

  const renderInfoWindowContent = (sensor) => (
    <div style={{ padding: '10px', maxWidth: '200px' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{sensor.name}</h3>
      <p style={{ margin: '5px 0' }}>Latitude: {sensor.latitude}</p>
      <p style={{ margin: '5px 0' }}>Longitude: {sensor.longitude}</p>
      <p style={{ margin: '5px 0' }}>Last reading: {sensor.last_reading !== null ? sensor.last_reading : 'N/A'}</p>
      <p style={{ margin: '5px 0' }}>Status: {
        sensor.last_reading === null ? 'No Data' :
        valueRangeProfile ? (valueRangeProfile.ranges.find(r => sensor.last_reading >= r.lower_bound && sensor.last_reading < r.upper_bound)?.label || 'Unknown') :
        'No profile'
      }</p>
    </div>
  );

  const renderLegend = () => (
    <Box mt={1} display="flex" justifyContent="center" alignItems="center">
      <Typography variant="caption" mr={1}>Legend:</Typography>
      {valueRangeProfile && valueRangeProfile.ranges.map((range) => (
        <React.Fragment key={range.id}>
          <Box
            width={12}
            height={12}
            bgcolor={range.color}
            opacity={0.5}
            border={`1px solid ${range.color}`}
            mr={0.5}
          />
          <Typography variant="caption" mr={1}>
            {range.label}
          </Typography>
        </React.Fragment>
      ))}
    </Box>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }

    if (mapError) {
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <Typography color="error" gutterBottom>{mapError}</Typography>
          <Button onClick={fetchSensorData} variant="contained" color="primary">
            Retry
          </Button>
        </Box>
      );
    }

    return (
      <Box height="100%" display="flex" flexDirection="column">
        <Box flexGrow={1} position="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={{
              ...GOOGLE_MAPS_OPTIONS,
              mapTypeId: 'satellite',
              mapTypeControl: false,
              restriction: null,
              minZoom: 3,
              maxZoom: 18,
              styles: [],
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {selectedSensor && (
              <InfoWindow
                position={{ lat: parseFloat(selectedSensor.latitude), lng: parseFloat(selectedSensor.longitude) }}
                onCloseClick={() => setSelectedSensor(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
              >
                {renderInfoWindowContent(selectedSensor)}
              </InfoWindow>
            )}
          </GoogleMap>
        </Box>
        {renderLegend()}
      </Box>
    );
  };

  return (
    <WidgetWrapper
      title={config.title || 'Sensor Map'}
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
    >
      {isDesignMode ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1">Sensor Map Widget</Typography>
        </Box>
      ) : (
        renderContent()
      )}
    </WidgetWrapper>
  );
}

export default SensorMapWidget;