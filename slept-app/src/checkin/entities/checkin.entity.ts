import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('checkins')
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['bedtime', 'wakeup'],
  })
  type: 'bedtime' | 'wakeup';

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ nullable: true })
  quality?: number; // 1-5 stars, only for wakeup

  @CreateDateColumn()
  createdAt: Date;
}
