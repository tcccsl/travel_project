<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  nickname: '',
  account: '',
  password: '',
  avatar: ''
});

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, message: '昵称长度不能小于2个字符', trigger: 'blur' }
  ],
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, message: '用户名长度不能小于4个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ]
};

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    showToast('上传头像图片只能是 JPG/PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    showToast('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleAvatarUpload = async ({ file }) => {
  try {
    const res = await userStore.uploadAvatar({ file });
    form.avatar = res.url;
    showToast('头像上传成功');
  } catch (error) {
    console.error('上传头像失败:', error);
    showToast('上传头像失败，请重试');
  }
};

const handleRegister = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    await userStore.register({
      nickname: form.nickname,
      account: form.account,
      password: form.password,
      avatar: form.avatar || userStore.DEFAULT_AVATAR
    });
    
    showToast('注册成功');
    router.push('/login');
  } catch (error) {
    console.error('注册失败:', error);
    showToast(error.response?.data?.message || '注册失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">创建账号</h2>
      <van-form ref="formRef" @submit="handleRegister">
        <van-cell-group inset>
          <van-field
            v-model="form.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称"
            :rules="rules.nickname"
            left-icon="smile-o"
          />
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
          <van-field name="avatar" label="头像">
            <template #input>
              <van-uploader
                v-model="form.avatar"
                :max-count="1"
                :before-read="beforeAvatarUpload"
                :after-read="handleAvatarUpload"
                class="avatar-uploader"
              />
            </template>
          </van-field>
        </van-cell-group>
        <div class="button-wrapper">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="register-button"
          >
            注册
          </van-button>
        </div>
        <div class="login-link">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-box {
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

.avatar-uploader {
  :deep(.van-uploader__upload) {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background: rgba(64, 158, 255, 0.1);
    border: 1px dashed #409eff;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(64, 158, 255, 0.2);
    }
  }

  :deep(.van-uploader__preview-image) {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }
}

.button-wrapper {
  margin: 24px 16px;
}

.register-button {
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

.login-link {
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