import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Checkin } from './checkin.entity';

@Entity('sleep_records')
export class SleepRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'timestamp' })
  bedtime: Date;

  @Column({ type: 'timestamp' })
  wakeupTime: Date;

  @Column()
  duration: number; // in milliseconds

  @Column({ nullable: true })
  quality?: number; // 1-5 stars

  @CreateDateColumn()
  createdAt: Date;
}
