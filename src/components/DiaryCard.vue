<template>
  <view class="diary-card" @click="viewDiary">
    <image class="diary-image" :src="diary.coverImage || (diary.images && diary.images.length > 0 ? diary.images[0] : '/static/default-image.jpg')" mode="aspectFill" :lazy-load="true"></image>
    <view class="diary-info">
      <text class="diary-title">{{ diary.title }}</text>
      <view class="author-info">
        <image class="author-avatar" :src="diary.authorAvatar || '/static/default-avatar.png'" mode="aspectFill"></image>
        <text class="author-name">{{ diary.authorNickname }}</text>
      </view>
    </view>

    <!-- Video Indicator -->
    <view class="video-indicator" v-if="diary.video">
      <text class="video-icon"><i class="fas fa-play-circle"></i></text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    diary: {
      type: Object,
      required: true
    }
  },
  methods: {
    viewDiary() {
      uni.navigateTo({
        url: `/pages/DiaryDetail/DiaryDetail?id=${this.diary.id}`
      });
    }
  }
}
</script>

<style>
.diary-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  position: relative;
}

.diary-card:active {
  transform: scale(0.98);
}

.diary-image {
  width: 100%;
  height: 340rpx;
}

.diary-info {
  padding: 20rpx;
}

.diary-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
  line-height: 1.4;
  /* Limit to 2 lines with ellipsis */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.author-info {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}

.author-avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.author-name {
  font-size: 24rpx;
  color: #666;
  flex: 1;
  /* Limit to 1 line with ellipsis */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-indicator {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background-color: rgba(0, 0, 0, 0.5);
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-icon {
  color: white;
  font-size: 36rpx;
}
</style> 