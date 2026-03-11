import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePushTokens1709800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'push_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'device_token',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'platform',
            type: 'enum',
            enum: ['ios', 'android'],
          },
          {
            name: 'device_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'app_version',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_active_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // 添加唯一约束
    await queryRunner.createUniqueConstraint('push_tokens', 'UQ_push_tokens_user_device_platform', [
      'user_id',
      'device_token',
      'platform',
    ]);

    // 添加外键
    await queryRunner.createForeignKey(
      'push_tokens',
      new TableForeignKey({
        name: 'FK_push_tokens_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 添加索引
    await queryRunner.createIndex(
      'push_tokens',
      'IDX_push_tokens_user_id',
      ['user_id'],
    );

    await queryRunner.createIndex(
      'push_tokens',
      'IDX_push_tokens_is_active',
      ['is_active'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('push_tokens', 'FK_push_tokens_user');
    await queryRunner.dropIndex('push_tokens', 'IDX_push_tokens_is_active');
    await queryRunner.dropIndex('push_tokens', 'IDX_push_tokens_user_id');
    await queryRunner.dropUniqueConstraint('push_tokens', 'UQ_push_tokens_user_device_platform');
    await queryRunner.dropTable('push_tokens');
  }
}
