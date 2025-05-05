import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 管理员存储路径
const adminFilePath = path.join(__dirname, 'admins.json');

// 确保文件存在
if (!fs.existsSync(adminFilePath)) {
  // 创建默认管理员
  const defaultAdmins = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // 实际应用中应该是加密后的密码
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'auditor',
      password: 'audit123', // 实际应用中应该是加密后的密码
      role: 'auditor',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
}

// 管理员模型类
class Admin {
  // 查找所有管理员
  static findAll() {
    const data = fs.readFileSync(adminFilePath, 'utf8');
    return JSON.parse(data);
  }

  // 根据用户名查找管理员
  static findByUsername(username) {
    const admins = this.findAll();
    return admins.find(admin => admin.username === username);
  }

  // 保存管理员列表
  static saveAll(admins) {
    fs.writeFileSync(adminFilePath, JSON.stringify(admins, null, 2));
  }
}

export default Admin; 