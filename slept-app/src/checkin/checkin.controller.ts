import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { BedtimeCheckinDto, WakeupCheckinDto, QueryRecordsDto, QueryStatsDto } from './dto/create-checkin.dto';
import {
  BedtimeCheckinResponseDto,
  WakeupCheckinResponseDto,
  CheckinRecordDto,
  CheckinStatsDto,
} from './dto/checkin-response.dto';

@Controller('api/checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('bedtime')
  @HttpCode(HttpStatus.OK)
  async bedtimeCheckin(
    @Body() dto: BedtimeCheckinDto,
  ): Promise<BedtimeCheckinResponseDto> {
    return this.checkinService.bedtimeCheckin(dto);
  }

  @Post('wakeup')
  @HttpCode(HttpStatus.OK)
  async wakeupCheckin(
    @Body() dto: WakeupCheckinDto,
  ): Promise<WakeupCheckinResponseDto> {
    return this.checkinService.wakeupCheckin(dto);
  }

  @Get('records')
  async getRecords(
    @Query() query: QueryRecordsDto,
  ): Promise<CheckinRecordDto[]> {
    return this.checkinService.getRecords(query.userId, query.date);
  }

  @Get('stats')
  async getStats(
    @Query() query: QueryStatsDto,
  ): Promise<CheckinStatsDto> {
    return this.checkinService.getStats(query.userId);
  }
}
