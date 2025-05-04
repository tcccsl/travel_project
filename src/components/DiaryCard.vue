<template>
  <view class="diary-card" @click="viewDiary">
    <image class="diary-image" :src="diary.image || '/static/default-image.jpg'" mode="aspectFill"></image>
    <view class="diary-info">
      <text class="diary-title">{{ diary.title }}</text>
      <text class="diary-date">{{ diary.date }}</text>
      <text class="diary-excerpt">{{ excerpt }}</text>
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
  computed: {
    excerpt() {
      if (!this.diary.content) return '';
      return this.diary.content.length > 50 
        ? this.diary.content.substring(0, 50) + '...' 
        : this.diary.content;
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
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.diary-image {
  width: 100%;
  height: 300rpx;
}

.diary-info {
  padding: 20rpx;
}

.diary-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.diary-date {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 10rpx;
  display: block;
}

.diary-excerpt {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}
</style> 