<template>
  <view class="navbar">
    <view class="navbar-left" @click="goBack" v-if="showBack">
      <text class="back-icon"><i class="fas fa-arrow-left"></i></text>
    </view>
    <view class="navbar-title">
      <text>{{ title }}</text>
    </view>
    <view class="navbar-right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Travel Diary'
    },
    showBack: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  }
}
</script>

<style>
.navbar {
  display: flex;
  align-items: center;
  height: 90rpx;
  background-color: #3B82F6;
  padding: 0 20rpx;
}

.navbar-left {
  width: 60rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  color: #fff;
  font-size: 36rpx;
}

.navbar-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
}

.navbar-right {
  width: 60rpx;
  display: flex;
  justify-content: flex-end;
}
</style> 