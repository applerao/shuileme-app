import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCode, VerificationCodeType } from './verification-code.entity';

@Injectable()
export class VerificationCodesService {
  constructor(
    @InjectRepository(VerificationCode)
    private verificationCodesRepository: Repository<VerificationCode>,
  ) {}

  /**
   * Generate a 6-digit verification code
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and send verification code
   */
  async createAndSend(
    phone: string,
    type: VerificationCodeType = VerificationCodeType.REGISTER,
  ): Promise<void> {
    // Invalidate previous unused codes for this phone
    await this.verificationCodesRepository.update(
      { phone, used: false },
      { used: true },
    );

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const verificationCode = this.verificationCodesRepository.create({
      phone,
      code,
      type,
      expiresAt,
    });

    await this.verificationCodesRepository.save(verificationCode);

    // TODO: Integrate with SMS provider (Aliyun SMS, Tencent SMS, etc.)
    console.log(`[SMS] Sending verification code ${code} to ${phone}`);
    // await this.smsService.send(phone, code);
  }

  /**
   * Verify the code
   */
  async verify(
    phone: string,
    code: string,
    type: VerificationCodeType = VerificationCodeType.REGISTER,
  ): Promise<boolean> {
    const verificationCode = await this.verificationCodesRepository.findOne({
      where: {
        phone,
        code,
        type,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      return false;
    }

    if (verificationCode.expiresAt < new Date()) {
      return false;
    }

    // Mark as used
    verificationCode.used = true;
    await this.verificationCodesRepository.save(verificationCode);

    return true;
  }

  /**
   * Clean up expired codes
   */
  async cleanupExpiredCodes(): Promise<void> {
    await this.verificationCodesRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
