import { defineStore } from 'pinia';
import api from '../services/api';

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    diaries: [],
    currentDiary: null,
    loading: false,
    error: null
  }),
  
  getters: {
    // Get all diaries
    getAllDiaries: (state) => state.diaries,
    
    // Get diary by ID
    getDiaryById: (state) => (id) => {
      return state.diaries.find(diary => diary.id === id) || null;
    }
  },
  
  actions: {
    // Fetch all diaries
    async fetchDiaries() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.diaries.getAll();
        this.diaries = response.data;
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch diaries';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Fetch a specific diary
    async fetchDiaryById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.diaries.getById(id);
        this.currentDiary = response.data;
        
        // Update diary in the list if it exists
        const index = this.diaries.findIndex(diary => diary.id === id);
        if (index !== -1) {
          this.diaries[index] = response.data;
        }
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to fetch diary with ID ${id}`;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Create a new diary
    async createDiary(diaryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.diaries.create(diaryData);
        this.diaries.push(response.data);
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create diary';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Update an existing diary
    async updateDiary(id, diaryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.diaries.update(id, diaryData);
        
        // Update the diary in the list
        const index = this.diaries.findIndex(diary => diary.id === id);
        if (index !== -1) {
          this.diaries[index] = response.data;
        }
        
        // Update current diary if it's being edited
        if (this.currentDiary && this.currentDiary.id === id) {
          this.currentDiary = response.data;
        }
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update diary';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Delete a diary
    async deleteDiary(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.diaries.delete(id);
        
        // Remove the diary from the list
        this.diaries = this.diaries.filter(diary => diary.id !== id);
        
        // Reset current diary if it's the one being deleted
        if (this.currentDiary && this.currentDiary.id === id) {
          this.currentDiary = null;
        }
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete diary';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 