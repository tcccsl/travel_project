<template>
  <view class="container">
    <!-- User Profile Header -->
    <view class="user-profile">
      <view class="profile-info">
        <image 
          class="user-avatar" 
          :src="userStore.user?.avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <text class="user-nickname">{{ userStore.user?.nickname || '游客' }}</text>
          <text class="user-stat">已发布 {{ diaries.length }} 篇游记</text>
        </view>
      </view>
      
      <view class="logout-button" @click="confirmLogout">
        <text class="logout-icon"><i class="fas fa-sign-out-alt"></i></text>
        <text class="logout-text">退出登录</text>
      </view>
    </view>
    
    <view class="content">
      <!-- Diary List -->
      <view class="diary-list" v-if="diaries.length > 0">
        <view class="diary-item" v-for="diary in diaries" :key="diary.id" @click="viewDiary(diary.id)">
          <view class="diary-info">
            <text class="diary-title">{{ diary.title }}</text>
            <view :class="['status-badge', getStatusClass(diary.status)]">
              <text class="status-text">{{ getStatusText(diary.status) }}</text>
            </view>
          </view>
          
          <!-- Rejection Reason (only for rejected diaries) -->
          <view class="reject-reason" v-if="diary.status === 'rejected' && diary.rejectReason">
            <text class="reason-label">拒绝原因:</text>
            <text class="reason-text">{{ diary.rejectReason }}</text>
          </view>
          
          <!-- Action Buttons -->
          <view class="actions">
            <view 
              class="action-button edit" 
              v-if="diary.status === 'pending' || diary.status === 'rejected'"
              @click.stop="editDiary(diary.id)"
            >
              <text class="button-text">编辑</text>
            </view>
            <view class="action-button delete" @click.stop="confirmDelete(diary.id)">
              <text class="button-text">删除</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Empty State -->
      <view class="empty-state" v-if="!loading && diaries.length === 0">
        <image class="empty-image" src="/static/empty-state.png" mode="aspectFit"></image>
        <text class="empty-text">暂无游记，点击发布</text>
      </view>
      
      <!-- Loading State -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
    
    <!-- Add Diary Button -->
    <view class="add-button" @click="navigateToPublish">
      <text class="add-text">发布游记</text>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user.js';
import api from '@/services/api.js';

export default {
  data() {
    return {
      diaries: [],
      loading: false,
      error: null,
      cacheKey: 'my_diaries_cache',
      cacheExpiration: 5 * 60 * 1000
    }
  },
  computed: {
    userStore() {
      return useUserStore();
    }
  },
  onLoad() {
    if (!this.userStore.token) {
      uni.redirectTo({
        url: '/pages/Login/Login'
      });
      return;
    }
    
    uni.removeStorageSync('my_diaries_cache');
    
    this.loadCachedData();
    
    this.fetchMyDiaries();
  },
  onPullDownRefresh() {
    this.fetchMyDiaries();
  },
  methods: {
    loadCachedData() {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          
          const now = Date.now();
          if (parsedData.timestamp && (now - parsedData.timestamp < this.cacheExpiration)) {
            this.diaries = parsedData.diaries || [];
            console.log('Loaded cached my diaries data');
          } else {
            console.log('My diaries cache expired');
            uni.removeStorageSync(this.cacheKey);
          }
        }
      } catch (e) {
        console.error('Failed to parse cached my diaries data:', e);
        uni.removeStorageSync(this.cacheKey);
      }
    },
    
    async fetchMyDiaries() {
      this.loading = true;
      
      try {
        const response = await api.diaries.getMine();
        this.diaries = response.data || [];
        
        this.cacheData();
      } catch (error) {
        this.error = error.message || 'Network error';
        uni.showToast({
          title: '获取游记失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return '';
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'pending': return '审核中';
        case 'approved': return '已通过';
        case 'rejected': return '已拒绝';
        default: return '未知状态';
      }
    },
    
    navigateToPublish() {
      uni.navigateTo({
        url: '/pages/Publish/Publish'
      });
    },
    
    editDiary(id) {
      uni.navigateTo({
        url: `/pages/Publish/Publish?id=${id}`
      });
    },
    
    confirmDelete(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这篇游记吗？该操作不可恢复',
        confirmColor: '#db4437',
        success: (res) => {
          if (res.confirm) {
            this.deleteDiary(id);
          }
        }
      });
    },
    
    async deleteDiary(id) {
      try {
        await api.diaries.delete(id);
        
        this.diaries = this.diaries.filter(diary => diary.id !== id);
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        this.cacheData();
      } catch (error) {
        uni.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      }
    },
    
    cacheData() {
      try {
        const cacheData = {
          diaries: this.diaries,
          timestamp: Date.now()
        };
        
        uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Failed to cache my diaries data:', e);
      }
    },
    
    confirmLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        confirmColor: '#db4437',
        success: (res) => {
          if (res.confirm) {
            this.logout();
          }
        }
      });
    },
    
    logout() {
      this.userStore.logout();
      uni.redirectTo({
        url: '/pages/Login/Login'
      });
    },

    viewDiary(id) {
      uni.navigateTo({
        url: `/pages/DiaryDetail/DiaryDetail?id=${id}`
      });
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #13547a 0%, #80d0c7 100%);
  font-family: 'Poppins', sans-serif;
  position: relative;
  padding-bottom: 200rpx;
}

.content {
  padding: 30rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.diary-item {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.diary-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.diary-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.status-pending {
  background-color: #ffc107;
}

.status-approved {
  background-color: #4caf50;
}

.status-rejected {
  background-color: #f44336;
}

.status-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
}

.reject-reason {
  background-color: rgba(244, 67, 54, 0.1);
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.reason-label {
  font-size: 24rpx;
  color: #f44336;
  font-weight: 600;
  margin-right: 8rpx;
}

.reason-text {
  font-size: 24rpx;
  color: #666;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 20rpx;
}

.action-button {
  padding: 16rpx 30rpx;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.action-button:active {
  transform: scale(1.05);
  box-shadow: 0 0 15rpx rgba(0, 0, 0, 0.2);
}

.edit {
  background: linear-gradient(135deg, #13547a 0%, #23a2f6 100%);
}

.delete {
  background-color: #db4437;
}

.button-text {
  color: white;
  font-size: 26rpx;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.loading-state {
  text-align: center;
  padding: 30rpx 0;
}

.loading-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.add-button {
  position: fixed;
  bottom: 140rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 90rpx;
  background: linear-gradient(135deg, #80d0c7 0%, #a3e4d7 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.add-button:active {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.3);
}

.add-text {
  color: white;
  font-size: 32rpx;
  font-weight: 600;
}

.user-profile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 4rpx solid rgba(59, 130, 246, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.user-stat {
  font-size: 24rpx;
  color: #666;
}

.logout-button {
  padding: 16rpx 30rpx;
  border-radius: 30rpx;
  background-color: #f44336;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;
}

.logout-button:active {
  transform: scale(1.05);
  box-shadow: 0 0 15rpx rgba(219, 68, 55, 0.4);
}

.logout-icon {
  color: white;
  margin-right: 8rpx;
  font-size: 26rpx;
}

.logout-text {
  color: white;
  font-size: 26rpx;
  font-weight: 500;
}
</style> 