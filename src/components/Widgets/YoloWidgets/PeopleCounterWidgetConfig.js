// src/Widgets/YoloWidgets/PeopleCounterWidgetConfig.js
import React, { useState, useEffect } from 'react';
import { 
 Grid, FormControl, InputLabel, Select, MenuItem, 
 FormControlLabel, Switch, TextField 
} from '@mui/material';

const PeopleCounterWidgetConfig = ({ widget, index, handleWidgetChange }) => {
 const [zones, setZones] = useState([]);
 const [cameras, setCameras] = useState([]);

 useEffect(() => {
   const fetchData = async () => {
     try {
       const camerasResponse = await fetch(`/api/v1/cv/cameras/by-site/?site=${widget.config.siteId}`);
       const camerasData = await camerasResponse.json();
       setCameras(camerasData);

       if (widget.config.cameraId) {
         const zonesResponse = await fetch(`/api/v1/cv/zones/by-camera/?camera=${widget.config.cameraId}`);
         const zonesData = await zonesResponse.json();
         setZones(zonesData);
       }
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   };
   fetchData();
 }, [widget.config.siteId, widget.config.cameraId]);

 return (
   <Grid container spacing={2}>
     <Grid item xs={12}>
       <FormControl fullWidth>
         <InputLabel>Camera</InputLabel>
         <Select
           value={widget.config.cameraId || ''}
           onChange={(e) => {
             handleWidgetChange(index, 'config.cameraId', e.target.value);
             handleWidgetChange(index, 'config.zoneId', '');
           }}
           label="Camera"
         >
           {cameras.map((camera) => (
             <MenuItem key={camera.id} value={camera.id}>
               {camera.name}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     </Grid>

     <Grid item xs={12}>
       <FormControl fullWidth>
         <InputLabel>Zone</InputLabel>
         <Select
           value={widget.config.zoneId || ''}
           onChange={(e) => handleWidgetChange(index, 'config.zoneId', e.target.value)}
           label="Zone"
           disabled={!widget.config.cameraId}
         >
           {zones.map((zone) => (
             <MenuItem key={zone.id} value={zone.id}>
               {zone.name}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     </Grid>

     <Grid item xs={12}>
       <FormControlLabel
         control={
           <Switch
             checked={widget.config.showTrends || false}
             onChange={(e) => handleWidgetChange(index, 'config.showTrends', e.target.checked)}
           />
         }
         label="Show Trends"
       />
     </Grid>

     <Grid item xs={12}>
       <TextField
         fullWidth
         label="Refresh Interval (seconds)"
         type="number"
         value={widget.config.refreshInterval || 5}
         onChange={(e) => handleWidgetChange(index, 'config.refreshInterval', Number(e.target.value))}
         InputProps={{
           inputProps: { min: 1 }
         }}
       />
     </Grid>

     {widget.config.showTrends && (
       <Grid item xs={12}>
         <TextField
           fullWidth
           label="Trend Time Window (minutes)"
           type="number"
           value={widget.config.trendWindow || 30}
           onChange={(e) => handleWidgetChange(index, 'config.trendWindow', Number(e.target.value))}
           InputProps={{
             inputProps: { min: 1 }
           }}
         />
       </Grid>
     )}
   </Grid>
 );
};

export default PeopleCounterWidgetConfig;
