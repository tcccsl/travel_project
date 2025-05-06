import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const diariesFilePath = path.join(__dirname, '../data/diaries.json');

// 确保数据目录和文件存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(diariesFilePath)) {
  fs.writeFileSync(diariesFilePath, '[]', 'utf8');
}

// 读取游记数据
const readDiaries = () => {
  try {
    const data = fs.readFileSync(diariesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取游记数据失败:', error);
    return [];
  }
};

// 写入游记数据
const writeDiaries = (diaries) => {
  try {
    fs.writeFileSync(diariesFilePath, JSON.stringify(diaries, null, 2), 'utf8');
  } catch (error) {
    console.error('写入游记数据失败:', error);
  }
};

// 获取公开游记列表
export const getDiaries = (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    const diaries = readDiaries();
    
    let filteredDiaries = diaries
      .filter(diary => diary.status === 'approved') // 只返回审核通过的
      .filter(diary => 
        diary.title.toLowerCase().includes(keyword.toLowerCase()) || 
        diary.content.toLowerCase().includes(keyword.toLowerCase())
      )
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime)); // 按创建时间倒序排序

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDiaries = filteredDiaries.slice(startIndex, endIndex);

    res.json({
      code: 200,
      msg: "获取成功",
      data: paginatedDiaries.map(diary => ({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        location: diary.location || "",
        authorId: diary.userId,
        authorNickname: diary.authorNickname || "用户",
        createTime: diary.createTime,
        updateTime: diary.updateTime,
        status: diary.status,
        images: diary.images || [],
        videos: diary.videos || [],
        rejectReason: diary.rejectReason || ""
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
};

// 获取游记详情
export const getDiaryById = (req, res) => {
  try {
    const { id } = req.params;
    const diaries = readDiaries();
    const diary = diaries.find(d => d.id === id);

    if (!diary) {
      return res.status(404).json({ 
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      msg: "获取成功",
      data: {
        id: diary.id,
        title: diary.title,
        content: diary.content,
        location: diary.location || "",
        authorId: diary.userId,
        authorNickname: diary.authorNickname || "用户",
        createTime: diary.createTime,
        updateTime: diary.updateTime,
        status: diary.status,
        images: diary.images || [],
        videos: diary.videos || [],
        rejectReason: diary.rejectReason || ""
      }
    });
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
};

// 获取我的游记列表
export const getMyDiaries = (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const diaries = readDiaries();
    
    console.log("当前用户ID:", userId);
    
    const myDiaries = diaries
      .filter(diary => {
        console.log("比较:", diary.userId, userId, diary.userId === userId);
        return String(diary.userId) === String(userId);
      })
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime)); // 按创建时间倒序排序
    
    console.log("我的游记数量:", myDiaries.length);
    
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = parseInt(page) * parseInt(limit);
    const paginatedDiaries = myDiaries.slice(startIndex, endIndex);
    
    res.json({
      code: 200,
      msg: "获取成功",
      data: paginatedDiaries.map(diary => ({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        location: diary.location || "",
        authorId: diary.userId,
        authorNickname: diary.authorNickname || "用户",
        createTime: diary.createTime,
        updateTime: diary.updateTime,
        status: diary.status,
        images: diary.images || [],
        videos: diary.videos || [],
        rejectReason: diary.rejectReason || ""
      }))
    });
  } catch (error) {
    console.error('获取我的游记失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误，获取游记失败',
      data: null
    });
  }
};

// 创建游记
export const createDiary = (req, res) => {
  try {
    const { title, content, location, images = [], videos = [] } = req.body;
    const userId = req.user.id; // 从认证中获取用户ID
    const authorNickname = req.user.nickname || "用户";
    
    console.log("创建游记的用户ID:", userId);

    // 验证必填字段
    if (!title || !content) {
      return res.status(400).json({
        code: 400,
        msg: '标题和内容为必填项',
        data: null
      });
    }

    // 创建游记对象
    const diary = {
      id: Date.now().toString(),
      userId: String(userId),
      authorNickname,
      title,
      content,
      location: location || "",
      images,
      videos,
      status: 'pending', // 默认为待审核状态
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      rejectReason: ""
    };

    // 读取现有游记
    const diaries = readDiaries();
    
    // 添加新游记
    diaries.push(diary);
    
    // 保存到文件
    writeDiaries(diaries);
    
    console.log("游记创建成功:", diary.id);

    // 返回成功响应
    res.status(201).json({
      code: 200,
      msg: '创建成功，等待审核',
      data: {
        id: diary.id,
        status: diary.status
      }
    });
  } catch (error) {
    console.error('创建游记失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误，创建游记失败',
      data: null
    });
  }
};

// 修改游记
export const updateDiary = (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { title, content, location, images, videos } = req.body;

    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);

    if (diaryIndex === -1) {
      return res.status(404).json({ 
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }

    if (diaries[diaryIndex].userId !== userId) {
      return res.status(403).json({ 
        code: 403,
        msg: '无权修改此游记',
        data: null
      });
    }

    diaries[diaryIndex] = {
      ...diaries[diaryIndex],
      title: title || diaries[diaryIndex].title,
      content: content || diaries[diaryIndex].content,
      location: location || diaries[diaryIndex].location,
      images: images || diaries[diaryIndex].images,
      videos: videos || diaries[diaryIndex].videos,
      status: 'pending', // 修改后需要重新审核
      updateTime: new Date().toISOString()
    };

    writeDiaries(diaries);
    
    res.json({
      code: 200,
      msg: '更新成功，等待审核',
      data: {
        id: diaries[diaryIndex].id,
        status: diaries[diaryIndex].status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
};

// 删除游记
export const deleteDiary = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 检查是否为管理员请求
    const isAdmin = req.isAdmin === true || req.originalUrl.includes('/api/admin');
    
    console.log("删除游记 - 用户ID:", userId, "游记ID:", id, "管理员权限:", isAdmin);
    
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);

    if (diaryIndex === -1) {
      console.log("游记不存在:", id);
      return res.status(404).json({ 
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }

    // 输出比较信息以便调试
    console.log("比较用户ID:", {
      diaryUserId: diaries[diaryIndex].userId,
      currentUserId: userId,
      isAdmin: isAdmin,
      equal: String(diaries[diaryIndex].userId) === String(userId)
    });

    // 如果不是管理员，则检查是否为用户自己的游记
    if (!isAdmin && String(diaries[diaryIndex].userId) !== String(userId)) {
      console.log("权限不足 - 游记的用户ID:", diaries[diaryIndex].userId);
      return res.status(403).json({ 
        code: 403,
        msg: '无权删除此游记',
        data: null 
      });
    }

    console.log("删除游记成功:", id, "管理员权限:", isAdmin);
    diaries.splice(diaryIndex, 1);
    writeDiaries(diaries);

    res.json({ 
      code: 200, 
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    console.error("删除游记错误:", error);
    res.status(500).json({ 
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
};