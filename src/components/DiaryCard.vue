<template>
  <view class="diary-card" @click="viewDiary">
    <image class="diary-image" :src="diary.coverImage || '/static/default-image.jpg'" mode="aspectFill" :lazy-load="true"></image>
    <view class="diary-info">
      <text class="diary-title">{{ diary.title }}</text>
      <view class="author-info">
        <image class="author-avatar" :src="diary.authorAvatar || '/static/default-avatar.png'" mode="aspectFill"></image>
        <text class="author-name">{{ diary.authorNickname }}</text>
      </view>
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
        url: `/diary-detail?id=${this.diary.id}`
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
</style> 