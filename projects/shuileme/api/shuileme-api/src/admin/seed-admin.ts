import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * 创建默认管理员账户
 * 用户名：admin
 * 密码：admin123
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const adminRepository = getRepository('admin');
    
    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Default admin account already exists');
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await adminRepository.save({
      username: 'admin',
      password: hashedPassword,
      name: '超级管理员',
      role: 'super_admin',
      isActive: true,
    });

    console.log('✅ Default admin account created successfully!');
    console.log('📝 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
