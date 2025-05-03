import { defineStore } from 'pinia'

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    diaries: []
  }),
  actions: {
    setDiaries(diaries) {
      this.diaries = diaries
    }
  }
}) 