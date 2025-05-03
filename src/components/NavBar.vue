<template>
  <nav class="navbar">
    <slot />
  </nav>
</template>

<script setup>
// 可根据需要添加props和事件
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 56px;
  background: #409eff;
  color: #fff;
  padding: 0 16px;
  font-size: 18px;
}
</style> 