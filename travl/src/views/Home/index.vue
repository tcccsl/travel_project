<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getItemApi } from '@/api/item';
  import search from '../../components/search.vue';

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
  const getItemList = async () => {
    try {
      const res = await getItemApi(reqData.value);
      itemList.value = res.result.items;
      console.log(itemList.value);
    } catch (error) {
      console.error('获取商品列表失败:', error);
    }
  };
  onMounted(() => getItemList());

  const disabled = ref(false);
  // 加载更多数据
  const load = async () => {
    // 获取下一页数据
    reqData.value.page++;
    const res = await getItemApi(reqData.value);
    itemList.value = [...itemList.value, ...res.result.items];
    // 加载完毕，停止监听
    if (res.result.items.length === 0) {
      disabled.value = true;
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
</script>

<template>
  <div class="container">
    <search></search>
    <div class="waterfall-container">
      <div v-for="item in itemList" :key="item.id" class="waterfall-item">
        <img v-img-lazy="item.picture" alt="游记图片" class="item-image" />
        <div class="item-content">
          <h3 class="item-title">{{ item.name }}</h3>
          <div class="user-info">
            <img v-img-lazy="item.userAvatar" alt="用户头像" class="user-avatar" />
            <span class="user-nickname">{{ item.userNickname }}</span>
          </div>
        </div>
      </div>
      <p v-if="loading" class="loading-text">加载中...</p>
      <p v-if="!hasMore" class="no-more-text">没有更多数据了</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .container {
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    transition: all 0.5s ease-in-out;
  }

  .waterfall-container {
    column-count: 2;
    column-gap: 16px;
    padding: 16px;
  }

  .waterfall-item {
    display: inline-block;
    width: 100%;
    margin-bottom: 16px;
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