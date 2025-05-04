import axios from 'axios';

// Base URL configuration
const API_URL = 'https://api-example.com'; // Replace with your actual API URL

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// API endpoints
export default {
  // Diary related endpoints
  diaries: {
    getAll() {
      return apiClient.get('/diaries');
    },
    getById(id) {
      return apiClient.get(`/diaries/${id}`);
    },
    create(diary) {
      return apiClient.post('/diaries', diary);
    },
    update(id, diary) {
      return apiClient.put(`/diaries/${id}`, diary);
    },
    delete(id) {
      return apiClient.delete(`/diaries/${id}`);
    }
  },
  
  // User related endpoints
  users: {
    login(credentials) {
      return apiClient.post('/auth/login', credentials);
    },
    register(userData) {
      return apiClient.post('/auth/register', userData);
    },
    getProfile() {
      return apiClient.get('/auth/profile');
    }
  }
}; 