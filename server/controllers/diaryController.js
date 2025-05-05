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

// 读取用户数据
const readUsers = () => {
  try {
    const usersData = fs.readFileSync(path.join(__dirname, '../models/users.json'), 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('读取用户数据失败:', error);
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
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 按创建时间倒序排序

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDiaries = filteredDiaries.slice(startIndex, endIndex);

    res.json({
      total: filteredDiaries.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginatedDiaries
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
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
        success: false,
        message: '游记不存在' 
      });
    }

    // 获取作者信息
    const users = readUsers();
    const author = users.find(user => user.id === diary.userId);

    // 添加作者信息到游记中
    diary.authorNickname = author ? author.nickname : '未知用户';
    diary.authorAvatar = author ? author.avatar : '/static/default-avatar.png';

    res.json({
      success: true,
      data: diary
    });
  } catch (error) {
    console.error('获取游记详情失败:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误' 
    });
  }
};

// 获取我的游记列表
export const getMyDiaries = (req, res) => {
  try {
    const userId = req.user.id;
    const diaries = readDiaries();
    const myDiaries = diaries
      .filter(diary => diary.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 按创建时间倒序排序
    
    res.json({
      success: true,
      data: myDiaries
    });
  } catch (error) {
    console.error('获取我的游记失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取游记失败'
    });
  }
};

// 创建游记
export const createDiary = (req, res) => {
  try {
    const { title, content, images = [], video = '' } = req.body;
    const userId = req.user.id; // 从认证中获取用户ID

    // 验证必填字段
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容为必填项'
      });
    }

    // 创建游记对象
    const diary = {
      id: Date.now().toString(),
      userId, // 添加用户ID关联
      title,
      content,
      images,
      video,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 读取现有游记
    const diaries = readDiaries();
    
    // 添加新游记
    diaries.push(diary);
    
    // 保存到文件
    writeDiaries(diaries);

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '游记创建成功',
      data: diary
    });
  } catch (error) {
    console.error('创建游记失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，创建游记失败'
    });
  }
};

// 修改游记
export const updateDiary = (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { title, content, images, video } = req.body;

    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);

    if (diaryIndex === -1) {
      return res.status(404).json({ message: '游记不存在' });
    }

    if (diaries[diaryIndex].userId !== userId) {
      return res.status(403).json({ message: '无权修改此游记' });
    }

    diaries[diaryIndex] = {
      ...diaries[diaryIndex],
      title: title || diaries[diaryIndex].title,
      content: content || diaries[diaryIndex].content,
      images: images || diaries[diaryIndex].images,
      video: video || diaries[diaryIndex].video,
      status: 'pending', // 修改后需要重新审核
      updatedAt: new Date().toISOString()
    };

    writeDiaries(diaries);
    res.json(diaries[diaryIndex]);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除游记
export const deleteDiary = (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);

    if (diaryIndex === -1) {
      return res.status(404).json({ message: '游记不存在' });
    }

    if (diaries[diaryIndex].userId !== userId) {
      return res.status(403).json({ message: '无权删除此游记' });
    }

    diaries.splice(diaryIndex, 1);
    writeDiaries(diaries);

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};