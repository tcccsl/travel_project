<template>
  <view class="container">
    <view class="header">
      <text class="title">My Travel Diary</text>
    </view>
    <view class="content">
      <text v-if="diaries.length === 0" class="empty-text">No diaries yet. Start creating your travel memories!</text>
      <!-- Diary list will be added here -->
    </view>
    <view class="add-button" @click="navigateToCreate">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      diaries: []
    }
  },
  methods: {
    navigateToCreate() {
      // Navigation function to create diary page (will be implemented later)
      uni.showToast({
        title: 'Create new diary function coming soon!',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Poppins', sans-serif;
}

.header {
  padding: 30rpx 0;
  margin-bottom: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.empty-text {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  margin-top: 100rpx;
}

.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #3B82F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.add-icon {
  color: white;
  font-size: 60rpx;
  font-weight: 300;
}
</style> 