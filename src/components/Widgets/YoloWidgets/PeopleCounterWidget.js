// src/Widgets/YoloWidgets/PeopleCounterWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';

const PeopleCounterWidget = ({ config, showHeader = true }) => {
    const [counts, setCounts] = useState({ current: 0, entering: 0, exiting: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('Connecting...');
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);

    // Constants for connection management
    const MAX_RECONNECT_ATTEMPTS = 5;
    const BASE_RECONNECT_DELAY = 1000;

    useEffect(() => {
        let unmounted = false;

        const connectWebSocket = () => {
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                setStatus('Not authenticated');
                setLoading(false);
                return;
            }

            // Setup WebSocket URL
            const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname || 'localhost';
            const wsPort = process.env.REACT_APP_WS_PORT || '58000';
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsBaseUrl = `${wsProtocol}//${wsHost}:${wsPort}`;
            const wsUrl = `${wsBaseUrl}/ws/cv/zone/${config.zoneId}/?token=${token}`;

            console.log('Connecting to WebSocket:', {
                url: wsUrl,
                zoneId: config.zoneId,
                hasToken: !!token
            });

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (unmounted) return;
                console.log('Zone WebSocket connected');
                setStatus('Connected');
                setLoading(false);
                setError(null);
                reconnectAttemptsRef.current = 0;

                // Send initial authentication
                ws.send(JSON.stringify({
                    type: 'authentication',
                    token: token
                }));
            };

            ws.onclose = (event) => {
                if (unmounted) return;
                console.log('Zone WebSocket closed:', event);
                setStatus('Disconnected');

                // Don't reconnect if it was an authentication failure
                if (event.code === 4003) {
                    setError('Authentication failed');
                    setStatus('Authentication required');
                    setLoading(false);
                    return;
                }

                if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(
                        BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
                        30000
                    );
                    console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
                    setStatus(`Reconnecting in ${delay/1000}s...`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (!unmounted) {
                            reconnectAttemptsRef.current++;
                            connectWebSocket();
                        }
                    }, delay);
                } else {
                    setError('Maximum reconnection attempts reached');
                    setStatus('Connection failed');
                    setLoading(false);
                }
            };

            ws.onerror = (error) => {
                if (unmounted) return;
                console.error('Zone WebSocket error:', error);
                setError('Connection error');
                setStatus('Error connecting to zone');
            };

            ws.onmessage = (event) => {
                if (unmounted) return;
                try {
                    const data = JSON.parse(event.data);
                    console.log('Zone update received:', data);
                    
                    switch (data.type) {
                        case 'zone_update':
                            setCounts(prevCounts => ({
                                ...prevCounts,
                                current: data.data.person_count
                            }));
                            setStatus(`Last update: ${new Date().toLocaleTimeString()}`);
                            break;
                        case 'authentication_success':
                            console.log('Authentication successful');
                            break;
                        case 'authentication_error':
                            setError('Authentication failed');
                            setStatus('Authentication required');
                            ws.close();
                            break;
                        default:
                            console.log('Unknown message type:', data.type);
                    }
                } catch (err) {
                    console.error('Error processing zone update:', err);
                }
            };
        };

        if (config?.zoneId) {
            connectWebSocket();
        } else {
            setError('No zone selected');
            setStatus('No zone configured');
            setLoading(false);
        }

        return () => {
            unmounted = true;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
        };
    }, [config?.zoneId]);

    return (
        <WidgetWrapper title={config?.title || 'People Counter'} showHeader={showHeader}>
            <Box sx={{ 
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                bgcolor: 'background.paper', // White background
                color: 'text.primary',      // Black text
                borderRadius: 1,
                p: 2
            }}>
                {loading ? (
                    <>
                        <CircularProgress />
                        <Typography 
                            sx={{ 
                                mt: 2,
                                color: 'text.primary'  // Ensure black text during loading
                            }}
                        >
                            {status}
                        </Typography>
                    </>
                ) : error ? (
                    <Typography 
                        color="error" 
                        align="center"
                    >
                        {error}
                    </Typography>
                ) : (
                    <>
                        <Typography 
                            variant="h3" 
                            component="div"
                            sx={{
                                color: 'text.primary',  // Black text for count
                                fontWeight: 'bold',
                                mb: 1
                            }}
                        >
                            {counts.current}
                        </Typography>
                        <Typography 
                            variant="subtitle1" 
                            sx={{
                                color: 'text.primary',  // Black text for label
                                mb: 2
                            }}
                        >
                            People in Zone
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                padding: '4px 8px',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 1
                            }}
                        >
                            {status}
                        </Typography>
                    </>
                )}
            </Box>
        </WidgetWrapper>
    );
};

export default PeopleCounterWidget;