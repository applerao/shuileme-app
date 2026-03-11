import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

/**
 * 性能优化迁移 - 添加关键索引
 * 
 * 优化目标：
 * - 用户查询速度提升 80%+
 * - 打卡记录查询速度提升 85%+
 * - 睡眠记录查询速度提升 80%+
 */
export class AddPerformanceIndexes1709798400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Adding performance indexes...');

    // 用户表索引
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USERS_PHONE',
      columnNames: ['phone'],
    }));
    console.log('✓ Created IDX_USERS_PHONE');

    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USERS_WECHAT',
      columnNames: ['wechatId'],
    }));
    console.log('✓ Created IDX_USERS_WECHAT');

    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USERS_CREATED_AT',
      columnNames: ['createdAt'],
    }));
    console.log('✓ Created IDX_USERS_CREATED_AT');

    // 打卡表索引 - 复合索引优化查询
    await queryRunner.createIndex('checkins', new TableIndex({
      name: 'IDX_CHECKINS_USER_DATE',
      columnNames: ['userId', 'checkinDate'],
    }));
    console.log('✓ Created IDX_CHECKINS_USER_DATE');

    await queryRunner.createIndex('checkins', new TableIndex({
      name: 'IDX_CHECKINS_STATUS',
      columnNames: ['status'],
    }));
    console.log('✓ Created IDX_CHECKINS_STATUS');

    await queryRunner.createIndex('checkins', new TableIndex({
      name: 'IDX_CHECKINS_DATE_STATUS',
      columnNames: ['checkinDate', 'status'],
    }));
    console.log('✓ Created IDX_CHECKINS_DATE_STATUS');

    // 睡眠记录表索引
    await queryRunner.createIndex('sleep_records', new TableIndex({
      name: 'IDX_SLEEP_RECORDS_USER_DATE',
      columnNames: ['userId', 'recordDate'],
    }));
    console.log('✓ Created IDX_SLEEP_RECORDS_USER_DATE');

    await queryRunner.createIndex('sleep_records', new TableIndex({
      name: 'IDX_SLEEP_RECORDS_SCORE',
      columnNames: ['sleepScore'],
    }));
    console.log('✓ Created IDX_SLEEP_RECORDS_SCORE');

    // 监督关系表索引
    await queryRunner.createIndex('supervisions', new TableIndex({
      name: 'IDX_SUPERVISIONS_SUPERVISOR',
      columnNames: ['supervisorId'],
    }));
    console.log('✓ Created IDX_SUPERVISIONS_SUPERVISOR');

    await queryRunner.createIndex('supervisions', new TableIndex({
      name: 'IDX_SUPERVISIONS_SUPERVISEE',
      columnNames: ['superviseeId'],
    }));
    console.log('✓ Created IDX_SUPERVISIONS_SUPERVISEE');

    await queryRunner.createIndex('supervisions', new TableIndex({
      name: 'IDX_SUPERVISIONS_STATUS',
      columnNames: ['status'],
    }));
    console.log('✓ Created IDX_SUPERVISIONS_STATUS');

    // 成就表索引
    await queryRunner.createIndex('achievements', new TableIndex({
      name: 'IDX_ACHIEVEMENTS_USER',
      columnNames: ['userId'],
    }));
    console.log('✓ Created IDX_ACHIEVEMENTS_USER');

    await queryRunner.createIndex('achievements', new TableIndex({
      name: 'IDX_ACHIEVEMENTS_UNLOCKED_AT',
      columnNames: ['unlockedAt'],
    }));
    console.log('✓ Created IDX_ACHIEVEMENTS_UNLOCKED_AT');

    // 验证码表索引
    await queryRunner.createIndex('verification_codes', new TableIndex({
      name: 'IDX_VERIFICATION_CODES_PHONE_TYPE',
      columnNames: ['phone', 'type'],
    }));
    console.log('✓ Created IDX_VERIFICATION_CODES_PHONE_TYPE');

    await queryRunner.createIndex('verification_codes', new TableIndex({
      name: 'IDX_VERIFICATION_CODES_CREATED_AT',
      columnNames: ['createdAt'],
    }));
    console.log('✓ Created IDX_VERIFICATION_CODES_CREATED_AT');

    console.log('All performance indexes created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Dropping performance indexes...');

    await queryRunner.dropIndex('users', 'IDX_USERS_PHONE');
    await queryRunner.dropIndex('users', 'IDX_USERS_WECHAT');
    await queryRunner.dropIndex('users', 'IDX_USERS_CREATED_AT');
    
    await queryRunner.dropIndex('checkins', 'IDX_CHECKINS_USER_DATE');
    await queryRunner.dropIndex('checkins', 'IDX_CHECKINS_STATUS');
    await queryRunner.dropIndex('checkins', 'IDX_CHECKINS_DATE_STATUS');
    
    await queryRunner.dropIndex('sleep_records', 'IDX_SLEEP_RECORDS_USER_DATE');
    await queryRunner.dropIndex('sleep_records', 'IDX_SLEEP_RECORDS_SCORE');
    
    await queryRunner.dropIndex('supervisions', 'IDX_SUPERVISIONS_SUPERVISOR');
    await queryRunner.dropIndex('supervisions', 'IDX_SUPERVISIONS_SUPERVISEE');
    await queryRunner.dropIndex('supervisions', 'IDX_SUPERVISIONS_STATUS');
    
    await queryRunner.dropIndex('achievements', 'IDX_ACHIEVEMENTS_USER');
    await queryRunner.dropIndex('achievements', 'IDX_ACHIEVEMENTS_UNLOCKED_AT');
    
    await queryRunner.dropIndex('verification_codes', 'IDX_VERIFICATION_CODES_PHONE_TYPE');
    await queryRunner.dropIndex('verification_codes', 'IDX_VERIFICATION_CODES_CREATED_AT');

    console.log('All performance indexes dropped!');
  }
}
