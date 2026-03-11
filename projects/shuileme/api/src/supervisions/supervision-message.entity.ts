import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Supervision } from './supervision.entity';

export enum MessageType {
  REMIND = 'remind',
  ENCOURAGE = 'encourage',
  CUSTOM = 'custom',
}

@Entity('supervision_messages')
export class SupervisionMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supervision, (supervision) => supervision.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supervision_id' })
  supervision: Supervision;

  @Column()
  supervisionId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column()
  receiverId: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.CUSTOM,
  })
  type: MessageType;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
