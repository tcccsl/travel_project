<template>
  <view class="container">
    <view class="diary-header">
      <image class="diary-image" src="/static/default-image.jpg" mode="aspectFill"></image>
      <view class="diary-title">
        <text class="title">Sample Trip to Paris</text>
        <text class="date">2024-05-01</text>
      </view>
    </view>
    <view class="diary-content">
      <text class="content-text">This is a placeholder for the diary content. Here you can write about your travel experiences, add photos, and more. This will be implemented with real data in the future.</text>
    </view>
    <view class="actions">
      <view class="action-button edit">
        <text class="action-text">Edit</text>
      </view>
      <view class="action-button delete">
        <text class="action-text">Delete</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      diary: {
        id: '1',
        title: 'Sample Trip to Paris',
        date: '2024-05-01',
        content: 'This is a placeholder for the diary content.',
        image: '/static/default-image.jpg'
      }
    }
  },
  onLoad(option) {
    // Will load diary by ID passed in the route params
    console.log('Diary ID:', option.id);
  },
  methods: {
    editDiary() {
      // Edit functionality will be implemented later
      uni.showToast({
        title: 'Edit function coming soon!',
        icon: 'none'
      });
    },
    deleteDiary() {
      // Delete functionality will be implemented later
      uni.showToast({
        title: 'Delete function coming soon!',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  min-height: 100vh;
  background-color: #fff;
  font-family: 'Poppins', sans-serif;
}

.diary-header {
  position: relative;
  height: 400rpx;
}

.diary-image {
  width: 100%;
  height: 100%;
}

.diary-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  display: block;
}

.date {
  font-size: 24rpx;
  color: #eee;
  margin-top: 10rpx;
  display: block;
}

.diary-content {
  padding: 40rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: space-around;
  padding: 40rpx;
  border-top: 1px solid #eee;
}

.action-button {
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  text-align: center;
}

.edit {
  background-color: #3B82F6;
}

.delete {
  background-color: #EF4444;
}

.action-text {
  color: white;
  font-size: 28rpx;
}
</style> 