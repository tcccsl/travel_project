# 旅游日记平台 - 后端 API 实现文档

## 通用说明

### 基础配置
- 接口基础路径：`http://121.40.88.145:3000`（可根据实际环境配置）
- 响应格式：JSON
- 身份验证：JWT（JSON Web Token）

### 统一响应格式
```json
{
  "code": 200,           // 状态码
  "msg": "成功",         // 状态消息
  "data": { ... }        // 响应数据
}
```

### 错误码规范
| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 身份验证
除了登录和注册接口外，所有请求均需要在请求头中添加 `Authorization` 字段：
```
Authorization: Bearer <token>
```

## 一、用户认证模块

### 1. 普通用户登录
- **URL**: `/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "testuser",
    "password": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "testuser",
        "nickname": "旅行者",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  }
  ```
- **实现注意**:
  - 密码应使用 bcrypt 等算法加密存储
  - token 应设置合理的过期时间（建议 24 小时）

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
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "注册成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "testuser",
        "nickname": "旅行者",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  }
  ```
- **实现注意**:
  - 用户名需检查唯一性
  - 昵称需检查唯一性
  - 密码应进行规则校验，如不少于 6 位

### 3. 检查用户名是否可用
- **URL**: `/auth/check-username`
- **方法**: GET
- **查询参数**: `username`
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "用户名可用",
    "data": {
      "available": true
    }
  }
  ```

### 4. 检查昵称是否可用
- **URL**: `/auth/check-nickname`
- **方法**: GET
- **查询参数**: `nickname`
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "昵称可用",
    "data": {
      "available": true
    }
  }
  ```

### 5. 获取当前用户信息
- **URL**: `/auth/profile`
- **方法**: GET
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "成功",
    "data": {
      "id": 1,
      "username": "testuser",
      "nickname": "旅行者",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
  ```
- **实现注意**:
  - 从 token 中解析用户 ID，获取对应用户信息

### 6. 管理员登录
- **URL**: `/api/admin/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "role": "admin" // 或 "auditor"
    }
  }
  ```
- **实现注意**:
  - 区分管理员角色：普通管理员（admin）和审核员（auditor）
  - 使用单独的表存储管理员信息

## 二、游记模块

### 1. 获取公开游记列表
- **URL**: `/diaries`
- **方法**: GET
- **查询参数**:
  - `page`: 页码，默认 1
  - `limit`: 每页条数，默认 10
  - `keyword`: 搜索关键词（可选）
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "成功",
    "data": {
      "total": 50,
      "pages": 5,
      "current": 1,
      "items": [
        {
          "id": 1,
          "title": "美丽的青海湖之旅",
          "cover": "https://example.com/cover.jpg",
          "createTime": "2023-09-01T12:00:00Z",
          "author": {
            "id": 1,
            "nickname": "旅行者",
            "avatar": "https://example.com/avatar.jpg"
          }
        }
        // ...更多游记
      ]
    }
  }
  ```
- **实现注意**:
  - 只返回审核状态为 `approved` 的游记
  - 支持按标题和内容进行模糊搜索

### 2. 获取游记详情
- **URL**: `/diaries/:id`
- **方法**: GET
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "成功",
    "data": {
      "id": 1,
      "title": "美丽的青海湖之旅",
      "content": "<p>HTML格式正文</p>",
      "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "video": "https://example.com/video.mp4",
      "createTime": "2023-09-01T12:00:00Z",
      "author": {
        "id": 1,
        "nickname": "旅行者",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  }
  ```
- **实现注意**:
  - 未登录用户只能查看审核通过的游记
  - 登录用户可以查看自己的所有游记（包括未通过审核的）

