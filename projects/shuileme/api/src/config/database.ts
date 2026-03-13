import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'sqlite'; // 'sqlite' or 'postgres'
  
  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'shuileme',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV === 'development',
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false,
    };
  } else {
    // SQLite mode
    const sqlitePath = process.env.DB_SQLITE_PATH || './data/shuileme.db';
    const dbFilePath = path.resolve(process.cwd(), sqlitePath);
    const dataDir = path.dirname(dbFilePath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    return {
      type: 'sqlite',
      database: dbFilePath,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV === 'development',
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false,
    };
  }
};
