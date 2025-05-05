<template>
  <view class="container">
    <view class="admin-panel">
      <!-- Header -->
      <view class="header">
        <text class="title">{{ pageTitle }}</text>
        <view class="filter-container">
          <uni-data-select
            v-model="filter"
            :localdata="filterOptions"
            placeholder="选择状态筛选"
            @change="filterDiaries"
          ></uni-data-select>
        </view>
        <view class="logout-btn" @click="logout">
          <text class="logout-text">退出登录</text>
        </view>
      </view>
      
      <!-- Table Container -->
      <view class="table-container">
        <!-- Table Header -->
        <view class="table-header">
          <view class="th title-col">标题</view>
          <view class="th author-col">作者</view>
          <view class="th status-col">状态</view>
          <view class="th action-col">操作</view>
        </view>
        
        <!-- Table Body -->
        <view class="table-body">
          <view 
            class="table-row" 
            v-for="diary in diaries" 
            :key="diary.id"
          >
            <view class="td title-col">{{ diary.title }}</view>
            <view class="td author-col">{{ diary.authorNickname }}</view>
            <view class="td status-col">
              <view :class="['status-badge', getStatusClass(diary.status)]">
                {{ getStatusText(diary.status) }}
              </view>
            </view>
            <view class="td action-col">
              <!-- Approve Button - for pending diaries (both roles) -->
              <view 
                class="action-btn approve" 
                v-if="diary.status === 'pending'"
                @click="approveDiary(diary.id)"
              >
                <text class="btn-text">通过</text>
              </view>
              
              <!-- Reject Button - for pending diaries (both roles) -->
              <view 
                class="action-btn reject" 
                v-if="diary.status === 'pending'"
                @click="showRejectModal(diary.id)"
              >
                <text class="btn-text">拒绝</text>
              </view>
              
              <!-- Delete Button - for admin role only -->
              <view 
                class="action-btn delete" 
                v-if="adminStore.isAdmin && diary.status !== 'pending'"
                @click="confirmDelete(diary.id)"
              >
                <text class="btn-text">删除</text>
              </view>
              
              <!-- View Button - for both roles -->
              <view 
                class="action-btn view" 
                @click="viewDiary(diary.id)"
              >
                <text class="btn-text">查看</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- Empty State -->
        <view class="empty-state" v-if="!loading && diaries.length === 0">
          <image class="empty-image" src="/static/empty-state.png" mode="aspectFit"></image>
          <text class="empty-text">暂无游记</text>
        </view>
        
        <!-- Loading State -->
        <view class="loading-state" v-if="loading">
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </view>
    
    <!-- Reject Modal -->
    <uni-popup ref="rejectPopup" type="dialog">
      <uni-popup-dialog
        title="拒绝原因"
        mode="input"
        placeholder="请输入拒绝理由"
        :before-close="true"
        @confirm="handleReject"
        @close="cancelReject"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { useAdminStore } from '@/store/admin.js';
import api from '@/services/api.js';

