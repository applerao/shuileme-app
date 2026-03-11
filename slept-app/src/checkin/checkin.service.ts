import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Checkin } from './entities/checkin.entity';
import { SleepRecord } from './entities/sleep-record.entity';
import { BedtimeCheckinDto, WakeupCheckinDto } from './dto/create-checkin.dto';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private checkinRepository: Repository<Checkin>,
    @InjectRepository(SleepRecord)
    private sleepRecordRepository: Repository<SleepRecord>,
  ) {}

  async bedtimeCheckin(dto: BedtimeCheckinDto) {
    const checkin = this.checkinRepository.create({
      userId: dto.userId,
      type: 'bedtime',
      timestamp: new Date(dto.timestamp),
    });

    await this.checkinRepository.save(checkin);

    const streakDays = await this.calculateStreak(dto.userId, 'bedtime');

    return {
      success: true,
      streakDays,
    };
  }

  async wakeupCheckin(dto: WakeupCheckinDto) {
    const wakeupTime = new Date(dto.timestamp);
    
    const checkin = this.checkinRepository.create({
      userId: dto.userId,
      type: 'wakeup',
      timestamp: wakeupTime,
      quality: dto.quality,
    });

    await this.checkinRepository.save(checkin);

    // Find the most recent bedtime checkin before this wakeup
    const lastBedtime = await this.checkinRepository.findOne({
      where: {
        userId: dto.userId,
        type: 'bedtime',
        timestamp: LessThan(wakeupTime),
      },
      order: { timestamp: 'DESC' },
    });

    let sleepDuration = 0;
    
    if (lastBedtime) {
      sleepDuration = wakeupTime.getTime() - lastBedtime.timestamp.getTime();

      // Create sleep record
      const sleepRecord = this.sleepRecordRepository.create({
        userId: dto.userId,
        bedtime: lastBedtime.timestamp,
        wakeupTime,
        duration: sleepDuration,
        quality: dto.quality,
      });

      await this.sleepRecordRepository.save(sleepRecord);
    }

    return {
      success: true,
      sleepDuration,
    };
  }

  async getRecords(userId: string, date?: string) {
    let whereClause: any = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.timestamp = Between(startOfDay, endOfDay);
    }

    const records = await this.checkinRepository.find({
      where: whereClause,
      order: { timestamp: 'DESC' },
    });

    return records.map(record => ({
      id: record.id,
      type: record.type,
      timestamp: record.timestamp,
      quality: record.quality,
      createdAt: record.createdAt,
    }));
  }

  async getStats(userId: string) {
    const records = await this.checkinRepository.find({
      where: { userId },
      order: { timestamp: 'ASC' },
    });

    const bedtimes = records
      .filter(r => r.type === 'bedtime')
      .map(r => new Date(r.timestamp));

    const wakeups = records
      .filter(r => r.type === 'wakeup')
      .map(r => new Date(r.timestamp));

    // Calculate average bedtime
    const avgBedtime = this.calculateAverageTime(bedtimes);
    
    // Calculate average wakeup time
    const avgWakeup = this.calculateAverageTime(wakeups);

    // Calculate streak
    const streakDays = await this.calculateStreak(userId, 'bedtime');

    // Calculate score (based on consistency and sleep quality)
    const score = this.calculateScore(bedtimes, wakeups);

    return {
      avgBedtime,
      avgWakeup,
      streakDays,
      score,
    };
  }

  private async calculateStreak(userId: string, type: 'bedtime' | 'wakeup'): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const checkin = await this.checkinRepository.findOne({
        where: {
          userId,
          type,
          timestamp: Between(startOfDay, endOfDay),
        },
      });

      if (!checkin) {
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private calculateAverageTime(dates: Date[]): string {
    if (dates.length === 0) return '00:00';

    const totalMinutes = dates.reduce((sum, date) => {
      return sum + date.getHours() * 60 + date.getMinutes();
    }, 0);

    const avgMinutes = Math.round(totalMinutes / dates.length);
    const hours = Math.floor(avgMinutes / 60) % 24;
    const minutes = avgMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private calculateScore(bedtimes: Date[], wakeups: Date[]): number {
    if (bedtimes.length === 0 || wakeups.length === 0) return 0;

    let score = 100;

    // Penalize for inconsistency in bedtime (standard deviation)
    const bedtimeVariance = this.calculateVariance(bedtimes);
    if (bedtimeVariance > 120) score -= 20; // More than 2 hours variance
    else if (bedtimeVariance > 60) score -= 10; // More than 1 hour variance

    // Penalize for inconsistency in wakeup time
    const wakeupVariance = this.calculateVariance(wakeups);
    if (wakeupVariance > 120) score -= 20;
    else if (wakeupVariance > 60) score -= 10;

    // Bonus for good sleep duration (7-9 hours)
    const avgDuration = this.calculateAverageDuration(bedtimes, wakeups);
    const avgHours = avgDuration / (1000 * 60 * 60);
    if (avgHours >= 7 && avgHours <= 9) score += 10;
    else if (avgHours < 6 || avgHours > 10) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateVariance(dates: Date[]): number {
    if (dates.length < 2) return 0;

    const mean = dates.reduce((sum, date) => {
      return sum + (date.getHours() * 60 + date.getMinutes());
    }, 0) / dates.length;

    const variance = dates.reduce((sum, date) => {
      const minutes = date.getHours() * 60 + date.getMinutes();
      return sum + Math.pow(minutes - mean, 2);
    }, 0) / dates.length;

    return Math.sqrt(variance);
  }

  private calculateAverageDuration(bedtimes: Date[], wakeups: Date[]): number {
    if (bedtimes.length === 0 || wakeups.length === 0) return 0;

    let totalDuration = 0;
    let count = 0;

    for (const wakeup of wakeups) {
      const bedtime = bedtimes
        .filter(b => b < wakeup)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      if (bedtime) {
        totalDuration += wakeup.getTime() - bedtime.getTime();
        count++;
      }
    }

    return count > 0 ? totalDuration / count : 0;
  }
}
