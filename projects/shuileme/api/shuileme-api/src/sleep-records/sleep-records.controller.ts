import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SleepRecordsService } from './sleep-records.service';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';
import { SleepRecordResponseDto } from './dto/sleep-record-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('sleep-records')
@Controller('sleep-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SleepRecordsController {
  constructor(private readonly sleepRecordsService: SleepRecordsService) {}

  @Post()
  @ApiOperation({ summary: '创建睡眠记录' })
  @ApiResponse({ status: 201, type: SleepRecordResponseDto })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createSleepRecordDto: CreateSleepRecordDto,
  ) {
    return this.sleepRecordsService.create(user.sub, createSleepRecordDto);
  }

  @Get()
  @ApiOperation({ summary: '获取睡眠记录列表' })
  @ApiResponse({ status: 200, type: [SleepRecordResponseDto] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.sleepRecordsService.findAll(
      user.sub,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: '获取睡眠统计' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStats(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    return this.sleepRecordsService.getStats(user.sub, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取睡眠记录' })
  @ApiResponse({ status: 200, type: SleepRecordResponseDto })
  findOne(@Param('id') id: string) {
    return this.sleepRecordsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新睡眠记录' })
  @ApiResponse({ status: 200, type: SleepRecordResponseDto })
  update(@Param('id') id: string, @Body() updates: Partial<SleepRecordResponseDto>) {
    return this.sleepRecordsService.update(id, updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除睡眠记录' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.sleepRecordsService.remove(id);
  }
}
