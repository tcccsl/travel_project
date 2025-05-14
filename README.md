# 旅游日记平台

## 项目简介
这是一个基于 Node.js + Vue3 的旅游日记分享平台，包含移动端用户系统和 PC 端管理系统。用户可以发布、查看和分享旅游日记，管理员可以进行内容审核和管理。

## 技术栈

### 前端技术栈
- 移动端：uni-app + Vue3 + Pinia
- 开发工具：HBuilderX
- UI框架：uni-ui
- 状态管理：Pinia
- 网络请求：Axios
- 样式处理：Sass

### 后端技术栈
- 运行环境：Node.js
- Web框架：Express
- 数据库：MongoDB
- 认证方案：JWT
- 文件上传：Multer
- API文档：Swagger

## 项目结构

```
travel_project/
├── frontend/                # 移动端前端项目
│   ├── src/
│   │   ├── pages/          # 页面文件
│   │   ├── components/     # 公共组件
│   │   ├── store/          # Pinia状态管理
│   │   ├── api/            # API接口
│   │   ├── utils/          # 工具函数
│   │   └── static/         # 静态资源
│   └── package.json        # 项目依赖
│
├── newback/                 # 后端项目
│   ├── routes/             # 路由文件
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── middlewares/        # 中间件
│   ├── utils/              # 工具函数
│   └── app.js              # 应用入口
│
└── apk/                    # 安卓安装包
    └── __UNI__7B2F103__20250514131800.apk
```

## 主要功能

### 移动端功能
1. 用户系统
   - 用户注册/登录
   - 个人信息管理
   - 头像上传

2. 游记管理
   - 游记发布（支持多图片和视频）
   - 游记列表（瀑布流展示）
   - 游记详情
   - 我的游记

3. 社交功能
   - 游记分享
   - 内容互动

### 管理系统功能
1. 内容审核
   - 游记审核
   - 状态管理
   - 内容删除

2. 用户管理
   - 用户信息查看
   - 权限控制

## 开发环境搭建

### 前端开发环境
```bash
# 安装依赖
cd frontend
npm install

# 运行开发服务器
npm run dev:h5
```

### 后端开发环境
```bash
# 安装依赖
cd newback
npm install

# 运行开发服务器
npm run dev
```

## 部署说明

### 前端部署
1. 打包移动端
```bash
cd frontend
npm run build:app-android
```

2. 生成安卓安装包
- 使用 HBuilderX 进行打包
- 打包后的文件位于 apk 目录

### 后端部署
1. 安装依赖
```bash
cd newback
npm install
```

2. 启动服务
```bash
npm start
```

## 项目特点
1. 跨平台开发
   - 使用 uni-app 实现一次开发，多端运行
   - 支持微信小程序、H5、Android 等多平台

2. 性能优化
   - 图片压缩和懒加载
   - 瀑布流分页加载
   - 视频播放优化

3. 安全机制
   - JWT 身份认证
   - 内容审核机制
   - 权限控制

## 注意事项
1. 开发前请确保已安装所需环境
2. 注意保护敏感信息（如数据库密码、API密钥等）
3. 遵循代码规范，保持代码整洁
4. 定期备份数据库

## 贡献指南
1. Fork 本仓库
2. 创建新的功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证
MIT License
