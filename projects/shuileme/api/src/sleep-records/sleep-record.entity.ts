import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('sleep_records')
export class SleepRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sleepRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'timestamp' })
  bedtime: Date;

  @Column({ type: 'timestamp' })
  wakeTime: Date;

  @Column({ type: 'int' })
  sleepDuration: number; // in minutes

  @Column({ type: 'int', nullable: true })
  deepSleepDuration: number; // in minutes

  @Column({ type: 'int', nullable: true })
  lightSleepDuration: number; // in minutes

  @Column({ type: 'int', nullable: true })
  awakeDuration: number; // in minutes

  @Column({ type: 'int', default: 0 })
  sleepQuality: number; // 1-10

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'date' })
  recordDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
