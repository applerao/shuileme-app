import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupervisionsService } from './supervisions.service';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { SupervisionResponseDto } from './dto/supervision-response.dto';
import { SupervisionListResponseDto } from './dto/supervision-list-response.dto';
import { AddSupervisionDto } from './dto/add-supervision.dto';
import { RemindDto } from './dto/remind.dto';
import { SupervisionMessageResponseDto } from './dto/supervision-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('supervisions')
@Controller('supervisions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupervisionsController {
  constructor(private readonly supervisionsService: SupervisionsService) {}

  @Post()
  @ApiOperation({ summary: '创建监督关系申请' })
  @ApiResponse({ status: 201, type: SupervisionResponseDto })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createSupervisionDto: CreateSupervisionDto,
  ) {
    return this.supervisionsService.create(user.userId, createSupervisionDto);
  }

  @Post('add')
  @ApiOperation({ summary: '添加监督者' })
  @ApiResponse({ status: 201, type: SupervisionResponseDto })
  addSupervisor(
    @CurrentUser() user: JwtPayload,
    @Body() addSupervisionDto: AddSupervisionDto,
  ) {
    const { userId, supervisorId } = addSupervisionDto;
    // 确保当前用户是被监督者
    if (user.userId !== userId) {
      throw new Error('Unauthorized: userId must match current user');
    }
    return this.supervisionsService.addSupervisor(userId, supervisorId);
  }

  @Get('list')
  @ApiOperation({ summary: '获取监督关系列表' })
  @ApiResponse({ status: 200, type: SupervisionListResponseDto })
  @ApiQuery({ name: 'userId', required: true, description: '用户 ID' })
  getSupervisionList(
    @CurrentUser() user: JwtPayload,
    @Query('userId') userId: string,
  ) {
    // 确保当前用户只能查询自己的列表
    if (user.userId !== userId) {
      throw new Error('Unauthorized: userId must match current user');
    }
    return this.supervisionsService.getSupervisionList(userId);
  }

  @Get()
  @ApiOperation({ summary: '获取我的监督关系列表' })
  @ApiResponse({ status: 200, type: [SupervisionResponseDto] })
  @ApiQuery({ name: 'role', required: false, enum: ['supervisor', 'supervisee'] })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('role') role?: 'supervisor' | 'supervisee',
  ) {
    return this.supervisionsService.findAllByUser(user.userId, role);
  }

  @Get('active')
  @ApiOperation({ summary: '获取活跃的监督关系' })
  @ApiResponse({ status: 200, type: [SupervisionResponseDto] })
  getActive(@CurrentUser() user: JwtPayload) {
    return this.supervisionsService.getActiveSupervisions(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取监督关系' })
  @ApiResponse({ status: 200, type: SupervisionResponseDto })
  findOne(@Param('id') id: string) {
    return this.supervisionsService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: '批准监督申请' })
  @ApiResponse({ status: 200, type: SupervisionResponseDto })
  approve(@Param('id') id: string) {
    return this.supervisionsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '拒绝监督申请' })
  @ApiResponse({ status: 200, type: SupervisionResponseDto })
  reject(@Param('id') id: string) {
    return this.supervisionsService.reject(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消监督关系' })
  @ApiResponse({ status: 200, type: SupervisionResponseDto })
  cancel(@Param('id') id: string) {
    return this.supervisionsService.cancel(id);
  }

  @Post('remind')
  @ApiOperation({ summary: '发送提醒消息' })
  @ApiResponse({ status: 201, type: SupervisionMessageResponseDto })
  sendRemind(
    @CurrentUser() user: JwtPayload,
    @Body() remindDto: RemindDto,
  ) {
    const { userId, message, type } = remindDto;
    // 当前用户是发送者，userId 是接收者
    return this.supervisionsService.sendRemind(user.userId, userId, message, type as any);
  }

  @Get('messages')
  @ApiOperation({ summary: '获取我的监督消息列表' })
  @ApiResponse({ status: 200, type: [SupervisionMessageResponseDto] })
  getMessages(@CurrentUser() user: JwtPayload) {
    return this.supervisionsService.getMessages(user.userId);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: '标记消息为已读' })
  @ApiResponse({ status: 200, type: SupervisionMessageResponseDto })
  markAsRead(@Param('id') id: string) {
    return this.supervisionsService.markMessageAsRead(id);
  }
}
