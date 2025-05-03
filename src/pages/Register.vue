<template>
  <div class="register">
    <NavBar>注册</NavBar>
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <input v-model="nickname" placeholder="昵称" />
      <button type="submit">注册</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

const username = ref('')
const password = ref('')
const nickname = ref('')
const message = ref('')

const handleRegister = () => {
  // 这里可以调用后端API
  message.value = '注册成功'
}
</script> 