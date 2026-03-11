import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class UpdateUsersTable1709780100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing unique constraint on username if exists
    try {
      await queryRunner.dropIndex('users', 'UQ_users_username');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('users', 'UQ_users_email');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Drop username and email columns
    await queryRunner.dropColumn('users', 'username');
    await queryRunner.dropColumn('users', 'email');

    // Add wechatId column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'wechatId',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Create unique index on wechatId
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_WECHAT_ID',
        columnNames: ['wechatId'],
      }),
    );

    // Make phone NOT NULL and add unique constraint
    await queryRunner.changeColumn(
      'users',
      'phone',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: false,
      }),
    );

    // Create unique index on phone
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_PHONE',
        columnNames: ['phone'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('users', 'IDX_USERS_WECHAT_ID');
    await queryRunner.dropIndex('users', 'IDX_USERS_PHONE');

    // Drop wechatId column
    await queryRunner.dropColumn('users', 'wechatId');

    // Add back username and email columns
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'username',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Make phone nullable again
    await queryRunner.changeColumn(
      'users',
      'phone',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }
}
