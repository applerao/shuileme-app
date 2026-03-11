/**
 * 初始化管理员脚本
 * 用于创建或重置管理员账号
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shuileme-feedback';

async function initAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 检查是否已存在管理员
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在');
      console.log('   用户名:', existingAdmin.username);
      console.log('   角色:', existingAdmin.role);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise(resolve => {
        readline.question('是否要重置密码？(y/n): ', answer => {
          readline.close();
          if (answer.toLowerCase() === 'y') {
            resetPassword(existingAdmin);
          } else {
            console.log('👋 已退出');
            process.exit(0);
          }
          resolve();
        });
      });
    } else {
      // 创建默认超级管理员
      const superAdmin = new Admin({
        username: 'admin',
        password: 'admin123',
        role: 'super_admin'
      });
      
      await superAdmin.save();
      console.log('✅ 默认超级管理员已创建');
      console.log('   用户名：admin');
      console.log('   密码：admin123');
      console.log('   ⚠️  首次登录后请立即修改密码！');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

async function resetPassword(admin) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await new Promise(resolve => {
    readline.question('请输入新密码：', async (password) => {
      readline.close();
      
      if (!password || password.length < 6) {
        console.log('❌ 密码长度不能少于 6 位');
        process.exit(1);
      }

      admin.password = password;
      await admin.save();
      
      console.log('✅ 密码已重置');
      resolve();
    });
  });
}

initAdmin();
