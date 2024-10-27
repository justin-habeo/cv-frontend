import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, DrawingManager, Autocomplete } from '@react-google-maps/api';
import { Box, Button, TextField, Typography, CircularProgress, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import CreateIcon from '@mui/icons-material/Create';
import { createPolygon } from '../../services/agroMonitoringService';
import apiService from '../../services/apiService';

const StyledBox = styled(Box)(({ theme }) => ({
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledMapBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '400px',
  marginBottom: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '300px',
  backgroundColor: theme.palette.background.paper,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.background.paper,
    },
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  right: 16,
}));

function PolygonDrawingTool({ siteId, onPolygonCreated, onClose }) {
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [polygonName, setPolygonName] = useState('');
  const [searchBox, setSearchBox] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const polygonRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        () => {
          console.log("Unable to retrieve your location");
          setIsLoading(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  }, []);

  const onLoad = useCallback((map) => {
    console.log("Map loaded:", map);
    setMap(map);

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: theme.palette.primary.main,
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: theme.palette.primary.main,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    });

    drawingManager.setMap(map);
    setDrawingManager(drawingManager);

    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', onPolygonComplete);
  }, [theme.palette.primary.main]);

  const onUnmount = useCallback(() => {
    setMap(null);
    setDrawingManager(null);
  }, []);

  const onPolygonComplete = useCallback((polygon) => {
    console.log("Polygon completed:", polygon);
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    setDrawnPolygon(polygon);
    polygonRef.current = polygon;
    setDrawingMode(null);
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  }, [drawingManager]);

  const handleSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const handlePlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          map.panTo(place.geometry.location);
          map.setZoom(15);
        }
      }
    }
  };

  const handleSavePolygon = async () => {
    if (!drawnPolygon || !polygonName) return;
  
    const path = polygonRef.current.getPath();
    const coordinates = path.getArray().map(latLng => [latLng.lng(), latLng.lat()]);
    
    if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
      coordinates.push(coordinates[0]);
    }
    
    try {
      const agroPolygon = await createPolygon({ 
        name: polygonName, 
        geo_json: { 
          type: 'Polygon', 
          coordinates: [coordinates] 
        } 
      });
      
      const savedPolygon = await apiService.post('/polygons/', {
        site: siteId,
        name: polygonName,
        agromonitoring_polygon_id: agroPolygon.id,
        geo_json: { type: 'Polygon', coordinates: [coordinates] }
      });
  
      onPolygonCreated(savedPolygon);
      onClose();
    } catch (error) {
      console.error('Error creating polygon:', error);
    }
  };

  const toggleDrawingMode = () => {
    const newMode = drawingMode ? null : window.google.maps.drawing.OverlayType.POLYGON;
    console.log("Toggling drawing mode:", newMode);
    setDrawingMode(newMode);
    if (drawingManager) {
      drawingManager.setDrawingMode(newMode);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <StyledBox>
      <StyledMapBox>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Autocomplete
            onLoad={handleSearchBoxLoad}
            onPlaceChanged={handlePlacesChanged}
          >
            <StyledTextField
              placeholder="Search for a location"
              variant="outlined"
              size="small"
            />
          </Autocomplete>
        </GoogleMap>
        <StyledButton
          variant="contained"
          color={drawingMode ? "secondary" : "primary"}
          startIcon={<CreateIcon />}
          onClick={toggleDrawingMode}
        >
          {drawingMode ? "Stop Drawing" : "Start Drawing"}
        </StyledButton>
      </StyledMapBox>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Click "Start Drawing" to begin. Click on the map to create points. Double-click to finish drawing.
        </Typography>
        <TextField
          fullWidth
          label="Polygon Name"
          value={polygonName}
          onChange={(e) => setPolygonName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleSavePolygon}
          disabled={!drawnPolygon || !polygonName}
        >
          Save Polygon
        </Button>
      </Box>
    </StyledBox>
  );
}

export default PolygonDrawingTool;