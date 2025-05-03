<template>
  <div class="publish">
    <NavBar>发布游记</NavBar>
    <form @submit.prevent="handleSubmit">
      <input v-model="title" placeholder="标题" required />
      <input v-model="location" placeholder="地点" required />
      <textarea v-model="content" placeholder="内容" required />
      <input type="file" multiple @change="handleImageChange" />
      <button type="submit">发布</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

const title = ref('')
const location = ref('')
const content = ref('')
const images = ref([])
const message = ref('')

const handleImageChange = (e) => {
  images.value = Array.from(e.target.files)
}

const handleSubmit = () => {
  // 这里可以调用后端API
  message.value = '发布成功，等待审核'
  title.value = ''
  location.value = ''
  content.value = ''
  images.value = []
}
</script> 