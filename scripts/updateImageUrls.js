import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置服务器URL
const SERVER_URL = process.env.SERVER_URL || 'http://121.40.88.145:3000';

// 更新数据库中的图片URL
async function updateImageUrls() {
  try {
    console.log('开始更新图片URL...');
    console.log(`使用服务器URL: ${SERVER_URL}`);
    
    // 更新日记数据
    const diariesPath = path.join(__dirname, '../data/diaries.json');
    if (fs.existsSync(diariesPath)) {
      console.log('更新日记图片URL...');
      const diariesData = fs.readFileSync(diariesPath, 'utf8');
      let diaries = JSON.parse(diariesData);
      
      let updateCount = 0;
      diaries = diaries.map(diary => {
        if (diary.images && diary.images.length > 0) {
          const updatedImages = diary.images.map(imgUrl => {
            if (imgUrl.includes('localhost:3000')) {
              updateCount++;
              return imgUrl.replace('http://localhost:3000', SERVER_URL);
            }
            return imgUrl;
          });
          return { ...diary, images: updatedImages };
        }
        
        if (diary.videos && diary.videos.length > 0) {
          const updatedVideos = diary.videos.map(videoUrl => {
            if (videoUrl.includes('localhost:3000')) {
              updateCount++;
              return videoUrl.replace('http://localhost:3000', SERVER_URL);
            }
            return videoUrl;
          });
          return { ...diary, videos: updatedVideos };
        }
        
        return diary;
      });
      
      fs.writeFileSync(diariesPath, JSON.stringify(diaries, null, 2));
      console.log(`日记图片URL更新完成，共更新 ${updateCount} 条记录`);
    } else {
      console.log('日记数据文件不存在');
    }
    
    // 更新用户头像
    const usersPath = path.join(__dirname, '../models/users.json');
    if (fs.existsSync(usersPath)) {
      console.log('更新用户头像URL...');
      const usersData = fs.readFileSync(usersPath, 'utf8');
      let users = JSON.parse(usersData);
      
      let updateCount = 0;
      users = users.map(user => {
        if (user.avatar && user.avatar.includes('localhost:3000')) {
          updateCount++;
          return { ...user, avatar: user.avatar.replace('http://localhost:3000', SERVER_URL) };
        }
        return user;
      });
      
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      console.log(`用户头像URL更新完成，共更新 ${updateCount} 条记录`);
    } else {
      console.log('用户数据文件不存在');
    }
    
    console.log('所有图片URL更新完成！');
  } catch (error) {
    console.error('更新图片URL失败:', error);
  }
}

// 执行更新
updateImageUrls(); 