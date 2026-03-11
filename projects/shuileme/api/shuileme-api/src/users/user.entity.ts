import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Checkin } from '../checkins/checkin.entity';
import { Supervision } from '../supervisions/supervision.entity';
import { SupervisionMessage } from '../supervisions/supervision-message.entity';
import { Achievement } from '../achievements/achievement.entity';
import { SleepRecord } from '../sleep-records/sleep-record.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column({ length: 255, select: false, nullable: true })
  password: string;

  @Column({ length: 100, nullable: true })
  nickname: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ length: 100, unique: true, nullable: true })
  wechatId: string;

  @Column({ default: 0 })
  totalCheckinDays: number;

  @Column({ default: 0 })
  continuousCheckinDays: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastCheckinDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Checkin, (checkin) => checkin.user)
  checkins: Checkin[];

  @OneToMany(() => Supervision, (supervision) => supervision.supervisor)
  supervisedRelations: Supervision[];

  @OneToMany(() => Supervision, (supervision) => supervision.supervisee)
  superviseeRelations: Supervision[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];

  @OneToMany(() => SleepRecord, (sleepRecord) => sleepRecord.user)
  sleepRecords: SleepRecord[];

  @OneToMany(() => SupervisionMessage, (message) => message.sender)
  sentMessages: SupervisionMessage[];

  @OneToMany(() => SupervisionMessage, (message) => message.receiver)
  receivedMessages: SupervisionMessage[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
  }
}
