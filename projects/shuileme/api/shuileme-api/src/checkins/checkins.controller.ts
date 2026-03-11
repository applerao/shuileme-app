import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { CheckinResponseDto } from './dto/checkin-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('checkins')
@Controller('checkins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post()
  @ApiOperation({ summary: '创建打卡记录' })
  @ApiResponse({ status: 201, type: CheckinResponseDto })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createCheckinDto: CreateCheckinDto,
  ) {
    return this.checkinsService.create(user.sub, createCheckinDto);
  }

  @Get()
  @ApiOperation({ summary: '获取打卡记录列表' })
  @ApiResponse({ status: 200, type: [CheckinResponseDto] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.checkinsService.findAll(
      user.sub,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: '获取打卡统计' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStats(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    return this.checkinsService.getStats(user.sub, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取打卡记录' })
  @ApiResponse({ status: 200, type: CheckinResponseDto })
  findOne(@Param('id') id: string) {
    return this.checkinsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除打卡记录' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.checkinsService.remove(id);
  }
}
