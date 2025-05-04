<template>
  <view class="container">
    <!-- Search Bar -->
    <view class="search-container">
      <view class="search-bar">
        <text class="search-icon"><i class="fas fa-search"></i></text>
        <input 
          class="search-input" 
          type="text" 
          v-model="keyword" 
          placeholder="搜索游记或作者" 
          confirm-type="search"
          @input="handleSearch"
          @confirm="search"
        />
        <text class="clear-icon" v-if="keyword" @click="clearSearch"><i class="fas fa-times"></i></text>
      </view>
    </view>
    
    <!-- Diary List -->
    <view class="content">
      <!-- Waterfall Layout -->
      <view class="waterfall" v-if="diaries.length > 0">
        <view class="waterfall-column">
          <diary-card 
            v-for="diary in leftDiaries" 
            :key="diary.id" 
            :diary="diary" 
          />
        </view>
        <view class="waterfall-column">
          <diary-card 
            v-for="diary in rightDiaries" 
            :key="diary.id" 
            :diary="diary" 
          />
        </view>
      </view>
      
      <!-- Empty State -->
      <view class="empty-state" v-if="!loading && diaries.length === 0">
        <image class="empty-image" src="/static/empty-state.png" mode="aspectFit"></image>
        <text class="empty-text">暂无游记</text>
      </view>
      
      <!-- Loading State -->
      <view class="loading-state" v-if="loading && page === 1">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- Load More -->
      <view class="load-more" v-if="hasMore && !loading && page > 1">
        <text class="load-more-text">上拉加载更多</text>
      </view>
      
      <!-- No More Data -->
      <view class="no-more" v-if="!hasMore && diaries.length > 0">
        <text class="no-more-text">没有更多数据了</text>
      </view>
    </view>
  </view>
</template>

<script>
import DiaryCard from '@/components/DiaryCard.vue';
import api from '@/services/api';

export default {
  components: {
    DiaryCard
  },
  data() {
    return {
      diaries: [],
      loading: false,
      error: null,
      page: 1,
      limit: 10,
      hasMore: true,
      keyword: '',
      searchTimer: null,
      cacheKey: 'home_diaries_cache',
      cacheExpiration: 5 * 60 * 1000
    }
  },
  computed: {
    // Split diaries into two columns for waterfall layout
    leftDiaries() {
      return this.diaries.filter((_, index) => index % 2 === 0);
    },
    rightDiaries() {
      return this.diaries.filter((_, index) => index % 2 === 1);
    }
  },
  onLoad() {
    // 清除可能存在的旧式缓存数据
    uni.removeStorageSync('diaries_cache');
    
    // 加载新的缓存数据
    this.loadCachedData();
    
    // 始终获取最新数据
    this.refreshData();
  },
  onPullDownRefresh() {
    this.refreshData();
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore();
    }
  },
  methods: {
    // 加载缓存数据
    loadCachedData() {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          
          // 检查缓存是否过期
          const now = Date.now();
          if (parsedData.timestamp && (now - parsedData.timestamp < this.cacheExpiration)) {
            this.diaries = parsedData.diaries || [];
            this.page = parsedData.page || 1;
            this.hasMore = parsedData.hasMore !== undefined ? parsedData.hasMore : true;
            console.log('Loaded cached home diaries data');
          } else {
            // 缓存已过期，清除
            console.log('Home diaries cache expired');
            uni.removeStorageSync(this.cacheKey);
          }
        }
      } catch (e) {
        console.error('Failed to parse cached home data:', e);
        uni.removeStorageSync(this.cacheKey);
      }
    },
    
    // Fetch diaries from API
    async fetchDiaries() {
      if (this.loading) return;
      
      this.loading = true;

      try {
        const response = await api.diaries.getAll({
          page: this.page,
          limit: this.limit,
          keyword: this.keyword || undefined
        });
        
        const data = response.data || {};
        const items = data.items || [];
        
        if (this.page === 1) {
          this.diaries = items;
        } else {
          this.diaries = [...this.diaries, ...items];
        }
        
        // Check if has more data
        this.hasMore = items.length === this.limit;
        
        // Cache data
        this.cacheData();
      } catch (error) {
        this.error = error.message || 'Network error';
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
        // Stop pull down refresh if active
        uni.stopPullDownRefresh();
      }
    },
    
    // Refresh data (reset page and fetch)
    refreshData() {
      this.page = 1;
      this.hasMore = true;
      this.fetchDiaries();
    },
    
    // Load more data (increment page and fetch)
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.fetchDiaries();
      }
    },
    
    // Handle search input with debounce
    handleSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      this.searchTimer = setTimeout(() => {
        this.search();
      }, 500);
    },
    
    // Perform search
    search() {
      this.page = 1;
      this.hasMore = true;
      this.fetchDiaries();
    },
    
    // Clear search
    clearSearch() {
      this.keyword = '';
      this.search();
    },
    
    // Cache data to storage
    cacheData() {
      try {
        const cacheData = {
          diaries: this.diaries,
          page: this.page,
          hasMore: this.hasMore,
          timestamp: Date.now()
        };
        
        uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Failed to cache home data:', e);
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
}

.search-container {
  padding: 30rpx 30rpx 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #13547a 0%, #13547a 100%);
}

.search-bar {
  position: relative;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  color: #999;
  margin-right: 10rpx;
  font-size: 30rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  color: #999;
  padding: 10rpx;
  font-size: 30rpx;
}

.content {
  padding: 20rpx 30rpx 30rpx;
}

.waterfall {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding-bottom: 60rpx;
}

.waterfall-column {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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

.loading-state, .load-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
}

.loading-text, .load-more-text, .no-more-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style> 