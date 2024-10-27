import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import { getNDVIImages, getPolygonInfo } from '../../../services/agroMonitoringService';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudIcon from '@mui/icons-material/Cloud';
import LandscapeIcon from '@mui/icons-material/Landscape';
import WidgetWrapper from '../WidgetWrapper';

function NDVIOverlay({ bounds, image, map }) {
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    if (!map || !bounds) return;

    const newOverlay = new window.google.maps.OverlayView();

    newOverlay.onAdd = function() {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.width = '100%';
      div.style.height = '100%';

      const img = document.createElement('img');
      img.src = image;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.opacity = '0.8';
      img.style.objectFit = 'cover';

      div.appendChild(img);
      this.div = div;

      const panes = this.getPanes();
      panes.overlayLayer.appendChild(div);
    };

    newOverlay.draw = function() {
      const projection = this.getProjection();
      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());

      const div = this.div;
      div.style.left = sw.x + 'px';
      div.style.top = ne.y + 'px';
      div.style.width = (ne.x - sw.x) + 'px';
      div.style.height = (sw.y - ne.y) + 'px';
    };

    newOverlay.onRemove = function() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        delete this.div;
      }
    };

    newOverlay.setMap(map);
    setOverlay(newOverlay);

    return () => {
      if (newOverlay) {
        newOverlay.setMap(null);
      }
    };
  }, [bounds, image, map]);

  return null;
}

function NDVIImageryWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [satelliteImages, setSatelliteImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polygonData, setPolygonData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(config.selectedIndex || 'ndvi');
  const [mapBounds, setMapBounds] = useState(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const mapRef = useRef(null);

  const indices = [
    { value: 'ndvi', label: 'NDVI' },
    { value: 'evi', label: 'EVI' },
    { value: 'evi2', label: 'EVI2' },
    { value: 'nri', label: 'NRI' },
    { value: 'dswi', label: 'DSWI' },
    { value: 'ndwi', label: 'NDWI' },
  ];

  useEffect(() => {
    const checkGoogleMapsLoaded = setInterval(() => {
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
        clearInterval(checkGoogleMapsLoaded);
      }
    }, 100);

    return () => clearInterval(checkGoogleMapsLoaded);
  }, []);

  const fetchPolygonAndSatelliteData = useCallback(async () => {
    if (!config.agromonitoringPolygonId) {
      setError('No polygon selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching polygon info...');
      const polygonInfo = await getPolygonInfo(config.agromonitoringPolygonId);
      console.log('Polygon info fetched:', polygonInfo);
      setPolygonData(polygonInfo);

      const startDate = config.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = config.endDate || new Date().toISOString().split('T')[0];
      console.log('Fetching NDVI images...');
      const images = await getNDVIImages(config.agromonitoringPolygonId, startDate, endDate);
      console.log('NDVI images fetched:', images);
      setSatelliteImages(images);

      if (polygonInfo?.geo_json?.coordinates?.[0]) {
        const coordinates = polygonInfo.geo_json.coordinates[0];
        const bounds = new window.google.maps.LatLngBounds();
        coordinates.forEach(coord => bounds.extend({ lat: coord[1], lng: coord[0] }));
        setMapBounds(bounds);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [config.agromonitoringPolygonId, config.startDate, config.endDate]);

  useEffect(() => {
    if (!isDesignMode && isGoogleLoaded) {
      fetchPolygonAndSatelliteData();
    }
  }, [fetchPolygonAndSatelliteData, isDesignMode, isGoogleLoaded]);

  const handleDateChange = (index) => {
    setActiveTab(index);
  };

  const handleIndexChange = (event) => {
    const newIndex = event.target.value;
    setSelectedIndex(newIndex);
    if (updateConfig) {
      updateConfig({ ...config, selectedIndex: newIndex });
    }
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (mapBounds) {
      map.fitBounds(mapBounds);
    }
  }, [mapBounds]);

  const renderMap = () => {
    if (!polygonData?.geo_json?.coordinates?.[0] || !isGoogleLoaded) {
      return null;
    }

    const polygonPath = polygonData.geo_json.coordinates[0].map(coord => ({
      lat: coord[1],
      lng: coord[0],
    }));

    return (
      <Box sx={{ 
        height: '100%',
        width: '100%',
        position: 'relative',
      }}>
        <GoogleMap
          mapContainerStyle={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: `${theme.shape.borderRadius}px`,
          }}
          zoom={13}
          onLoad={onMapLoad}
          options={{
            mapTypeId: 'satellite',
            disableDefaultUI: true,
          }}
        >
          <Polygon
            paths={polygonPath}
            options={{
              fillColor: "transparent",
              strokeColor: "#FFD700",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillOpacity: 0.35,
            }}
          />
          {mapBounds && satelliteImages[activeTab]?.images?.[selectedIndex] && (
            <NDVIOverlay
              bounds={mapBounds}
              image={satelliteImages[activeTab].images[selectedIndex]}
              map={mapRef.current}
            />
          )}
        </GoogleMap>
      </Box>
    );
  };

  const handleMoreClick = () => {
    console.log('More options clicked for NDVIImageryWidget');
  };

  const renderContent = () => {
    if (loading || !isGoogleLoaded) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }
  
    if (error) {
      return <Typography color="error">{error}</Typography>;
    }
  
    const activeImage = satelliteImages[activeTab];
  
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
      }}>
        <Box sx={{ 
          flexGrow: 1,
          display: 'flex', 
          overflow: 'hidden',
          minHeight: 0, // Crucial for nested flex containers
        }}>
          <Box sx={{ 
            width: '66%', 
            pr: 2, 
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // Crucial for nested flex containers
          }}>
            <Box sx={{
              flexGrow: 1,
              borderRadius: `${theme.shape.borderRadius}px`,
              overflow: 'hidden',
              position: 'relative',
            }}>
              {renderMap()}
            </Box>
          </Box>
          <Box sx={{ 
            width: '34%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0, // Crucial for nested flex containers
            marginTop: '8px',
          }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="index-select-label">Vegetation Index</InputLabel>
              <Select
                labelId="index-select-label"
                value={selectedIndex}
                onChange={handleIndexChange}
                label="Vegetation Index"
              >
                {indices.map((index) => (
                  <MenuItem key={index.value} value={index.value}>{index.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {new Date(activeImage?.date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}>
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setActiveTab(prev => Math.min(satelliteImages.length - 1, prev + 1))}>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
              {satelliteImages.map((image, index) => {
                const date = new Date(image.date);
                const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
                const dayOfMonth = date.getDate();
                const satellite = image.satellite || 'Sentinel-2';
                const isSelected = index === activeTab;
  
                return (
                  <Box
                    key={index}
                    onClick={() => handleDateChange(index)}
                    sx={{
                      p: 1,
                      mb: 1,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#115E59' : 'background.paper',
                      color: isSelected ? 'white' : 'text.primary',
                      '&:hover': { backgroundColor: isSelected ? '#115E59' : 'action.hover' },
                      borderRadius: `${theme.shape.borderRadius}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '20%' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>{dayOfWeek}</Typography>
                      <Typography variant="h6">{dayOfMonth}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '25%' }}>
                      <CloudIcon 
                        fontSize="small" 
                        sx={{ mr: 0.5, color: isSelected ? 'white' : 'inherit' }} 
                      />
                      <Typography variant="body2">100%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '25%' }}>
                      <LandscapeIcon 
                        fontSize="small" 
                        sx={{ mr: 0.5, color: isSelected ? 'white' : 'inherit' }} 
                      />
                      <Typography variant="body2">100%</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ width: '30%', textAlign: 'right' }}>{satellite}</Typography>
                  </Box>
                );
              })}
            </Box>
            
            {activeImage && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" display="block">
                  Cloud Cover: {activeImage.cl ? activeImage.cl.toFixed(2) : 'N/A'}%
                </Typography>
                <Typography variant="caption" display="block">
                  Data Coverage: {activeImage.dc ? activeImage.dc.toFixed(2) : 'N/A'}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <WidgetWrapper 
      title={config.title || 'NDVI Imagery'} 
      showHeader={showHeader}
      onMoreClick={handleMoreClick}
    >
      {renderContent()}
    </WidgetWrapper>
  );
}

export default NDVIImageryWidget;