/**
 * 数据库连接模块
 * @module models/db
 */

const { Pool } = require('pg');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// PostgreSQL 连接池
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'xinyu',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// MongoDB 连接
const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xinyu';
    await mongoose.connect(uri);
    logger.info('MongoDB 连接成功');
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB 连接失败:', error);
    throw error;
  }
};

// Redis 连接
let redisClient;

const connectRedis = () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis 连接成功');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis 错误:', error);
    });

    return redisClient;
  } catch (error) {
    logger.error('Redis 连接失败:', error);
    throw error;
  }
};

// PostgreSQL 连接
const connectPostgreSQL = async () => {
  try {
    await pgPool.query('SELECT NOW()');
    logger.info('PostgreSQL 连接成功');
    return pgPool;
  } catch (error) {
    logger.error('PostgreSQL 连接失败:', error);
    throw error;
  }
};

// 获取 PostgreSQL 客户端
const getPGClient = async () => {
  return await pgPool.connect();
};

// 关闭所有连接
const closeAllConnections = async () => {
  try {
    await pgPool.end();
    logger.info('PostgreSQL 连接已关闭');
  } catch (error) {
    logger.error('关闭 PostgreSQL 连接失败:', error);
  }

  try {
    await mongoose.connection.close();
    logger.info('MongoDB 连接已关闭');
  } catch (error) {
    logger.error('关闭 MongoDB 连接失败:', error);
  }

  try {
    await redisClient.quit();
    logger.info('Redis 连接已关闭');
  } catch (error) {
    logger.error('关闭 Redis 连接失败:', error);
  }
};

module.exports = {
  pgPool,
  getPGClient,
  connectPostgreSQL,
  connectMongoDB,
  connectRedis,
  closeAllConnections,
  getRedisClient: () => redisClient,
};
