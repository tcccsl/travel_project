// 模拟测试DiaryDetail组件的游记获取逻辑

// 模拟axios
const axios = {
  get: (url) => {
    console.log(`模拟请求: GET ${url}`);
    
    // 模拟后端响应 - 标准格式
    if (url.includes('/diaries/1234')) {
      return Promise.resolve({
        data: {
          code: 200,
          msg: "获取成功",
          data: {
            id: "1234",
            title: "测试游记",
            content: "这是测试内容",
            location: "北京",
            authorId: "user123",
            authorNickname: "测试用户",
            createTime: "2023-06-01T10:00:00",
            updateTime: "2023-06-01T10:00:00",
            status: "approved",
            images: ["http://localhost:3000/uploads/test1.jpg", "http://localhost:3000/uploads/test2.jpg"],
            videos: [],
            rejectReason: ""
          }
        }
      });
    }
    
    // 模拟后端响应 - 管理员API
    if (url.includes('/api/admin/diaries/1234')) {
      return Promise.resolve({
        data: {
          code: 200,
          msg: "获取成功",
          data: {
            id: "1234",
            title: "测试游记(管理员视图)",
            content: "这是测试内容(管理员视图)",
            location: "上海",
            authorId: "user123",
            authorNickname: "测试用户",
            createTime: "2023-06-01T10:00:00",
            updateTime: "2023-06-01T10:00:00",
            status: "pending",
            images: ["http://localhost:3000/uploads/test1.jpg", "http://localhost:3000/uploads/test2.jpg"],
            videos: [],
            rejectReason: ""
          }
        }
      });
    }
    
    // 模拟错误响应
    if (url.includes('error')) {
      return Promise.reject(new Error("模拟请求错误"));
    }
    
    // 默认响应
    return Promise.reject(new Error("未找到资源"));
  }
};

// 模拟API服务
const api = {
  diaries: {
    getById: (id) => {
      console.log('调用API获取游记详情, ID:', id);
      return axios.get(`/diaries/${id}`)
        .then(response => {
          console.log('原始响应:', response.data);
          
          // 返回与实际API相同格式的响应
          return response.data;
        })
        .catch(error => {
          console.error('API错误:', error);
          throw error;
        });
    }
  },
  admin: {
    getDiaryById: (id) => {
      console.log('调用管理员API获取游记详情, ID:', id);
      return axios.get(`/api/admin/diaries/${id}`)
        .then(response => {
          console.log('原始响应:', response.data);
          
          // 返回与实际API相同格式的响应
          return response.data;
        })
        .catch(error => {
          console.error('管理员API错误:', error);
          throw error;
        });
    }
  }
};

// 模拟DiaryDetail组件的fetchDiaryDetail方法
async function fetchDiaryDetail(id, isAdmin = false) {
  console.log('==== 开始测试游记详情获取 ====');
  console.log('游记ID:', id, '管理员模式:', isAdmin);
  
  try {
    let response;
    if (isAdmin) {
      try {
        console.log('尝试使用管理员API');
        response = await api.admin.getDiaryById(id);
      } catch (adminError) {
        console.error('管理员API失败，尝试普通API');
        response = await api.diaries.getById(id);
      }
    } else {
      console.log('使用普通API');
      response = await api.diaries.getById(id);
    }
    
    console.log('获取响应:', response);
    
    // 解析响应数据
    if (response && response.code === 200 && response.data) {
      console.log('成功获取游记数据!');
      const diary = response.data;
      
      // 显示处理后的数据
      console.log('处理后的游记数据:', {
        id: diary.id,
        title: diary.title,
        content: diary.content.substr(0, 20) + '...',
        authorNickname: diary.authorNickname,
        status: diary.status,
        imageCount: diary.images?.length || 0
      });
    } else {
      console.error('响应缺少必要数据');
    }
  } catch (error) {
    console.error('测试中发生错误:', error);
  }
  
  console.log('==== 测试完成 ====\n');
}

// 运行测试
async function runTests() {
  // 测试1: 普通用户查看游记
  await fetchDiaryDetail('1234', false);
  
  // 测试2: 管理员查看游记
  await fetchDiaryDetail('1234', true);
  
  // 测试3: 错误情况
  await fetchDiaryDetail('error', false);
}

runTests();
