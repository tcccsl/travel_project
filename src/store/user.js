import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,
    error: null
  }),
  
  getters: {
    // Get current user
    currentUser: (state) => state.user,
    
    // Check if user is authenticated
    isAuthenticated: (state) => state.isLoggedIn && !!state.token
  },
  
  actions: {
    // Login user
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.users.login(credentials);
        this.setUserData(response.data);
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Register user
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.users.register(userData);
        this.setUserData(response.data);
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Get user profile
    async fetchUserProfile() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const response = await api.users.getProfile();
        this.user = response.data;
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Set user data after successful authentication
    setUserData(data) {
      this.user = data.user;
      this.token = data.token;
      this.isLoggedIn = true;
      
      // Save token to localStorage
      uni.setStorageSync('token', data.token);
    },
    
    // Logout user
    logout() {
      this.user = null;
      this.token = null;
      this.isLoggedIn = false;
      
      // Remove token from localStorage
      uni.removeStorageSync('token');
    },
    
    // Initialize store with saved token
    init() {
      const token = uni.getStorageSync('token');
      if (token) {
        this.token = token;
        this.isLoggedIn = true;
        this.fetchUserProfile().catch(() => this.logout());
      }
    }
  }
}); 