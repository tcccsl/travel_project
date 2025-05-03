<template>
  <div class="diary-card" @click="$emit('click')">
    <img v-if="diary.images && diary.images.length" :src="diary.images[0]" class="cover" alt="封面" />
    <div class="info">
      <h3>{{ diary.title }}</h3>
      <div class="meta">
        <span>{{ diary.author?.nickname || '匿名' }}</span>
        <span>{{ diary.viewCount || 0 }} 浏览</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  diary: Object
})
</script>

<style scoped>
.diary-card {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  overflow: hidden;
}
.cover {
  width: 120px;
  height: 80px;
  object-fit: cover;
}
.info {
  flex: 1;
  padding: 8px;
}
.meta {
  color: #888;
  font-size: 12px;
  margin-top: 8px;
}
</style> 