### 3. 获取我的游记列表
- **URL**: `/diaries/mine`
- **方法**: GET
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "成功",
    "data": {
      "total": 10,
      "items": [
        {
          "id": 1,
          "title": "美丽的青海湖之旅",
          "cover": "https://example.com/cover.jpg",
          "createTime": "2023-09-01T12:00:00Z",
          "status": "approved",
          "rejectReason": null
        },
        {
          "id": 2,
          "title": "西藏游记",
          "cover": "https://example.com/cover2.jpg",
          "createTime": "2023-09-05T14:30:00Z",
          "status": "pending",
          "rejectReason": null
        },
        {
          "id": 3,
          "title": "不合规内容",
          "cover": "https://example.com/cover3.jpg",
          "createTime": "2023-09-10T09:15:00Z",
          "status": "rejected",
          "rejectReason": "内容不符合社区规范"
        }
      ]
    }
  }
  ```
- **实现注意**:
  - 需要验证用户身份
  - 返回该用户的所有游记，包括各种状态的

### 4. 创建游记
- **URL**: `/diaries`
- **方法**: POST
- **请求体**:
  ```json
  {
    "title": "游记标题",
    "content": "<p>HTML格式正文</p>",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "video": "https://example.com/video.mp4" // 可选
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "创建成功，等待审核",
    "data": {
      "id": 10
    }
  }
  ```
- **实现注意**:
  - 新创建的游记状态为 `pending`（待审核）
  - 内容应进行 XSS 过滤
  - 参数验证：标题不为空，内容不为空，至少有一张图片

### 5. 更新游记
- **URL**: `/diaries/:id`
- **方法**: PUT
- **请求体**: 同创建游记
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "更新成功，等待审核",
    "data": null
  }
  ```
- **实现注意**:
  - 更新后的游记需要重新审核，状态变为 `pending`
  - 需要验证当前用户是否为游记作者

### 6. 删除游记
- **URL**: `/diaries/:id`
- **方法**: DELETE
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "删除成功",
    "data": null
  }
  ```
- **实现注意**:
  - 需要验证当前用户是否为游记作者
  - 建议使用逻辑删除，设置 `is_deleted` 字段

## 三、管理员模块

### 1. 获取待审核游记列表
- **URL**: `/api/admin/diaries`
- **方法**: GET
- **查询参数**:
  - `page`: 页码，默认 1
  - `limit`: 每页条数，默认 10
  - `status`: 状态筛选（可选，`pending`/`approved`/`rejected`/空表示全部）
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "成功",
    "data": {
      "total": 20,
      "pages": 2,
      "current": 1,
      "items": [
        {
          "id": 1,
          "title": "游记标题",
          "authorId": 2,
          "authorNickname": "作者昵称",
          "createTime": "2023-09-01T12:00:00Z",
          "status": "pending",
          "rejectReason": null
        }
        // ...更多游记
      ]
    }
  }
  ```
- **实现注意**:
  - 需要管理员或审核员权限
  - 支持按状态筛选

### 2. 更新游记状态（审核）
- **URL**: `/api/diary/:id/status`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "status": "approved", // 或 "rejected"
    "rejectReason": "内容不符合规范" // 仅当 status 为 rejected 时需要
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "审核成功",
    "data": null
  }
  ```
- **实现注意**:
  - 需要管理员或审核员权限
  - 当状态为 `rejected` 时，`rejectReason` 为必填项

### 3. 管理员删除游记（逻辑删除）
- **URL**: `/api/diary/:id/delete`
- **方法**: DELETE
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "删除成功",
    "data": null
  }
  ```
- **实现注意**:
  - 只有管理员有权限，审核员无权限
  - 使用逻辑删除，设置 `is_deleted` 字段

## 四、文件上传模块

