import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PushService } from './push.service';
import {
  SendPushDto,
  RegisterPushTokenDto,
  UnregisterPushTokenDto,
  PushTemplateDto,
  PushType,
} from './dto/push.dto';
import { PushToken, Platform } from './entities/push-token.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('push')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('register-token')
  @ApiOperation({ summary: '注册推送 Token' })
  @ApiResponse({ status: 201, description: 'Token 注册成功' })
  async registerToken(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterPushTokenDto,
  ): Promise<PushToken> {
    return this.pushService.registerToken(
      user.id,
      dto.deviceToken,
      dto.platform,
      dto.deviceId,
      dto.appVersion,
    );
  }

  @Delete('unregister-token')
  @ApiOperation({ summary: '注销推送 Token' })
  @ApiResponse({ status: 200, description: 'Token 注销成功' })
  @HttpCode(HttpStatus.OK)
  async unregisterToken(
    @CurrentUser() user: { id: string },
    @Body() dto: UnregisterPushTokenDto,
  ): Promise<void> {
    return this.pushService.unregisterToken(user.id, dto.deviceToken);
  }

  @Get('tokens')
  @ApiOperation({ summary: '获取当前用户的推送 Token 列表' })
  @ApiResponse({ status: 200, description: '返回 Token 列表' })
  async getTokens(@CurrentUser() user: { id: string }): Promise<PushToken[]> {
    return this.pushService.getUserTokens(user.id);
  }

  @Post('send')
  @ApiOperation({ summary: '发送推送通知' })
  @ApiResponse({ status: 201, description: '推送发送成功' })
  @HttpCode(HttpStatus.CREATED)
  async sendPush(
    @Body() dto: SendPushDto,
  ): Promise<{ success: boolean; message: string }> {
    switch (dto.type) {
      case PushType.SINGLE:
        if (dto.userIds && dto.userIds.length > 0) {
          await this.pushService.sendToUsers(
            dto.userIds,
            dto.title,
            dto.content,
            dto.extras,
          );
        } else if (dto.deviceToken) {
          // 单设备推送（通过 token）
          await this.pushService.sendToUser(
            'temp', // 这里需要调整，单设备推送需要单独实现
            dto.title,
            dto.content,
            dto.extras,
          );
        }
        break;
      case PushType.BATCH:
        if (dto.userIds && dto.userIds.length > 0) {
          await this.pushService.sendToUsers(
            dto.userIds,
            dto.title,
            dto.content,
            dto.extras,
          );
        }
        break;
      case PushType.ALL:
        await this.pushService.sendToAll(dto.title, dto.content, dto.extras);
        break;
    }

    return {
      success: true,
      message: '推送已发送',
    };
  }

  @Post('send/template')
  @ApiOperation({ summary: '使用模板发送推送' })
  @ApiResponse({ status: 201, description: '推送发送成功' })
  @HttpCode(HttpStatus.CREATED)
  async sendWithTemplate(
    @CurrentUser() user: { id: string },
    @Body() dto: PushTemplateDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.pushService.sendWithTemplate(user.id, dto.templateId, dto.variables);
    return {
      success: true,
      message: '推送已发送',
    };
  }

  @Post('send/bedtime')
  @ApiOperation({ summary: '发送睡前提醒' })
  @ApiResponse({ status: 201, description: '提醒已发送' })
  @HttpCode(HttpStatus.CREATED)
  async sendBedtimeReminder(
    @Query('userId') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.pushService.sendBedtimeReminder(userId);
    return {
      success: true,
      message: '睡前提醒已发送',
    };
  }

  @Post('send/wakeup')
  @ApiOperation({ summary: '发送起床提醒' })
  @ApiResponse({ status: 201, description: '提醒已发送' })
  @HttpCode(HttpStatus.CREATED)
  async sendWakeupReminder(
    @Query('userId') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.pushService.sendWakeupReminder(userId);
    return {
      success: true,
      message: '起床提醒已发送',
    };
  }

  @Post('send/achievement')
  @ApiOperation({ summary: '发送成就解锁通知' })
  @ApiResponse({ status: 201, description: '通知已发送' })
  @HttpCode(HttpStatus.CREATED)
  async sendAchievementUnlocked(
    @Query('userId') userId: string,
    @Query('achievementName') achievementName: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.pushService.sendAchievementUnlocked(userId, achievementName);
    return {
      success: true,
      message: '成就通知已发送',
    };
  }

  @Post('send/supervision-message')
  @ApiOperation({ summary: '发送监督消息通知' })
  @ApiResponse({ status: 201, description: '通知已发送' })
  @HttpCode(HttpStatus.CREATED)
  async sendSupervisionMessage(
    @Query('userId') userId: string,
    @Query('senderName') senderName: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.pushService.sendSupervisionMessage(userId, senderName);
    return {
      success: true,
      message: '监督消息通知已发送',
    };
  }
}
