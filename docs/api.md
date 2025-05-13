# 旅游日记平台 - 前端接口文档

## 通用说明
- 所有接口地址以 `/api/` 开头。
- 除登录/注册接口外，其他接口均需在请求头中添加 Authorization：
  Authorization: Bearer <token>

---

## 一、用户模块

### 1. 用户注册
- POST /api/register
- 请求体：
  ```json
  {
    "username": "testuser",
    "password": "123456",
    "nickname": "旅行者",
    "avatar": "https://example.com/avatar.jpg" // 可选
  }
  ```
- 响应：包含 token

### 2. 用户登录
- POST /api/login
- 请求体：
  ```json
  {
    "username": "testuser",
    "password": "123456"
  }
  ```
- 响应：包含 token

### 3. 获取当前用户信息
- GET /api/user/info
- 响应：当前用户的昵称、头像、id

---

## 二、游记模块（用户端）

### 1. 获取公开游记列表（首页）
- GET /api/diaries
- 查询参数：
  - page: 页码
  - limit: 每页数量
  - keyword: （可选）关键词搜索
- 响应：分页列表，包含游记的封面、标题、作者头像与昵称

### 2. 获取游记详情
- GET /api/diary/:id
- 参数：游记 id
- 响应：完整游记内容（标题、正文、图片、视频、作者信息）

### 3. 获取我的游记列表
- GET /api/diaries/mine
- 响应：包含当前用户所有发布过的游记，含审核状态与拒绝原因（如有）

### 4. 新建游记
- POST /api/diary
- 请求体：
  ```json
  {
    "title": "游记标题",
    "content": "<p>HTML格式正文</p>",
    "images": ["url1", "url2"],
    "video": "video_url"
  }
  ```

### 5. 修改游记
- PUT /api/diary/:id
- 同 POST 接口，提交修改内容

### 6. 删除游记
- DELETE /api/diary/:id
- 删除当前游记（逻辑或物理删除）

---

## 三、文件上传

### 1. 上传图片
- POST /api/upload/image
- 请求体：FormData 格式，字段名为 `file`
- 响应：图片 URL

### 2. 上传视频
- POST /api/upload/video
- 请求体：FormData 格式，字段名为 `file`
- 响应：视频 URL

---

## 状态说明

- 游记状态（status）：
  - pending：待审核
  - approved：审核通过
  - rejected：审核未通过

- 删除方式建议使用逻辑删除（前端可选不展示 `is_deleted: true` 的内容）

---

## 错误码说明

- 200：请求成功
- 401：未授权，请重新登录
- 403：无权限访问
- 404：接口不存在
- 500：服务器错误