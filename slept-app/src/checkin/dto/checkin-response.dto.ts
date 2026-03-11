export class BedtimeCheckinResponseDto {
  success: boolean;
  streakDays: number;
}

export class WakeupCheckinResponseDto {
  success: boolean;
  sleepDuration: number; // in milliseconds
}

export class CheckinRecordDto {
  id: number;
  type: 'bedtime' | 'wakeup';
  timestamp: Date;
  quality?: number;
  createdAt: Date;
}

export class CheckinStatsDto {
  avgBedtime: string; // HH:mm format
  avgWakeup: string; // HH:mm format
  streakDays: number;
  score: number; // 0-100
}
