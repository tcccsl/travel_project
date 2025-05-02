<script setup>
import { useUserStore } from '@/stores/user';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showNotify, showToast } from 'vant';

const userStore = useUserStore();
const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  account: '',
  password: ''
});

const rules = {
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, message: '用户名长度不能小于4个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ]
};

const onSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    await userStore.login(form.account, form.password);
    showNotify({ type: 'success', message: '登录成功' });
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
    showToast(error.response?.data?.message || '登录失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">欢迎登录</h2>
      <van-form ref="formRef" @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.account"
            name="account"
            label="用户名"
            placeholder="请输入用户名"
            :rules="rules.account"
            left-icon="user-o"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="rules.password"
            left-icon="lock"
          />
        </van-cell-group>
        <div class="button-wrapper">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="login-button"
          >
            登录
          </van-button>
        </div>
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  width: 90%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease-out;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

:deep(.van-cell-group) {
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.van-field) {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin-bottom: 16px;
}

:deep(.van-field__label) {
  color: #666;
  font-weight: 500;
}

:deep(.van-field__control) {
  color: #333;
}

.button-wrapper {
  margin: 24px 16px;
}

.login-button {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
  
  a {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;
    transition: all 0.3s ease;
    
    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
