// src/Widgets/YoloWidgets/CameraStreamWidget.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';

const CameraStreamWidget = ({ config, showHeader = true }) => {
    const canvasRef = useRef(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('Configuring...');

    // Constants for connection management
    const MAX_RECONNECT_ATTEMPTS = 5;
    const BASE_RECONNECT_DELAY = 1000;

    // Zone colors based on type
    const ZONE_COLORS = {
        'entry_exit': '#FF4444',
        'occupancy': '#44FF44',
        'dwell': '#4444FF',
        'default': '#FFFFFF'
    };

    const connectWebSocket = useCallback((url) => {
        console.log(`Attempting WebSocket connection to: ${url}`);
        setStatus(`Connecting to camera...`);

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connection established');
            setStatus('Connected');
            setLoading(false);
            setError(null);
            reconnectAttemptsRef.current = 0;
        };

        ws.onclose = (event) => {
            console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
            setStatus('Disconnected');

            if (wsRef.current === null) return;

            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                const delay = Math.min(
                    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
                    30000
                );

                console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
                setStatus(`Reconnecting in ${delay/1000}s...`);

                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttemptsRef.current++;
                    connectWebSocket(url);
                }, delay);
            } else {
                setError('Maximum reconnection attempts reached');
                setStatus('Connection failed');
                setLoading(false);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Connection error');
            setStatus('Error connecting to camera');
        };


        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'frame_update') {
                    console.log('Frame update received:', {
                        fps: data.data.fps,
                        detections: data.data.detections?.length,
                        zones: data.data.zones?.length  // Log zone count
                    });
                    updateCanvas(data.data);
                    if (data.data.fps) {
                        setStatus(`Connected (${data.data.fps.toFixed(1)} FPS)`);
                    }
                }
            } catch (err) {
                console.error('Error processing frame:', err);
                setStatus('Error processing frame');
            }
        };

    }, []);

    const drawDetections = (ctx, detections) => {
        detections.forEach(detection => {
            const [x1, y1, x2, y2] = detection.bbox;
            
            // Draw bounding box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Draw confidence score with background
            const confidence = Math.round(detection.confidence * 100);
            const text = `${confidence}%`;
            ctx.font = '12px Arial';
            
            // Add background to text
            const textWidth = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x1, y1 - 16, textWidth + 4, 14);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillText(text, x1 + 2, y1 - 5);
        });
    };

    const drawZones = (ctx, zones) => {
        zones.forEach(zone => {
            ctx.beginPath();
            
            // Draw zone polygon
            if (zone.coordinates && zone.coordinates.length > 0) {
                ctx.moveTo(zone.coordinates[0][0], zone.coordinates[0][1]);
                for(let i = 1; i < zone.coordinates.length; i++) {
                    ctx.lineTo(zone.coordinates[i][0], zone.coordinates[i][1]);
                }
                ctx.closePath();
            }

            // Set zone style based on type
            ctx.strokeStyle = ZONE_COLORS[zone.zone_type] || ZONE_COLORS.default;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Fill with semi-transparent color
            ctx.fillStyle = `${ctx.strokeStyle}33`; // 20% opacity
            ctx.fill();

            // Draw zone name
            if (zone.name) {
                const [x, y] = zone.coordinates[0];
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.font = '14px Arial';
                const textWidth = ctx.measureText(zone.name).width;
                ctx.fillRect(x, y - 20, textWidth + 8, 20);
                
                ctx.fillStyle = ZONE_COLORS[zone.zone_type] || ZONE_COLORS.default;
                ctx.fillText(zone.name, x + 4, y - 6);
            }

            // Draw count if available
            if (zone.count !== undefined) {
                const centerX = zone.coordinates.reduce((sum, coord) => sum + coord[0], 0) / zone.coordinates.length;
                const centerY = zone.coordinates.reduce((sum, coord) => sum + coord[1], 0) / zone.coordinates.length;
                
                ctx.font = 'bold 16px Arial';
                const text = `Count: ${zone.count}`;
                const textWidth = ctx.measureText(text).width;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(centerX - textWidth/2 - 4, centerY - 10, textWidth + 8, 24);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.fillText(text, centerX, centerY + 6);
                ctx.textAlign = 'left';
            }
        });
    };

    const updateCanvas = (data) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Set canvas dimensions
            if (canvas.width !== img.width || canvas.height !== img.height) {
                canvas.width = img.width;
                canvas.height = img.height;
            }
            
            // Clear and draw new frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Draw zones if enabled
            if (config?.showZones && data.zones) {
                drawZones(ctx, data.zones);
            }

            // Draw detections if enabled
            if (config?.showDetections && data.detections) {
                drawDetections(ctx, data.detections);
            }

            // Draw timestamp if available
            if (data.timestamp) {
                const date = new Date(data.timestamp * 1000);
                const timeStr = date.toLocaleTimeString();
                
                ctx.font = '12px Arial';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(10, 10, 100, 20);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(timeStr, 15, 25);
            }
        };

        img.onerror = () => {
            console.error('Error loading frame');
            setStatus('Error loading frame');
        };

        img.src = `data:image/jpeg;base64,${data.frame}`;
    };

    useEffect(() => {
        let unmounted = false;

        // Reset state
        setLoading(true);
        setError(null);
        setStatus('Configuring...');
        reconnectAttemptsRef.current = 0;

        // Cleanup existing connection
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (!config?.cameraId) {
            setError('No camera selected');
            setStatus('No camera configured');
            setLoading(false);
            return;
        }

        // Setup WebSocket URL
        const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname || 'localhost';
        const wsPort = process.env.REACT_APP_WS_PORT || '58000';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsBaseUrl = `${wsProtocol}//${wsHost}:${wsPort}`;
        const wsUrl = `${wsBaseUrl}/ws/cv/camera/${config.cameraId}/`;

        console.log('Camera configuration:', {
            cameraId: config.cameraId,
            wsUrl: wsUrl,
            showDetections: config.showDetections,
            showZones: config.showZones
        });

        try {
            connectWebSocket(wsUrl);
        } catch (err) {
            console.error('Error initializing WebSocket:', err);
            setError(`Failed to initialize connection: ${err.message}`);
            setStatus('Connection failed');
            setLoading(false);
        }

        return () => {
            console.log('Cleaning up camera stream connection');
            unmounted = true;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (wsRef.current) {
                console.log('Closing WebSocket connection');
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
        };
    }, [config?.cameraId, config?.showDetections, config?.showZones, connectWebSocket]);

    return (
        <WidgetWrapper title={config?.title || 'Camera Stream'} showHeader={showHeader}>
            <Box sx={{ 
                position: 'relative', 
                height: '100%', 
                width: '100%', 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.paper'
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
                            bgcolor: 'rgba(0,0,0,0.7)',
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