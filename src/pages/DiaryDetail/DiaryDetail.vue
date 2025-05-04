<template>
  <view class="container">
    <!-- Back Button -->
    <view class="back-button" @click="goBack">
      <text class="back-icon"><i class="fas fa-arrow-left"></i></text>
    </view>
    
    <!-- Share Button -->
    <view class="share-button" @click="shareDiary">
      <text class="share-icon"><i class="fas fa-share-alt"></i></text>
    </view>
    
    <!-- Content Container -->
    <view class="content-container" v-if="diary && !error">
      <!-- Title -->
      <text class="diary-title">{{ diary.title }}</text>
      
      <!-- Author Info -->
      <view class="author-info">
        <image class="author-avatar" :src="diary.authorAvatar || '/static/default-avatar.png'" mode="aspectFill"></image>
        <text class="author-name">{{ diary.authorNickname }}</text>
      </view>
      
      <!-- Video (if exists) -->
      <view class="video-container" v-if="diary.video">
        <video 
          class="diary-video" 
          :src="diary.video" 
          controls 
          :poster="diary.images && diary.images.length > 0 ? diary.images[0] : ''" 
          show-play-btn="true"
          object-fit="cover"
          preload="auto"
        ></video>
      </view>
      
      <!-- Images -->
      <view class="images-container" v-if="diary.images && diary.images.length > 0">
        <swiper 
          class="images-swiper" 
          indicator-dots 
          indicator-active-color="#3B82F6"
          indicator-color="rgba(255, 255, 255, 0.5)"
        >
          <swiper-item v-for="(image, index) in diary.images" :key="index" @click="previewImage(index)">
            <image 
              class="diary-image" 
              :src="image" 
              mode="aspectFill" 
              :lazy-load="true"
              @error="handleImageError"
              :data-index="index"
            ></image>
          </swiper-item>
        </swiper>
      </view>
      
      <!-- Content -->
      <view class="content">
        <rich-text :nodes="diary.content"></rich-text>
      </view>
    </view>
    
    <!-- Error State -->
    <view class="error-container" v-if="error">
      <image class="error-image" src="/static/empty-state.png" mode="aspectFit"></image>
      <text class="error-text">游记不存在</text>
      <view class="error-button" @click="goBack">
        <text class="error-button-text">返回</text>
      </view>
    </view>
    
    <!-- Loading State -->
    <view class="loading-container" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import api from '@/services/api.js';

export default {
  data() {
    return {
      id: null,
      diary: null,
      loading: true,
      error: false,
      cacheKey: 'diary_detail_cache_'
    }
  },
  onLoad(options) {
    // Get diary ID from params
    this.id = options.id;
    
    if (!this.id) {
      this.error = true;
      this.loading = false;
      return;
    }
    
    // Try to load cached data first
    this.loadCachedData();
    
    // Fetch fresh data
    this.fetchDiaryDetail();
  },
  methods: {
    // Fetch diary detail from API
    async fetchDiaryDetail() {
      this.loading = true;
      
      try {
        const response = await api.diaries.getById(this.id);
        this.diary = response.data;
        
        // Cache the data
        this.cacheData();
      } catch (error) {
        console.error('Failed to fetch diary:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    
    // Cache data to storage
    cacheData() {
      try {
        const cacheData = {
          diary: this.diary,
          timestamp: Date.now()
        };
        
        uni.setStorageSync(this.cacheKey + this.id, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Failed to cache data:', e);
      }
    },
    
    // Load cached data
    loadCachedData() {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey + this.id);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          this.diary = parsedData.diary;
          
          // Check if cache is older than 30 minutes (1800000 ms)
          const isExpired = (Date.now() - parsedData.timestamp) > 1800000;
          
          if (isExpired) {
            console.log('Cache expired, fetching fresh data');
          } else {
            this.loading = false;
          }
        }
      } catch (e) {
        console.error('Failed to load cached data:', e);
      }
    },
    
    // Preview image in gallery mode
    previewImage(index) {
      if (!this.diary || !this.diary.images || this.diary.images.length === 0) {
        return;
      }
      
      uni.previewImage({
        current: index,
        urls: this.diary.images
      });
    },
    
    // Share diary
    shareDiary() {
      if (!this.diary) return;
      
      // Create share info
      const shareInfo = {
        title: this.diary.title,
        path: `/pages/DiaryDetail/DiaryDetail?id=${this.id}`,
        imageUrl: this.diary.images && this.diary.images.length > 0 ? this.diary.images[0] : ''
      };
      
      // Share with uni.share API
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession', // WXSceneSession for chat, WXSceneTimeline for moments
        type: 0, // 0: Text, 1: Image, 2: Music, 3: Video, 4: WebPage, 5: Mini Program
        title: shareInfo.title,
        summary: '来自Travel Diary的精彩游记',
        imageUrl: shareInfo.imageUrl,
        href: shareInfo.path,
        success: (res) => {
          console.log('Share success:', res);
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.error('Share failed:', err);
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          });
        }
      });
    },
    
    // Go back to previous page
    goBack() {
      uni.navigateBack();
    },
    
    // Handle image error
    handleImageError(e) {
      console.error('Image loading error:', e);
      // Replace broken images with a default one
      const index = e.target.dataset.index;
      if (index !== undefined && this.diary && this.diary.images) {
        // Replace broken image URL with default
        this.diary.images[index] = '/static/empty-state.png';
      }
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #13547a 0%, #80d0c7 100%);
  font-family: 'Poppins', sans-serif;
  position: relative;
}

.back-button, .share-button {
  position: fixed;
  top: 40rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s;
}

.back-button {
  left: 30rpx;
  background-color: rgba(153, 153, 153, 0.8);
}

.share-button {
  right: 30rpx;
  background: linear-gradient(135deg, #13547a 0%, #23a2f6 100%);
}

.back-button:active, .share-button:active {
  transform: scale(1.1);
  box-shadow: 0 0 20rpx rgba(255, 255, 255, 0.5);
}

.back-icon, .share-icon {
  color: white;
  font-size: 36rpx;
}

.content-container {
  margin: 120rpx 30rpx 30rpx;
  padding: 40rpx;
  background-color: white;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10rpx);
}

.diary-title {
  font-size: 56rpx;
  color: #1a3c5e;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 30rpx;
  display: block;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.author-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 4rpx solid rgba(59, 130, 246, 0.3);
}

.author-name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.video-container {
  margin-bottom: 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.diary-video {
  width: 100%;
  height: 400rpx;
  border-radius: 20rpx;
}

.images-container {
  margin-bottom: 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.images-swiper {
  width: 100%;
  height: 500rpx;
}

.diary-image {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.content {
  font-size: 32rpx;
  color: #333;
  line-height: 1.8;
}

.error-container, .loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.error-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.error-text, .loading-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40rpx;
}

.error-button {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
}

.error-button-text {
  font-size: 28rpx;
  color: #13547a;
  font-weight: 600;
}
</style> 