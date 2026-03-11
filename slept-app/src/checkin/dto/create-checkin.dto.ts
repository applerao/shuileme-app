import { IsString, IsNumber, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class BedtimeCheckinDto {
  @IsString()
  userId: string;

  @IsDateString()
  timestamp: string;
}

export class WakeupCheckinDto {
  @IsString()
  userId: string;

  @IsDateString()
  timestamp: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  quality?: number;
}

export class QueryRecordsDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class QueryStatsDto {
  @IsString()
  userId: string;
}
