import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

@Injectable()
export class WechatService {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.appId = this.configService.get<string>('WECHAT_APP_ID', '');
    this.appSecret = this.configService.get<string>('WECHAT_APP_SECRET', '');
  }

  /**
   * Exchange WeChat auth code for openid and session_key
   */
  async getOpenid(code: string): Promise<{ openid: string; sessionKey: string }> {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.errcode) {
        throw new BadRequestException(`WeChat API error: ${data.errmsg}`);
      }

      return {
        openid: data.openid,
        sessionKey: data.session_key,
      };
    } catch (error) {
      if (error.response?.data?.errcode) {
        throw new BadRequestException(`WeChat API error: ${error.response.data.errmsg}`);
      }
      throw new BadRequestException('Failed to exchange WeChat code');
    }
  }

  /**
   * Get WeChat user info using access token
   */
  async getUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo> {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.errcode) {
        throw new BadRequestException(`WeChat API error: ${data.errmsg}`);
      }

      return data;
    } catch (error) {
      if (error.response?.data?.errcode) {
        throw new BadRequestException(`WeChat API error: ${error.response.data.errmsg}`);
      }
      throw new BadRequestException('Failed to get WeChat user info');
    }
  }

  /**
   * Verify WeChat auth code and get user info
   */
  async verifyAndUserInfo(code: string): Promise<WechatUserInfo> {
    // For mini-program login, use jscode2session
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.errcode) {
        throw new BadRequestException(`WeChat API error: ${data.errmsg}`);
      }

      // Return basic info - for mini-program, we get openid and session_key
      // User profile needs to be obtained separately via button click
      return {
        openid: data.openid,
        nickname: '',
        sex: 0,
        province: '',
        city: '',
        country: '',
        headimgurl: '',
        privilege: [],
        unionid: data.unionid,
      };
    } catch (error) {
      if (error.response?.data?.errcode) {
        throw new BadRequestException(`WeChat API error: ${error.response.data.errmsg}`);
      }
      throw new BadRequestException('Failed to verify WeChat code');
    }
  }
}