export default {
  data() {
    return {
      diaries: [],
      loading: false,
      error: null,
      filter: '',
      selectedDiaryId: null,
      rejectReason: '',
      
      filterOptions: [
        { text: '全部', value: '' },
        { text: '待审核', value: 'pending' },
        { text: '已通过', value: 'approved' },
        { text: '已拒绝', value: 'rejected' }
      ],
      pageTitle: '内容管理'
    }
  },
  computed: {
    adminStore() {
      return useAdminStore();
    }
  },
  onLoad(options) {
    // 初始化管理员存储
    const adminStore = useAdminStore();
    
    // 确保调用初始化方法
    adminStore.init();
    
    // 检查管理员是否已认证
    if (!adminStore.isAuthenticated) {
      uni.redirectTo({
        url: '/pages/AdminLogin/AdminLogin'
      });
      return;
    }
    
    // 根据 URL 参数或存储中的角色设置页面
    const roleFromQuery = options?.role;
    
    // 更新页面标题和筛选器
    if (roleFromQuery === 'auditor' || adminStore.isAuditor) {
      // 审核员视图
      this.pageTitle = '游记审核';
      // 审核员默认看到待审核的内容
      this.filter = 'pending';
    } else if (adminStore.isAdmin) {
      // 管理员视图
      this.pageTitle = '游记管理';
      // 管理员默认看到所有内容
      this.filter = '';
    } else {
      // 默认视图
      this.pageTitle = '内容管理';
    }
    
    // 仅在没有通过 URL 指定角色时加载过滤器状态
    if (!roleFromQuery) {
      this.loadFilterState();
    }
    
    // 获取游记数据
    this.fetchDiaries();
  },
  methods: {
    // Fetch diaries from API
    async fetchDiaries() {
      this.loading = true;
      
      try {
        const response = await api.admin.getDiaries({
          status: this.filter
        });
        
        this.diaries = response.data || [];
      } catch (error) {
        this.error = error.message || 'Failed to fetch diaries';
        uni.showToast({
          title: '获取游记失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // Apply filter
    filterDiaries(e) {
      this.filter = e;
      this.saveFilterState();
      this.fetchDiaries();
    },
    
    // Save filter state to local storage
    saveFilterState() {
      try {
        uni.setStorageSync('admin_filter', this.filter);
      } catch (e) {
        console.error('Failed to save filter state:', e);
      }
    },
    
    // Load filter state from local storage
    loadFilterState() {
      try {
        const filterState = uni.getStorageSync('admin_filter');
        if (filterState) {
          this.filter = filterState;
        }
      } catch (e) {
        console.error('Failed to load filter state:', e);
      }
    },
    
    // Get status class for badges
    getStatusClass(status) {
      switch (status) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return '';
      }
    },
    
    // Get status text
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待审核';
        case 'approved': return '已通过';
        case 'rejected': return '已拒绝';
        default: return '未知状态';
      }
    },
    
    // Approve diary
    async approveDiary(id) {
      try {
        await api.diaries.updateStatus(id, { 
          status: 'approved' 
        });
        
        // Show success message
        uni.showToast({
          title: '审核通过',
          icon: 'success'
        });
        
        // Refresh diaries
        this.fetchDiaries();
      } catch (error) {
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // Show reject modal
    showRejectModal(id) {
      this.selectedDiaryId = id;
      this.$refs.rejectPopup.open();
    },
    
    // Handle reject confirmation
    async handleReject(reason) {
      if (!reason.trim()) {
        uni.showToast({
          title: '请输入拒绝原因',
          icon: 'none'
        });
        return;
      }
      
      try {
        await api.diaries.updateStatus(this.selectedDiaryId, { 
          status: 'rejected',
          rejectReason: reason
        });
        
        // Show success message
        uni.showToast({
          title: '已拒绝',
          icon: 'success'
        });
        
        // Reset selected diary
        this.selectedDiaryId = null;
        
        // Close popup
        this.$refs.rejectPopup.close();
        
        // Refresh diaries
        this.fetchDiaries();
      } catch (error) {
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // Cancel reject
    cancelReject() {
      this.selectedDiaryId = null;
      this.$refs.rejectPopup.close();
    },
    
    // Confirm delete diary
    confirmDelete(id) {
      this.selectedDiaryId = id;
      
      // Show confirmation dialog
      uni.showModal({
        title: '确认删除',
        content: '确定要删除该游记吗？此操作不可撤销。',
        confirmText: '删除',
        confirmColor: '#FF0000',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.deleteDiary(id);
          }
        }
      });
    },
    
    // Delete diary
    async deleteDiary(id) {
      try {
        await api.diaries.adminDelete(id);
        
        // Show success message
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // Refresh diaries
        this.fetchDiaries();
      } catch (error) {
        uni.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // Logout
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.adminStore.logout();
            uni.redirectTo({
              url: '/pages/AdminLogin/AdminLogin'
            });
          }
        }
      });
    },
    
    // View diary
    viewDiary(id) {
      // Navigate to diary detail page
      uni.navigateTo({
        url: `/pages/DiaryDetail/DiaryDetail?id=${id}&admin=true`
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #13547a 0%, #80d0c7 100%);
  font-family: 'Poppins', sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

.admin-panel {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #13547a;
}

.filter-container {
  width: 180px;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-btn:active {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.4);
}

.logout-text {
  color: white;
}

.table-container {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.th {
  padding: 15px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.table-row:last-child {
  border-bottom: none;
}

.td {
  padding: 15px;
  text-align: left;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
}

.title-col {
  flex: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-col {
  flex: 1;
}

.status-col {
  flex: 1;
}

.action-col {
  flex: 2;
  display: flex;
  gap: 10px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.status-pending {
  background-color: #ffc107;
}

.status-approved {
  background-color: #28a745;
}

.status-rejected {
  background-color: #dc3545;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.approve {
  background-color: #28a745;
}

.reject {
  background-color: #dc3545;
}

.delete {
  background-color: #999;
}

.view {
  background-color: #6c757d;
}

.btn-text {
  color: white;
}

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.empty-image {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.empty-text, .loading-text {
  font-size: 14px;
  color: #909399;
}

/* PC 端适配 */
@media screen and (min-width: 992px) {
  .container {
    padding: 30px;
  }
  
  .admin-panel {
    padding: 40px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .th, .td {
    font-size: 16px;
    padding: 20px;
  }
  
  .action-btn {
    font-size: 14px;
    padding: 8px 15px;
  }
}
</style> 