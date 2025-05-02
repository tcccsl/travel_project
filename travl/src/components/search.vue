<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showSuccessToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const isSearchActive = ref(false);
const searchValue = ref('');
const isScrolled = ref(false);

const isLoggedIn = computed(() => userStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo);
const avater = computed(() => userInfo.value?.avatar || userStore.DEFAULT_AVATAR);

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  if (!isSearchActive.value) {
    searchValue.value = '';
  }
};

const handleSearch = () => {
  // 处理搜索逻辑
  console.log('搜索:', searchValue.value);
};

const handleLogin = () => {
  router.push('/login');
};

const handleRegister = () => {
  router.push('/register');
};

const handleLogout = () => {
  userStore.logout();
  showSuccessToast('已退出登录');
  router.push('/login');
};

const handleScroll = () => {
  const scrollTop = window.scrollY;
  isScrolled.value = scrollTop > 0;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="search-container" :class="{ scrolled: isScrolled }">
    <div class="search-content">
      <div class="left-section">
        <img 
          v-if="!isSearchActive" 
          src="@/assets/icons/search.png" 
          alt="搜索" 
          class="search-icon"
          @click="toggleSearch"
        >
        <div v-else class="search-input-wrapper">
          <input 
            v-model="searchValue"
            type="text"
            placeholder="搜索游记..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
          <img 
            src="@/assets/icons/cancel.png" 
            alt="取消" 
            class="cancel-icon"
            @click="toggleSearch"
          >
        </div>
      </div>
      <div class="right-section">
        <template v-if="!isLoggedIn">
          <div class="auth-buttons">
            <button class="login-button" @click="handleLogin">登录</button>
            <button class="register-button" @click="handleRegister">注册</button>
          </div>
        </template>
        <template v-else>
          <div class="user-info" @click="handleLogout">
            <img :src="avater" alt="用户头像" class="user-avatar">
            <span class="user-nickname">{{ userInfo.nickname || userInfo.account }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-container {
  position: relative;
  z-index: 100;
  transition: all 0.3s ease;
  margin-top: 0;

  &.scrolled {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.search-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon,
.cancel-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 200px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.right-section {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.login-button,
.register-button {
  min-width: 70px;
  text-align: center;
  border: none;
  border-radius: 16px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.login-button {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;

  &:hover {
    background: rgba(64, 158, 255, 0.2);
  }
}

.register-button {
  background: #409eff;
  color: #fff;

  &:hover {
    background: #66b1ff;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.3s;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
  }
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-nickname {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
</style>