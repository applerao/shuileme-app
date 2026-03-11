import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum CheckinStatus {
  COMPLETED = 'completed',
  MISSED = 'missed',
  PENDING = 'pending',
}

@Entity('checkins')
@Unique(['user', 'checkinDate'])
export class Checkin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.checkins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'date' })
  checkinDate: Date;

  @Column({ type: 'time', nullable: true })
  checkinTime: string;

  @Column({
    type: 'enum',
    enum: CheckinStatus,
    default: CheckinStatus.PENDING,
  })
  status: CheckinStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'int', default: 0 })
  sleepQuality: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  supervisedBy: string;
}
