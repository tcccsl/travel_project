<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getSubCategoryAPI } from '@/api/item';
  import search from '../../components/search.vue';
  import { useUserStore } from '@/stores/user';
  import { ElMessage } from 'element-plus';

  const itemList = ref([]);
  const page = ref(1);
  const hasMore = ref(true);
  const loading = ref(false);

  // 准备参数
  const reqData = ref({
    categoryId: 1005000,
    page: 1,
    pageSize: 20,
    sortField: 'publishTime'
  });

  // 获取基础列表数据
  const getItemListData = async () => {
    try {
      loading.value = true;
      const res = await getSubCategoryAPI(reqData.value);
      if (res && res.result) {
        itemList.value = res.result.items || [];
        hasMore.value = res.result.items?.length > 0;
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
      ElMessage.error('获取商品列表失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => getItemListData());

  // 加载更多数据
  const load = async () => {
    if (loading.value || !hasMore.value) return;
    
    try {
      loading.value = true;
      reqData.value.page++;
      const res = await getSubCategoryAPI(reqData.value);
      if (res && res.result) {
        itemList.value = [...itemList.value, ...(res.result.items || [])];
        hasMore.value = res.result.items?.length > 0;
      }
    } catch (error) {
      console.error('加载更多数据失败:', error);
      ElMessage.error('加载更多数据失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const windowHeight = document.documentElement.clientHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= scrollHeight - 10) {
      load();
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  const userStore = useUserStore();
</script>

<template>
  <div class="home-container">
    <div class="container">
      <search></search>
      <div class="waterfall-container">
        <div v-for="item in itemList" :key="item.id" class="waterfall-item">
          <img v-img-lazy="item.picture" alt="游记图片" class="item-image" />
          <div class="item-content">
            <h3 class="item-title">{{ item.name }}</h3>
            <div class="user-info">
              <img :src="item.userAvatar || userStore.DEFAULT_AVATAR" alt="用户头像" class="user-avatar" />
              <span class="user-nickname">{{ item.userNickname }}</span>
            </div>
          </div>
        </div>
        <p v-if="loading" class="loading-text">加载中...</p>
        <p v-if="!hasMore && !loading" class="no-more-text">没有更多数据了</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  transition: all 0.5s ease-in-out;
  margin-top: 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  transition: all 0.5s ease-in-out;
}

.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
}

.waterfall-item {
  width: calc(50% - 16px);
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:active {
    transform: translateY(-5px);
  }
}

.item-image {
  width: 100%;
  object-fit: cover;
}

.item-content {
  padding: 12px;
}

.item-title {
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: bold;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-nickname {
  font-size: 14px;
  color: #666;
}

.loading-text,
.no-more-text {
  text-align: center;
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
  color: #999;
}
</style>