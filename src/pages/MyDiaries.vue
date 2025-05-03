<template>
  <div class="my-diaries">
    <NavBar>我的游记</NavBar>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <DiaryCard
        v-for="diary in diaries"
        :key="diary._id"
        :diary="diary"
        @click="goDetail(diary._id)"
      />
      <div v-if="!diaries.length">暂无游记</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import DiaryCard from '../components/DiaryCard.vue'

const diaries = ref([])
const loading = ref(false)
const router = useRouter()

const fetchMyDiaries = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 500))
  diaries.value = [
    {
      _id: '3',
      title: '我的游记示例',
      images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'],
      author: { nickname: '我' },
      viewCount: 100,
      status: '已通过'
    }
  ]
  loading.value = false
}

const goDetail = (id) => {
  router.push({ name: 'DiaryDetail', params: { id } })
}

onMounted(fetchMyDiaries)
</script> 