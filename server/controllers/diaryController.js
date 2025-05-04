import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const diariesFilePath = path.join(__dirname, '../models/diary.json');

// 确保 diary.json 文件存在
if (!fs.existsSync(diariesFilePath)) {
  fs.writeFileSync(diariesFilePath, '[]');
}

const readDiaries = () => {
  try {
    const data = fs.readFileSync(diariesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeDiaries = (diaries) => {
  fs.writeFileSync(diariesFilePath, JSON.stringify(diaries, null, 2));
};

// 获取公开游记列表
export const getDiaries = (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    const diaries = readDiaries();
    
    let filteredDiaries = diaries
      .filter(diary => diary.status === 'approved') // 只返回审核通过的
      .filter(diary => 
        diary.title.includes(keyword) || 
        diary.content.includes(keyword)
      );

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
      return res.status(404).json({ message: '游记不存在' });
    }

    res.json(diary);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取我的游记列表
export const getMyDiaries = (req, res) => {
  try {
    const { id: userId } = req.user;
    const diaries = readDiaries();
    const myDiaries = diaries.filter(diary => diary.userId === userId);

    res.json(myDiaries);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建游记
export const createDiary = (req, res) => {
  try {
    const { id: userId } = req.user;
    const { title, content, images, video } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容为必填项' });
    }

    const diaries = readDiaries();
    const newDiary = {
      id: Date.now().toString(),
      userId,
      title,
      content,
      images: images || [],
      video: video || '',
      status: 'pending', // 待审核状态
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    diaries.push(newDiary);
    writeDiaries(diaries);

    res.status(201).json(newDiary);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
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