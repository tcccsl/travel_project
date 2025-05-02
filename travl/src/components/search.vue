<script setup>

</script>

<template>
  <van-search v-model="value" placeholder="请输入搜索关键词" />
</template>
<style scoped lang="scss">
  :deep(van-search){
    width: 0;
  }
</style>