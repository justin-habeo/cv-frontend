// src/services/computerVisionService.js
const CV_API_BASE = '/api/v1/cv';

export const computerVisionService = {
  async getCameras(siteId) {
    const response = await fetch(`${CV_API_BASE}/cameras/by-site/?site=${siteId}`);
    if (!response.ok) throw new Error('Failed to fetch cameras');
    return response.json();
  },

  async getZones(cameraId) {
    const response = await fetch(`${CV_API_BASE}/zones/by-camera/?camera=${cameraId}`);
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  async getZoneStatistics(zoneId, timeRange) {
    const response = await fetch(`${CV_API_BASE}/events/zone_statistics/?zone=${zoneId}&time_range=${timeRange}`);
    if (!response.ok) throw new Error('Failed to fetch zone statistics');
    return response.json();
  },

  async startCameraProcessing(cameraId) {
    const response = await fetch(`${CV_API_BASE}/cameras/${cameraId}/start_processing/`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to start camera processing');
    return response.json();
  },

  async stopCameraProcessing(cameraId) {
    const response = await fetch(`${CV_API_BASE}/cameras/${cameraId}/stop_processing/`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to stop camera processing');
    return response.json();
  }
};
