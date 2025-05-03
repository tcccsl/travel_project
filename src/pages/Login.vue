<template>
  <div class="login">
    <NavBar>登录</NavBar>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit">登录</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

const username = ref('')
const password = ref('')
const message = ref('')

const handleLogin = () => {
  // 这里可以调用后端API
  message.value = '登录成功'
}
</script> 