### 1. 上传图片
- **URL**: `/api/upload/image`
- **方法**: POST
- **请求格式**: 支持两种方式
  
  **方式一：Form-data 格式**
  - 字段名: `file`
  - Content-Type: `multipart/form-data`
  
  **方式二：JSON 格式**
  - Content-Type: `application/json`
  - 请求体:
    ```json
    {
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD..."
    }
    ```
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "上传成功",
    "data": {
      "url": "https://example.com/uploads/image-id.jpg"
    }
  }
  ```
- **实现注意**:
  - 支持 Form-data 和 base64 两种上传方式
  - 图片大小限制（建议 10MB）
  - 格式校验，只允许 jpg/png/gif/webp 等常见图片格式
  - 生成唯一文件名，避免冲突
  - 考虑使用对象存储服务如 OSS、S3 等

### 2. 上传视频
- **URL**: `/api/upload/video`
- **方法**: POST
- **请求格式**: 支持两种方式
  
  **方式一：Form-data 格式**
  - 字段名: `file`
  - Content-Type: `multipart/form-data`
  
  **方式二：JSON 格式**
  - Content-Type: `application/json`
  - 请求体:
    ```json
    {
      "video": "data:video/mp4;base64,AAAAHGZ0eXBNNFYgAAACA..."
    }
    ```
- **响应**:
  ```json
  {
    "code": 200,
    "msg": "上传成功",
    "data": {
      "url": "https://example.com/uploads/video-id.mp4"
    }
  }
  ```
- **实现注意**:
  - 视频大小限制（建议 100MB）
  - 格式校验，只允许 mp4/mov/avi 等常见视频格式
  - 考虑视频转码，生成多种分辨率的版本
  - 考虑使用视频点播服务

## 五、数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 管理员表 (admins)
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'admin' 或 'auditor'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 游记表 (diaries)
```sql
CREATE TABLE diaries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  images JSONB NOT NULL, -- 存储图片URL数组
  video VARCHAR(255), -- 视频URL，可为空
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reject_reason TEXT, -- 拒绝原因，可为空
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_diaries_user_id ON diaries(user_id);
CREATE INDEX idx_diaries_status ON diaries(status);
CREATE INDEX idx_diaries_created_at ON diaries(created_at);
```

## 六、安全与性能优化建议

### 安全建议
1. **使用 HTTPS**：所有 API 通信应使用 HTTPS 加密
2. **参数验证**：所有接口参数都应进行严格验证
3. **防 SQL 注入**：使用参数化查询或 ORM 框架
4. **防 XSS 攻击**：对用户输入内容进行过滤
5. **防 CSRF 攻击**：使用 Token 验证
6. **密码加密**：使用 bcrypt 等算法存储密码
7. **JWT 安全**：设置合理过期时间，使用 HTTPS

### 性能优化
1. **使用缓存**：对热门游记使用 Redis 等缓存
2. **分页查询**：列表接口都应支持分页
3. **异步处理**：文件上传处理应使用异步任务
4. **数据库索引**：为常用查询字段建立索引
5. **图片优化**：使用图片压缩和 CDN 加速
6. **视频处理**：考虑分片上传，使用专业视频服务

## 七、API 测试指南

### 测试环境设置
1. 建立独立的测试数据库
2. 准备测试用例和测试数据
3. 使用 Postman 或类似工具进行 API 测试

### 关键测试点
1. **用户认证**：登录、注册流程
2. **文件上传**：不同大小和格式的文件
3. **游记 CRUD**：完整的增删改查流程
4. **审核流程**：管理员审核游记
5. **错误处理**：测试各种错误情况的响应
6. **权限控制**：测试不同角色的权限边界

## 八、部署建议

### 技术栈推荐
- **后端框架**：Node.js (Express/Nest.js)、Python (Django/Flask)、Java (Spring Boot) 等
- **数据库**：PostgreSQL 或 MySQL
- **缓存**：Redis
- **文件存储**：阿里云 OSS、AWS S3 等
- **容器化**：Docker + Docker Compose

### 部署步骤
1. 环境配置（开发、测试、生产）
2. 数据库迁移与初始化
3. API 服务部署
4. 配置反向代理（Nginx）
5. 设置 HTTPS
6. 配置日志和监控
7. 性能测试与优化 