<template>
  <div class="admin">
    <NavBar>审核管理</NavBar>
    <div>
      <select v-model="status" @change="fetchNotes">
        <option value="">全部</option>
        <option value="pending">待审核</option>
        <option value="approved">已通过</option>
        <option value="rejected">已拒绝</option>
      </select>
    </div>
    <div v-if="loading">加载中...</div>
    <table v-else class="audit-table">
      <thead>
        <tr>
          <th>标题</th>
          <th>作者</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="note in notes" :key="note._id">
          <td>{{ note.title }}</td>
          <td>{{ note.userId?.nickname || '匿名' }}</td>
          <td>{{ statusMap[note.status] }}</td>
          <td>
            <button v-if="note.status==='pending'" @click="approve(note._id)">通过</button>
            <button v-if="note.status==='pending'" @click="reject(note._id)">拒绝</button>
            <span v-if="note.status==='rejected'">原因: {{ note.rejectReason }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'

const notes = ref([])
const loading = ref(false)
const status = ref('')
const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }

const fetchNotes = async () => {
  loading.value = true
  // 这里应调用后端接口，暂用mock
  await new Promise(r => setTimeout(r, 500))
  notes.value = [
    { _id: '1', title: '游记A', userId: { nickname: '小明' }, status: 'pending', rejectReason: '' },
    { _id: '2', title: '游记B', userId: { nickname: '小红' }, status: 'approved', rejectReason: '' },
    { _id: '3', title: '游记C', userId: { nickname: '小刚' }, status: 'rejected', rejectReason: '内容不合规' }
  ].filter(n => !status.value || n.status === status.value)
  loading.value = false
}

const approve = (id) => {
  alert('审核通过: ' + id)
  fetchNotes()
}
const reject = (id) => {
  alert('审核拒绝: ' + id)
  fetchNotes()
}

onMounted(fetchNotes)
</script>

<style scoped>
.audit-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.audit-table th, .audit-table td {
  border: 1px solid #eee;
  padding: 8px 12px;
  text-align: left;
}
</style> 