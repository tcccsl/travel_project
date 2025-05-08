<template>
  <view class="container">
    <!-- Floating Action Buttons -->
    <view class="floating-actions">
      <view class="action-button back-button" @click="goBack">
        <text class="button-icon"><i class="fas fa-arrow-left"></i></text>
      </view>
      
      <view class="action-button share-button" @click="shareDiary">
        <text class="button-icon"><i class="fas fa-share-alt"></i></text>
      </view>
    </view>
    
    <!-- Content Container -->
    <view class="content-container" v-if="diary && !error">
      <!-- Cover Image or First Image as Banner -->
      <view class="banner-container">
        <image 
          class="banner-image" 
          :src="diary.coverImage || (diary.images && diary.images.length > 0 ? diary.images[0] : '/static/default-image.jpg')" 
          mode="aspectFill"
        ></image>
        <view class="banner-gradient"></view>
        <view class="banner-content">
          <text class="diary-title">{{ diary.title }}</text>
          <view class="date-tag">
            <text class="date-icon"><i class="fas fa-calendar-alt"></i></text>
            <text class="date-text">{{ diary.createdAt }}</text>
          </view>
        </view>
      </view>
      
      <view class="main-content">
        <!-- Author Info -->
        <view class="author-card">
          <image class="author-avatar" :src="diary.authorAvatar || '/static/default-avatar.png'" mode="aspectFill"></image>
          <view class="author-details">
            <text class="author-name">{{ diary.authorNickname }}</text>
            <text class="author-title">旅行爱好者</text>
          </view>
        </view>
        
        <!-- Images Gallery -->
        <view class="media-section" v-if="diary.images && diary.images.length > 0">
          <view class="section-title">
            <text class="title-icon"><i class="fas fa-images"></i></text>
            <text class="title-text">旅行照片</text>
          </view>
          
          <view class="images-container">
            <swiper 
              class="images-swiper" 
              indicator-dots 
              indicator-active-color="#3B82F6"
              indicator-color="rgba(255, 255, 255, 0.5)"
              autoplay
              interval="3000"
              circular
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
                <view class="image-number">{{ index + 1 }}/{{ diary.images.length }}</view>
              </swiper-item>
            </swiper>
          </view>
          
          <!-- Image Thumbnails -->
          <scroll-view class="thumbnails-container" scroll-x="true" show-scrollbar="false">
            <view 
              v-for="(image, index) in diary.images" 
              :key="index" 
              class="thumbnail" 
              :class="{ 'active': index === currentImageIndex }"
              @click="previewImage(index)"
            >
              <image 
                class="thumbnail-image" 
                :src="image" 
                mode="aspectFill"
              ></image>
            </view>
          </scroll-view>
        </view>
        
        <!-- Content -->
        <view class="content-section">
          <view class="section-title">
            <text class="title-icon"><i class="fas fa-book-open"></i></text>
            <text class="title-text">旅行故事</text>
          </view>
          
          <view class="diary-content">
            <rich-text :nodes="diary.content"></rich-text>
          </view>
        </view>
        <!-- 视频展示区：如果有视频则显示 -->
        <view class="media-section" v-if="diary.video">
          <view class="section-title">
            <text class="title-icon"><i class="fas fa-film"></i></text>
            <text class="title-text">旅行视频</text>
          </view>
          <view class="video-container">
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
        </view>
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
      <view class="loading-spinner"></view>
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
      cacheKey: 'diary_detail_cache_',
      currentImageIndex: 0,
      showShareMenu: false,
      isAdmin: false
    }
  },
  onLoad(options) {
    // Get diary ID from params
    this.id = options.id;
    
    // 检查是否是管理员视图
    this.isAdmin = options.admin === 'true';
    
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
        let response;
        if (this.isAdmin) {
          // 如果是管理员，尝试使用管理员API获取游记
          try {
            response = await api.admin.getDiaryById(this.id);
          } catch (adminError) {
            response = await api.diaries.getById(this.id);
          }
        } else {
          // 普通用户视图
          response = await api.diaries.getById(this.id);
        }
        
        // 解析响应数据
        if (response && response.code === 200 && response.data) {
          // 直接使用后端返回的数据
          this.diary = response.data;
          console.log('diary detail:', this.diary);
          
          // 检查并调整游记数据
          if (!this.diary.createdAt && this.diary.createTime) {
            this.diary.createdAt = this.diary.createTime;
          }
          
          // 检查封面图片
          if (!this.diary.coverImage && this.diary.images && this.diary.images.length > 0) {
            this.diary.coverImage = this.diary.images[0];
          }
          
          // 检查作者头像
          if (!this.diary.authorAvatar) {
            this.diary.authorAvatar = '/static/default-avatar.png';
          }
        } else {
          this.error = true;
        }
        
        // Cache the data
        this.cacheData();
      } catch (error) {
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
        // 缓存失败，但非致命错误，可以继续
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
          
          if (!isExpired) {
            this.loading = false;
          }
        }
      } catch (e) {
        // 缓存加载失败，但非致命错误，可以继续
      }
    },
    
    // Preview image in gallery mode
    previewImage(index) {
      if (!this.diary || !this.diary.images || this.diary.images.length === 0) {
        return;
      }
      
      this.currentImageIndex = index;
      
      uni.previewImage({
        current: index,
        urls: this.diary.images
      });
    },
    
    // Share diary
    shareDiary() {
      if (!this.diary) return;
      
      // 显示原生分享菜单，如果平台支持
      // #ifdef APP-PLUS || MP-WEIXIN || MP-QQ || MP-TOUTIAO
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline'],
        success: () => {
          // 分享菜单显示成功
        },
        fail: (err) => {
          // 分享菜单显示失败，使用自定义分享选项
          this.showCustomShareOptions();
        }
      });
      // #endif
      
      // 在其他平台上使用自定义分享方式
      // #ifdef H5 || MP-ALIPAY || MP-BAIDU
      this.showCustomShareOptions();
      // #endif
    },
    
    // 显示自定义分享选项
    showCustomShareOptions() {
      // 获取分享信息
      const shareInfo = {
        title: this.diary.title,
        imageUrl: this.diary.images && this.diary.images.length > 0 ? this.diary.images[0] : '',
        description: '来自Travel Diary的精彩游记，点击查看详情',
        link: `/pages/DiaryDetail/DiaryDetail?id=${this.id}`
      };
      
      // 使用uni-popup组件显示分享选项
      uni.showActionSheet({
        itemList: ['复制链接', '分享到微信', '分享到朋友圈', '分享到微博'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 复制链接
              uni.setClipboardData({
                data: `${window.location.origin}${shareInfo.link}`,
                success: () => {
                  uni.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  });
                }
              });
              break;
            case 1:
            case 2:
            case 3:
              // 打开系统分享（如果支持）
              // #ifdef APP-PLUS
              uni.share({
                provider: res.tapIndex === 3 ? 'sinaweibo' : 'weixin',
                scene: res.tapIndex === 2 ? 'WXSceneTimeline' : 'WXSceneSession',
                type: 0,
                title: shareInfo.title,
                summary: shareInfo.description,
                imageUrl: shareInfo.imageUrl,
                href: shareInfo.link,
                success: () => {
                  uni.showToast({ title: '分享成功', icon: 'success' });
                },
                fail: () => {
                  uni.showToast({ title: '分享失败', icon: 'none' });
                }
              });
              // #endif
              
              // #ifdef H5
              // H5环境下，弹出提示并引导用户手动分享
              uni.showToast({
                title: '请截图或复制链接分享',
                icon: 'none',
                duration: 2000
              });
              // #endif
              break;
          }
        }
      });
    },
    
    // Go back to previous page
    goBack() {
      uni.navigateBack();
    },
    
    // Handle image error
    handleImageError(e) {
      // Replace broken images with a default one
      const index = e.target.dataset.index;
      if (index !== undefined && this.diary && this.diary.images) {
        // Replace broken image URL with default
        this.diary.images[index] = '/static/empty-state.png';
      }
    }
  },
  // 定义onShareAppMessage用于小程序分享
  // #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
  onShareAppMessage() {
    if (!this.diary) return {};
    
    return {
      title: this.diary.title,
      path: `/pages/DiaryDetail/DiaryDetail?id=${this.id}`,
      imageUrl: this.diary.images && this.diary.images.length > 0 ? this.diary.images[0] : ''
    };
  },
  // #endif
  
  // 定义onShareTimeline用于小程序分享到朋友圈
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    if (!this.diary) return {};
    
    return {
      title: this.diary.title,
      query: `id=${this.id}`,
      imageUrl: this.diary.images && this.diary.images.length > 0 ? this.diary.images[0] : ''
    };
  }
  // #endif
}
</script>

