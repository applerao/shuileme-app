import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WechatService } from './wechat.service';

@Module({
  imports: [HttpModule],
  providers: [WechatService],
  exports: [WechatService],
})
export class WechatModule {}
