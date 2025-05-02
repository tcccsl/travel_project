<script setup>
import { Tabbar, TabbarItem } from 'vant';
import { onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import homeIcon from '../assets/icons/home.png';
import createIcon from '../assets/icons/create.png';
import myIcon from '../assets/icons/my.png';
import truehomeIcon from '../assets/icons/truehome.png'
import truecreateIcon from '../assets/icons/truecreate.png';
import truemyIcon from '../assets/icons/truemy.png';
import totopIcon from '../assets/icons/totop.png'

const active = ref(0);
const icons = [
  {
    normal: homeIcon,
    active:truehomeIcon,
    alt: '主页',
    path: '/'
  },
  {
    normal: createIcon,
    active:truecreateIcon,
    alt: '新建游记',
    path: '/create'
  },
  {
    normal: myIcon,
    active:truemyIcon,
    alt: '我的',
    path: '/my-diary'
  }
];

const isActive = (index) => active.value === index;

const router = useRouter();

const handleClick = (path) => {
  router.push(path);
};

// 检测是否滚动
const isScrolling = ref(false);

const handleScroll = () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  isScrolling.value = scrollY > 0;
};

onMounted(() => {
  
  const currentPath = router.currentRoute.value.path;
  const index = icons.findIndex(icon => icon.path === currentPath);
  active.value = index !== -1 ? index : 0;

  window.addEventListener('scroll', handleScroll);

  const updateIcon = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const activeTabs = document.querySelectorAll('.van-tabbar-item--active img');

    activeTabs.forEach((activeTab, idx) => {
      const activeText = activeTab.parentNode.nextSibling;

      if (scrollY > 0) {
        activeTab.src = totopIcon;
        activeText.innerHTML = '回到顶部';
      } else {
        const index = active.value;
        activeTab.src = icons[index].active;
        activeText.innerHTML = icons[index].alt;
      }
    });
  };

  window.addEventListener('scroll', updateIcon);

  const tabItems = document.querySelectorAll('.van-tabbar-item');
  tabItems.forEach((tabItem) => {
    tabItem.addEventListener('click', () => {
      document.documentElement.scrollTop = 0;
    });
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>

<template>
  <div class="tabber-container">
    <!-- Tabbar 组件 -->
     
    <van-tabbar v-model="active">
      <van-tabbar-item v-for="(item, index) in icons" :key="index" @click="handleClick(item.path)" :data-id="index">
        <template #icon>
          <img
            :src="isActive(index) ? item.active : item.normal"
            :alt="isScrolling.value?'回到顶部':item.alt"
            style="width: 24px; height: 24px;"
          />
        </template>
        {{ item.alt }}
      </van-tabbar-item>
    </van-tabbar>

    <!-- 子路由内容渲染 -->
    <router-view />
  </div>
</template>

<style lang="scss" scoped>

:deep(van-tabbar) {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100px;
}

:deep(van-tabbar-item) {
  flex: 1;
  text-align: center;
}

</style>
