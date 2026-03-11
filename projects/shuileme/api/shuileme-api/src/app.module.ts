import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { databaseConfig } from './config/database';
import { redisConfig } from './config/redis';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CheckinsModule } from './checkins/checkins.module';
import { SupervisionsModule } from './supervisions/supervisions.module';
import { SleepRecordsModule } from './sleep-records/sleep-records.module';
import { AchievementsModule } from './achievements/achievements.module';
import { VerificationCodesModule } from './verification-codes/verification-codes.module';
import { WechatModule } from './wechat/wechat.module';
import { StatsModule } from './stats/stats.module';
import { PushModule } from './push/push.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => databaseConfig(),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '7d'),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.get<number>('THROTTLE_TTL_SHORT', 10000),
            limit: configService.get<number>('THROTTLE_LIMIT_SHORT', 3),
          },
          {
            name: 'medium',
            ttl: configService.get<number>('THROTTLE_TTL_MEDIUM', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT_MEDIUM', 10),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    VerificationCodesModule,
    WechatModule,
    CheckinsModule,
    SupervisionsModule,
    SleepRecordsModule,
    AchievementsModule,
    StatsModule,
    PushModule,
    AdminModule,
  ],
})
export class AppModule {}
