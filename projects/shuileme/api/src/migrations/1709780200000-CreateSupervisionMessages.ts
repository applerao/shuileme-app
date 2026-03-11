import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSupervisionMessages1709780200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'supervision_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'supervision_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'receiver_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['remind', 'encourage', 'custom'],
            default: "'custom'",
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 创建索引
    await queryRunner.createIndex(
      'supervision_messages',
      new TableIndex({
        name: 'IDX_SUPERVISION_MESSAGES_SUPERVISION',
        columnNames: ['supervision_id'],
      }),
    );

    await queryRunner.createIndex(
      'supervision_messages',
      new TableIndex({
        name: 'IDX_SUPERVISION_MESSAGES_SENDER',
        columnNames: ['sender_id'],
      }),
    );

    await queryRunner.createIndex(
      'supervision_messages',
      new TableIndex({
        name: 'IDX_SUPERVISION_MESSAGES_RECEIVER',
        columnNames: ['receiver_id'],
      }),
    );

    // 创建外键约束
    await queryRunner.createForeignKey(
      'supervision_messages',
      new TableForeignKey({
        name: 'FK_SUPERVISION_MESSAGES_SUPERVISION',
        columnNames: ['supervision_id'],
        referencedTableName: 'supervisions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'supervision_messages',
      new TableForeignKey({
        name: 'FK_SUPERVISION_MESSAGES_SENDER',
        columnNames: ['sender_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'supervision_messages',
      new TableForeignKey({
        name: 'FK_SUPERVISION_MESSAGES_RECEIVER',
        columnNames: ['receiver_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('supervision_messages');
  }
}
