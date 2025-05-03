<template>
  <div class="home">
    <NavBar>游记广场</NavBar>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <DiaryCard
        v-for="diary in diaries"
        :key="diary._id"
        :diary="diary"
        @click="goDetail(diary._id)"
      />
      <button v-if="hasMore" @click="loadMore">加载更多</button>
      <div v-else-if="diaries.length">没有更多了</div>
      <div v-else>暂无游记</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import DiaryCard from '../components/DiaryCard.vue'

const diaries = ref([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const router = useRouter()

const mockDiaries = [
  {
    _id: '1',
    title: '无锡鼋头渚 | 樱花开了，最美赏樱地',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'],
    author: { nickname: '旅行听听' },
    viewCount: 881
  },
  {
    _id: '2',
    title: '江苏无锡三天两晚旅游攻略来了',
    images: ['https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'],
    author: { nickname: '小吴早早' },
    viewCount: 2293
  }
]

const fetchDiaries = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 500))
  if (page.value === 1) {
    diaries.value = mockDiaries
    hasMore.value = false
  }
  loading.value = false
}

const loadMore = () => {
  page.value++
  fetchDiaries()
}

const goDetail = (id) => {
  router.push({ name: 'DiaryDetail', params: { id } })
}

onMounted(fetchDiaries)
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 40px auto;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
button {
  display: block;
  margin: 24px auto;
  padding: 8px 24px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style> 