import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:58000/api/v1';

const apiService = axios.create({
  baseURL: API_URL,
  // Remove the default Content-Type header
});

// Add this to your request interceptor
apiService.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    // Don't set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();
        return apiService(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Add this method to handle dashboard creation
apiService.createDashboard = async (dashboardName) => {
  try {
    const response = await apiService.post('/dashboards/', { name: dashboardName });
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.createDashboardGroup = async (siteId, groupName) => {
  try {
    const response = await apiService.post('/dashboard-groups/', { name: groupName, site: siteId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.updateDashboardGroup = async (groupId, groupName) => {
  try {
    const response = await apiService.put(`/dashboard-groups/${groupId}/`, { name: groupName });
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.deleteDashboardGroup = async (groupId) => {
  try {
    await apiService.delete(`/dashboard-groups/${groupId}/`);
  } catch (error) {
    throw error;
  }
};

apiService.updateDashboard = async (dashboardId, data) => {
  try {
    const response = await apiService.put(`/dashboards/${dashboardId}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.getDashboardGroupsBySite = async (siteId) => {
  try {
    const response = await apiService.get(`/dashboard-groups/by_site/?site=${siteId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.saveChartConfig = async (chartConfigData) => {
  try {
    const response = await apiService.post('/chart-configs/', chartConfigData);
    return response.data;
  } catch (error) {
    console.error('Error saving chart configuration:', error);
    throw error;
  }
};

apiService.getChartConfigurations = async (siteId) => {
  try {
    const response = await apiService.get(`/chart-configs/by_site/?site=${siteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chart configurations:', error);
    throw error;
  }
};

apiService.createChartConfiguration = async (chartConfigData) => {
  try {
    const response = await apiService.post('/chart-configs/', chartConfigData);
    return response.data;
  } catch (error) {
    console.error('Error creating chart configuration:', error);
    throw error;
  }
};

apiService.updateChartConfiguration = async (chartConfigId, chartConfigData) => {
  try {
    const response = await apiService.put(`/chart-configs/${chartConfigId}/`, chartConfigData);
    return response.data;
  } catch (error) {
    console.error('Error updating chart configuration:', error);
    throw error;
  }
};

apiService.deleteChartConfiguration = async (chartConfigId) => {
  try {
    await apiService.delete(`/chart-configs/${chartConfigId}/`);
  } catch (error) {
    console.error('Error deleting chart configuration:', error);
    throw error;
  }
};

apiService.getCompanyTheme = async () => {
  try {
    const response = await apiService.get('/company/theme/');
    return response.data.theme;
  } catch (error) {
    console.error('Error fetching company theme:', error);
    throw error;
  }
};

apiService.setCompanyTheme = async (theme) => {
  try {
    const response = await apiService.put('/company/theme/', { theme });
    return response.data.theme;
  } catch (error) {
    console.error('Error setting company theme:', error);
    throw error;
  }
};

apiService.uploadGeoSVG = async (dashboardId, formData) => {
  try {
    const response = await apiService.post(`/dashboards/${dashboardId}/upload_geo_svg/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // The Authorization header will be added by the interceptor
      },
    });
    return response;
  } catch (error) {
    console.error('Error uploading GeoSVG:', error);
    throw error;
  }
};

apiService.getValueRangeProfile = async (profileId) => {
  try {
    const response = await apiService.get(`/value-range-profiles/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Value Range Profile:', error);
    throw error;
  }
};

apiService.getUploadedImage = async (imageId) => {
  try {
    const response = await apiService.get(`/uploaded-images/${imageId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching uploaded image:', error);
    throw error;
  }
};

apiService.uploadImage = async (formData) => {
  try {
    const response = await apiService.post('/uploaded-images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

apiService.deleteImage = async (imageId) => {
  try {
    await apiService.delete(`/uploaded-images/${imageId}/`);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

apiService.getImageWidget = async (id) => {
  try {
    const response = await apiService.get(`/image-widgets/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching image widget:', error);
    throw error;
  }
};

export default apiService;