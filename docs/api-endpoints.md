# 旅游日记平台 - 接口文档

## 通用说明
- 所有接口地址以 `/api/` 开头（认证相关接口以 `/auth/` 开头）
- 除登录/注册接口外，其他接口均需在请求头中添加 Authorization：
  ```
  Authorization: Bearer <token>
  ```

## 一、用户认证与信息管理

### 1. 用户登录
- **URL**: `/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "testuser",
    "password": "123456"
  }
  ```
- **响应**: 包含用户 token 和基本信息

### 2. 用户注册
- **URL**: `/auth/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "testuser",
    "password": "123456",
    "nickname": "旅行者",
    "avatar": "https://example.com/avatar.jpg" // 可选
  }
  ```
- **响应**: 包含用户 token 和基本信息

### 3. 获取用户信息
- **URL**: `/auth/profile`
- **方法**: GET
- **响应**: 当前用户的完整信息

### 4. 检查用户名是否可用
- **URL**: `/auth/check-username`
- **方法**: GET
- **查询参数**:
  - username: 要检查的用户名
- **响应**: 表示用户名是否可用的布尔值

### 5. 检查昵称是否可用
- **URL**: `/auth/check-nickname`
- **方法**: GET
- **查询参数**:
  - nickname: 要检查的昵称
- **响应**: 表示昵称是否可用的布尔值

## 二、游记管理

### 1. 获取游记列表
- **URL**: `/diaries`
- **方法**: GET
- **查询参数**:
  - page: 页码
  - limit: 每页条数
  - keyword: 搜索关键词（可选）
- **响应**: 分页的游记列表

### 2. 获取游记详情
- **URL**: `/diaries/:id`
- **方法**: GET
- **响应**: 指定 ID 的游记详情

### 3. 创建游记
- **URL**: `/diaries`
- **方法**: POST
- **请求体**:
  ```json
  {
    "title": "游记标题",
    "content": "<p>HTML格式正文</p>",
    "images": ["https://example.com/images/abc123.jpg"],
    "video": "https://example.com/videos/xyz789.mp4" // 可选
  }
  ```
- **响应**: 创建成功的游记信息

### 4. 更新游记
- **URL**: `/diaries/:id`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "title": "更新的标题",
    "content": "<p>更新的内容</p>",
    "images": ["https://example.com/images/abc123.jpg"],
    "video": "https://example.com/videos/xyz789.mp4" // 可选
  }
  ```
- **响应**: 更新成功的游记信息

### 5. 删除游记
- **URL**: `/diaries/:id`
- **方法**: DELETE
- **响应**: 删除成功的状态

### 6. 获取用户自己的游记
- **URL**: `/diaries/mine`
- **方法**: GET
- **响应**: 当前用户所有的游记列表

## 三、管理员功能

### 1. 管理员登录
- **URL**: `/api/admin/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **响应**: 包含管理员 token 和权限信息

### 2. 获取所有游记（管理员）
- **URL**: `/api/admin/diaries`
- **方法**: GET
- **查询参数**:
  - page: 页码
  - limit: 每页条数
  - status: 游记状态（可选，如 pending/approved/rejected）
- **响应**: 分页的游记列表，包含审核状态信息

### 3. 更新游记状态（管理员）
- **URL**: `/api/diary/:id/status`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "status": "approved", // 或 "rejected"
    "reason": "拒绝原因" // 仅在 status 为 rejected 时需要
  }
  ```
- **响应**: 更新后的游记状态信息

### 4. 删除游记（管理员）
- **URL**: `/api/diary/:id/delete`
- **方法**: DELETE
- **响应**: 删除成功的状态

## 四、文件上传接口

### 1. 上传图片
- **URL**: `/api/upload/image`
- **方法**: POST
- **Content-Type**: application/json
- **请求体**:
  ```json
  {
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD..."  // Base64 编码的图片数据
  }
  ```
- **响应**:
  ```json
  {
    "url": "https://example.com/images/abc123.jpg"  // 返回的图片 URL
  }
  ```
- **说明**: 
  - 图片数据通过 Base64 编码发送，前缀包含 MIME 类型 (如 `data:image/jpeg;base64,`)
  - 服务器将解码图片数据并保存
  - 返回的 URL 是图片在 CDN 或服务器上的访问地址

### 2. 上传视频
- **URL**: `/api/upload/video`
- **方法**: POST
- **Content-Type**: application/json
- **请求体**:
  ```json
  {
    "video": "data:video/mp4;base64,AAAAHGZ0eXBNNFYgAAACA..."  // Base64 编码的视频数据
  }
  ```
- **响应**:
  ```json
  {
    "url": "https://example.com/videos/xyz789.mp4"  // 返回的视频 URL
  }
  ```
- **说明**: 
  - 视频数据通过 Base64 编码发送，前缀包含 MIME 类型 (如 `data:video/mp4;base64,`)
  - 服务器将解码视频数据并保存
  - 返回的 URL 是视频在 CDN 或服务器上的访问地址
  - 由于视频文件通常较大，建议后端考虑设置合理的上传大小限制
  - 前端限制视频大小为 100MB

## 注意事项
1. 所有请求都应处理网络错误和异常情况
2. Base64 编码会使数据量增大约 33%，因此传输大文件时需注意网络条件
3. 对于大型视频文件，推荐考虑实现分片上传功能
4. 服务器应设置适当的超时时间，以处理大型文件上传
5. 建议服务端实现文件类型检查和安全验证
6. API URL 在部署时需要加上正确的 baseURL 