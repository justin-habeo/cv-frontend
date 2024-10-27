// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:58000';

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/token/`, { username, password });
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to decode the JWT to get user information
      // For now, we'll just return a simple object
      return { token };
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const response = await axios.post(`${API_URL}/api/token/refresh/`, { refresh: refreshToken });
        if (response.data.access) {
          localStorage.setItem('token', response.data.access);
        }
        return response.data;
      } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
      }
    }
  }
};

export default authService;