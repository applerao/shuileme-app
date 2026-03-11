import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray } from 'class-validator';
import { Platform } from '../entities/push-token.entity';

export enum PushType {
  SINGLE = 'single',
  BATCH = 'batch',
  ALL = 'all',
}

export class SendPushDto {
  @IsEnum(PushType)
  @IsNotEmpty()
  type: PushType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsString()
  deviceToken?: string;

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsObject()
  extras?: Record<string, any>;

  @IsOptional()
  @IsString()
  templateId?: string;
}

export class RegisterPushTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @IsEnum(Platform)
  @IsNotEmpty()
  platform: Platform;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;
}

export class UnregisterPushTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}

export class PushTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsObject()
  @IsNotEmpty()
  variables: Record<string, any>;
}
