import { defineStore } from 'pinia';

export const useDiaryStore = defineStore('diary', {
  state: () => {
    // 从持久化存储初始化状态
    const cachedDiary = uni.getStorageSync('current_diary') || null;
    
    return {
      // 当前编辑的游记数据
      title: cachedDiary?.title || '',
      content: cachedDiary?.content || '',
      images: cachedDiary?.images || [],
      video: cachedDiary?.video || '',
      diaryId: cachedDiary?.id || null,
      coverImage: cachedDiary?.coverImage || '',
      location: cachedDiary?.location || '',
      tags: cachedDiary?.tags || []
    };
  },
  
  getters: {
    // 获取当前游记数据
    currentDiary: (state) => {
      return {
        id: state.diaryId,
        title: state.title,
        content: state.content,
        images: state.images,
        video: state.video,
        coverImage: state.coverImage,
        location: state.location,
        tags: state.tags
      };
    },
    
    // 检查是否有正在编辑的游记
    hasDiary: (state) => !!state.title || !!state.content || state.images.length > 0 || !!state.video
  },
  
  actions: {
    // 设置当前编辑的游记
    setDiary(diaryData) {
      if (!diaryData) return;
      
      this.diaryId = diaryData.id || null;
      this.title = diaryData.title || '';
      this.content = diaryData.content || '';
      this.images = diaryData.images || [];
      this.video = diaryData.video || '';
      this.coverImage = diaryData.coverImage || '';
      this.location = diaryData.location || '';
      this.tags = diaryData.tags || [];
      
      // 持久化存储当前编辑的游记
      uni.setStorageSync('current_diary', this.currentDiary);
    },
    
    // 清除当前编辑的游记
    clearDiary() {
      this.diaryId = null;
      this.title = '';
      this.content = '';
      this.images = [];
      this.video = '';
      this.coverImage = '';
      this.location = '';
      this.tags = [];
      
      // 清除持久化存储
      uni.removeStorageSync('current_diary');
    },
    
    // 更新游记中的单个字段
    updateField(field, value) {
      if (this[field] !== undefined) {
        this[field] = value;
        
        // 更新持久化存储
        uni.setStorageSync('current_diary', this.currentDiary);
      }
    },
    
    // 添加图片
    addImage(imageUrl) {
      if (imageUrl && typeof imageUrl === 'string') {
        this.images.push(imageUrl);
        
        // 如果没有封面图，将第一张图片设为封面
        if (!this.coverImage && this.images.length === 1) {
          this.coverImage = imageUrl;
        }
        
        // 更新持久化存储
        uni.setStorageSync('current_diary', this.currentDiary);
      }
    },
    
    // 删除图片
    removeImage(index) {
      if (index >= 0 && index < this.images.length) {
        // 如果删除的是封面图，重新设置封面
        if (this.coverImage === this.images[index]) {
          this.coverImage = this.images.length > 1 ? this.images[0] : '';
        }
        
        this.images.splice(index, 1);
        
        // 更新持久化存储
        uni.setStorageSync('current_diary', this.currentDiary);
      }
    }
  }
}); 