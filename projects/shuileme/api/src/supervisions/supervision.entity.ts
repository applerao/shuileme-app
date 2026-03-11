import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { SupervisionMessage } from './supervision-message.entity';

export enum SupervisionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('supervisions')
@Unique(['supervisor', 'supervisee'])
export class Supervision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.supervisedRelations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User;

  @Column()
  supervisorId: string;

  @ManyToOne(() => User, (user) => user.superviseeRelations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supervisee_id' })
  supervisee: User;

  @Column()
  superviseeId: string;

  @Column({
    type: 'enum',
    enum: SupervisionStatus,
    default: SupervisionStatus.PENDING,
  })
  status: SupervisionStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectedAt: Date;

  @OneToMany(() => SupervisionMessage, (message) => message.supervision)
  messages: SupervisionMessage[];
}
