import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Diary from '../models/diary.js';
import { validationResult } from 'express-validator';

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
export const getDiaries = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const query = { status: 'approved' };
    
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ];
    }

    const diaries = await Diary.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username nickname avatar');

    const total = await Diary.countDocuments(query);

    res.json({
      diaries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 获取游记详情
export const getDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id)
      .populate('author', 'username nickname avatar');
    
    if (!diary) {
      return res.status(404).json({ message: '游记不存在' });
    }

    if (diary.status !== 'approved' && (!req.user || diary.author._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: '无权访问该游记' });
    }

    res.json(diary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 获取我的游记列表
export const getMyDiaries = async (req, res) => {
  try {
    const diaries = await Diary.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 创建游记
export const createDiary = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, images, video } = req.body;
    const diary = new Diary({
      title,
      content,
      images,
      video,
      author: req.user.id,
      status: 'pending'
    });

    const savedDiary = await diary.save();
    res.status(201).json(savedDiary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 修改游记
export const updateDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ message: '游记不存在' });
    }

    if (diary.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权修改该游记' });
    }

    const { title, content, images, video } = req.body;
    diary.title = title;
    diary.content = content;
    diary.images = images;
    diary.video = video;
    diary.status = 'pending'; // 修改后需要重新审核

    const updatedDiary = await diary.save();
    res.json(updatedDiary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 删除游记
export const deleteDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ message: '游记不存在' });
    }

    if (diary.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权删除该游记' });
    }

    await diary.remove();
    res.json({ message: '游记已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 获取所有游记（管理员）
export const getAdminDiaries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const diaries = await Diary.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username nickname avatar');

    const total = await Diary.countDocuments(query);

    res.json({
      diaries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 更新游记状态（管理员）
export const updateDiaryStatus = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ message: '游记不存在' });
    }

    const { status, reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }

    if (status === 'rejected' && !reason) {
      return res.status(400).json({ message: '拒绝时必须提供原因' });
    }

    diary.status = status;
    diary.rejectReason = status === 'rejected' ? reason : undefined;
    diary.reviewedAt = new Date();
    diary.reviewedBy = req.user.id;

    const updatedDiary = await diary.save();
    res.json(updatedDiary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 删除游记（管理员）
export const deleteDiaryByAdmin = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    
    if (!diary) {
      return res.status(404).json({ message: '游记不存在' });
    }

    await diary.remove();
    res.json({ message: '游记已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};