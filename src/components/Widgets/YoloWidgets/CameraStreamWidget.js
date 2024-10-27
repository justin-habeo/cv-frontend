// src/Widgets/YoloWidgets/CameraStreamWidget.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';

const CameraStreamWidget = ({ config, showHeader = true }) => {
   console.log('CameraStreamWidget config:', config); // Debug camera ID

   const canvasRef = useRef(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [status, setStatus] = useState('Configuring...');
   const wsRef = useRef(null);

   useEffect(() => {
       let isActive = true;

       if (!config?.cameraId) {
           setError('No camera selected');
           setStatus('No camera configured');
           setLoading(false);
           return;
       }

       setStatus('Connecting to camera...');

       const wsBaseUrl = 'ws://localhost:58000';  // hardcoded for now as discussed
       const wsUrl = `${wsBaseUrl}/ws/cv/camera/${config.cameraId}/`;

       console.log('Connecting to WebSocket:', wsUrl);
       
       try {
           const ws = new WebSocket(wsUrl);
           wsRef.current = ws;
           
           ws.onopen = () => {
               if (!isActive) return;
               console.log('WebSocket connected');
               setStatus('Connected');
               setLoading(false);
           };

           ws.onmessage = (event) => {
               if (!isActive) return;
               
               try {
                   const data = JSON.parse(event.data);
                   if (data.type === 'frame_update') {
                       updateCanvas(data.data);
                   }
               } catch (err) {
                   console.error('Error processing frame:', err);
               }
           };

           ws.onerror = (error) => {
               if (!isActive) return;
               console.error('WebSocket error:', error);
               setError('Connection error');
               setStatus('Error connecting to camera');
               setLoading(false);
           };

           ws.onclose = () => {
               if (!isActive) return;
               console.log('WebSocket closed');
               setStatus('Disconnected');
               if (isActive) {
                   setTimeout(() => {
                       if (isActive) {
                           setStatus('Reconnecting...');
                       }
                   }, 5000);
               }
           };
       } catch (err) {
           console.error('Error setting up WebSocket:', err);
           setError(`Failed to connect: ${err.message}`);
           setStatus('Connection failed');
           setLoading(false);
       }

       return () => {
           console.log('Cleaning up WebSocket connection');
           isActive = false;
           if (wsRef.current) {
               wsRef.current.close();
           }
       };
   }, [config?.cameraId]);

   const updateCanvas = (data) => {
       const canvas = canvasRef.current;
       if (!canvas) return;

       const ctx = canvas.getContext('2d');
       if (!ctx) return;

       const img = new Image();
       img.onload = () => {
           canvas.width = img.width;
           canvas.height = img.height;
           
           // Draw the frame
           ctx.drawImage(img, 0, 0);

           // Draw detections if enabled
           if (config?.showDetections && data.detections) {
               data.detections.forEach(detection => {
                   const [x1, y1, x2, y2] = detection.bbox;
                   ctx.strokeStyle = '#00ff00';
                   ctx.lineWidth = 2;
                   ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

                   // Draw confidence
                   ctx.fillStyle = '#00ff00';
                   ctx.font = '12px Arial';
                   ctx.fillText(
                       `${Math.round(detection.confidence * 100)}%`,
                       x1,
                       y1 - 5
                   );
               });
           }
       };
       img.src = `data:image/jpeg;base64,${data.frame}`;
   };

   return (
       <WidgetWrapper title={config?.title || 'Camera Stream'} showHeader={showHeader}>
           <Box sx={{ 
               position: 'relative', 
               height: '100%', 
               width: '100%', 
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
               alignItems: 'center'
           }}>
               {loading && (
                   <>
                       <CircularProgress />
                       <Typography sx={{ mt: 2 }}>{status}</Typography>
                   </>
               )}
               {error && (
                   <Typography color="error" align="center">
                       {error}
                   </Typography>
               )}
               <canvas
                   ref={canvasRef}
                   style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'contain',
                       display: loading || error ? 'none' : 'block'
                   }}
               />
               {!loading && !error && (
                   <Typography 
                       variant="caption" 
                       sx={{ 
                           position: 'absolute', 
                           bottom: 8, 
                           right: 8,
                           bgcolor: 'rgba(0,0,0,0.5)',
                           color: 'white',
                           padding: '2px 6px',
                           borderRadius: 1
                       }}
                   >
                       {status}
                   </Typography>
               )}
           </Box>
       </WidgetWrapper>
   );
};

export default CameraStreamWidget;