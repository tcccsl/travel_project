<template>
  <div class="detail">
    <NavBar>游记详情</NavBar>
    <h2>{{ diary.title }}</h2>
    <div>
      <img v-for="img in diary.images" :src="img" :key="img" style="max-width: 100%; margin-bottom: 8px;" />
    </div>
    <div>作者：{{ diary.author.nickname }}</div>
    <div>内容：{{ diary.content }}</div>
    <div>浏览：{{ diary.viewCount }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'

const diary = ref({
  title: '',
  images: [],
  author: { nickname: '' },
  content: '',
  viewCount: 0
})

const route = useRoute()

onMounted(() => {
  // mock
  diary.value = {
    title: '无锡鼋头渚 | 樱花开了，最美赏樱地',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'],
    author: { nickname: '旅行听听' },
    content: '这里是游记内容详情……',
    viewCount: 881
  }
})
</script> 