<style>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #ebf2f8 100%);
  background-image: 
    linear-gradient(135deg, #f6f9fc 0%, #ebf2f8 100%),
    radial-gradient(circle at 50% 50%, rgba(76, 110, 245, 0.05) 0%, rgba(76, 110, 245, 0) 70%);
  background-attachment: fixed;
  position: relative;
}

/* Floating Action Buttons */
.floating-actions {
  position: fixed;
  top: var(--status-bar-height, 25px);
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
}

.action-button {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.back-button {
  background-color: rgba(255, 255, 255, 0.8);
}

.share-button {
  background: linear-gradient(135deg, #4c6ef5 0%, #15aabf 100%);
  position: relative;
  overflow: hidden;
}

.button-icon {
  font-size: 40rpx;
}

.back-button .button-icon {
  color: #333;
}

.share-button .button-icon {
  color: white;
}

.action-button:active {
  transform: scale(1.1);
  box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.3);
}

/* Banner */
.banner-container {
  position: relative;
  height: 500rpx;
  width: 100%;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 250rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.banner-content {
  position: absolute;
  bottom: 40rpx;
  left: 40rpx;
  right: 40rpx;
}

.diary-title {
  font-size: 48rpx;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 20rpx;
  display: block;
  line-height: 1.3;
}

.date-tag {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  backdrop-filter: blur(5px);
}

.date-icon {
  color: white;
  margin-right: 10rpx;
  font-size: 24rpx;
}

.date-text {
  color: white;
  font-size: 24rpx;
}

/* Main Content */
.main-content {
  margin-top: -50rpx;
  border-radius: 40rpx 40rpx 0 0;
  background-color: #fff;
  padding: 40rpx;
  position: relative;
  z-index: 2;
  box-shadow: 0 -20rpx 40rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(76, 110, 245, 0.1);
}

/* Author Card */
.author-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin-bottom: 40rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(76, 110, 245, 0.05);
}

.author-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 30rpx;
  border: 5rpx solid white;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.author-title {
  font-size: 26rpx;
  color: #666;
}

/* Section Styles */
.media-section, .content-section {
  margin-bottom: 60rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  border-left: 8rpx solid #4c6ef5;
  padding-left: 20rpx;
}

.title-icon {
  color: #4c6ef5;
  font-size: 32rpx;
  margin-right: 15rpx;
}

.title-text {
  font-size: 34rpx;
  color: #333;
  font-weight: 600;
}

/* Video Container */
.video-container {
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  margin-bottom: 30rpx;
}

.diary-video {
  width: 100%;
  height: 420rpx;
  border-radius: 20rpx;
}

/* Images Container */
.images-container {
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  margin-bottom: 20rpx;
  position: relative;
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

.image-number {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

/* Thumbnails */
.thumbnails-container {
  display: flex;
  white-space: nowrap;
  padding: 15rpx 0;
}

.thumbnail {
  display: inline-block;
  width: 140rpx;
  height: 100rpx;
  margin-right: 15rpx;
  border-radius: 10rpx;
  overflow: hidden;
  opacity: 0.7;
  transition: all 0.3s;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.thumbnail.active {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.2);
  border: 3rpx solid #4c6ef5;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Diary Content */
.diary-content {
  font-size: 32rpx;
  line-height: 1.8;
  color: #333;
  padding: 20rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(76, 110, 245, 0.05);
}

/* Error and Loading States */
.error-container, .loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #4c6ef5 0%, #15aabf 100%);
  background-image: 
    linear-gradient(135deg, #4c6ef5 0%, #15aabf 100%),
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
}

.error-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.error-text {
  font-size: 32rpx;
  color: white;
  margin-bottom: 40rpx;
}

.error-button {
  background-color: white;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
}

.error-button-text {
  font-size: 30rpx;
  color: #4c6ef5;
  font-weight: 600;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

.loading-text {
  font-size: 32rpx;
  color: white;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Adjustments */
@media (min-width: 768px) {
  .main-content {
    max-width: 1200rpx;
    margin: -80rpx auto 0;
    padding: 60rpx;
  }
  
  .diary-title {
    font-size: 60rpx;
  }
  
  .banner-container {
    height: 600rpx;
  }
  
  .diary-video, .images-swiper {
    height: 600rpx;
  }
  
  .thumbnail {
    width: 180rpx;
    height: 120rpx;
  }
}

/* Add a pulse effect to the share button to make it more noticeable */
.share-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transform: scale(0);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style> 