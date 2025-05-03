import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import DiaryDetail from '../pages/DiaryDetail.vue'
import MyDiaries from '../pages/MyDiaries.vue'
import Publish from '../pages/Publish.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Admin from '../pages/Admin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/detail/:id', name: 'DiaryDetail', component: DiaryDetail },
  { path: '/my', name: 'MyDiaries', component: MyDiaries },
  { path: '/publish', name: 'Publish', component: Publish },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/admin', name: 'Admin', component: Admin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 