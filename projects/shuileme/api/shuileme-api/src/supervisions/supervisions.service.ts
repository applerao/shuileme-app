import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supervision, SupervisionStatus } from './supervision.entity';
import { SupervisionMessage, MessageType } from './supervision-message.entity';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupervisionsService {
  constructor(
    @InjectRepository(Supervision)
    private supervisionsRepository: Repository<Supervision>,
    @InjectRepository(SupervisionMessage)
    private supervisionMessagesRepository: Repository<SupervisionMessage>,
    private usersService: UsersService,
  ) {}

  async create(
    supervisorId: string,
    createSupervisionDto: CreateSupervisionDto,
  ): Promise<Supervision> {
    const { superviseeId, message } = createSupervisionDto;

    // Validate users exist
    const supervisor = await this.usersService.findOne(supervisorId);
    const supervisee = await this.usersService.findOne(superviseeId);

    if (supervisorId === superviseeId) {
      throw new BadRequestException('Cannot supervise yourself');
    }

    // Check if relationship already exists
    const existing = await this.supervisionsRepository.findOne({
      where: [
        { supervisor: { id: supervisorId }, supervisee: { id: superviseeId } },
        { supervisor: { id: superviseeId }, supervisee: { id: supervisorId } },
      ],
    });

    if (existing) {
      throw new ConflictException('Supervision relationship already exists');
    }

    const supervision = this.supervisionsRepository.create({
      supervisor: { id: supervisorId },
      supervisorId,
      supervisee: { id: superviseeId },
      superviseeId,
      message,
      status: SupervisionStatus.PENDING,
    });

    return this.supervisionsRepository.save(supervision);
  }

  async approve(id: string): Promise<Supervision> {
    const supervision = await this.findOne(id);

    if (supervision.status !== SupervisionStatus.PENDING) {
      throw new BadRequestException('Only pending supervisions can be approved');
    }

    supervision.status = SupervisionStatus.ACTIVE;
    supervision.approvedAt = new Date();
    return this.supervisionsRepository.save(supervision);
  }

  async reject(id: string): Promise<Supervision> {
    const supervision = await this.findOne(id);

    if (supervision.status !== SupervisionStatus.PENDING) {
      throw new BadRequestException('Only pending supervisions can be rejected');
    }

    supervision.status = SupervisionStatus.REJECTED;
    supervision.rejectedAt = new Date();
    return this.supervisionsRepository.save(supervision);
  }

  async cancel(id: string): Promise<Supervision> {
    const supervision = await this.findOne(id);

    if (supervision.status !== SupervisionStatus.ACTIVE) {
      throw new BadRequestException('Only active supervisions can be cancelled');
    }

    supervision.status = SupervisionStatus.CANCELLED;
    return this.supervisionsRepository.save(supervision);
  }

  async findAllByUser(userId: string, role?: 'supervisor' | 'supervisee'): Promise<Supervision[]> {
    const where: any = {};

    if (role === 'supervisor') {
      where.supervisor = { id: userId };
    } else if (role === 'supervisee') {
      where.supervisee = { id: userId };
    } else {
      where.supervisor = { id: userId };
      const asSupervisor = await this.supervisionsRepository.find({ where });
      where.supervisee = { id: userId };
      const asSupervisee = await this.supervisionsRepository.find({ where });
      return [...asSupervisor, ...asSupervisee];
    }

    return this.supervisionsRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Supervision> {
    const supervision = await this.supervisionsRepository.findOne({ where: { id } });
    if (!supervision) {
      throw new NotFoundException(`Supervision with ID ${id} not found`);
    }
    return supervision;
  }

  async getActiveSupervisions(userId: string): Promise<Supervision[]> {
    return this.supervisionsRepository.find({
      where: [
        { supervisor: { id: userId }, status: SupervisionStatus.ACTIVE },
        { supervisee: { id: userId }, status: SupervisionStatus.ACTIVE },
      ],
    });
  }

  /**
   * 添加监督者 - 创建监督关系
   */
  async addSupervisor(userId: string, supervisorId: string): Promise<Supervision> {
    // Validate users exist
    const user = await this.usersService.findOne(userId);
    const supervisor = await this.usersService.findOne(supervisorId);

    if (userId === supervisorId) {
      throw new BadRequestException('Cannot supervise yourself');
    }

    // Check if relationship already exists
    const existing = await this.supervisionsRepository.findOne({
      where: [
        { supervisor: { id: supervisorId }, supervisee: { id: userId } },
        { supervisor: { id: userId }, supervisee: { id: supervisorId } },
      ],
    });

    if (existing) {
      throw new ConflictException('Supervision relationship already exists');
    }

    const supervision = this.supervisionsRepository.create({
      supervisor: { id: supervisorId },
      supervisorId,
      supervisee: { id: userId },
      superviseeId: userId,
      status: SupervisionStatus.PENDING,
    });

    return this.supervisionsRepository.save(supervision);
  }

  /**
   * 获取监督关系列表 - 返回监督者和被监督者列表
   */
  async getSupervisionList(userId: string): Promise<{
    supervisors: Supervision[];
    supervisees: Supervision[];
  }> {
    // 获取我的监督者（我作为被监督者）
    const supervisors = await this.supervisionsRepository.find({
      where: { supervisee: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    // 获取我的被监督者（我作为监督者）
    const supervisees = await this.supervisionsRepository.find({
      where: { supervisor: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return { supervisors, supervisees };
  }

  /**
   * 发送提醒消息
   */
  async sendRemind(
    senderId: string,
    receiverId: string,
    message: string,
    type: MessageType = MessageType.REMIND,
  ): Promise<SupervisionMessage> {
    // Validate users exist
    const sender = await this.usersService.findOne(senderId);
    const receiver = await this.usersService.findOne(receiverId);

    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    // Check if there's an active supervision relationship
    const supervision = await this.supervisionsRepository.findOne({
      where: [
        {
          supervisor: { id: senderId },
          supervisee: { id: receiverId },
          status: SupervisionStatus.ACTIVE,
        },
        {
          supervisor: { id: receiverId },
          supervisee: { id: senderId },
          status: SupervisionStatus.ACTIVE,
        },
      ],
    });

    if (!supervision) {
      throw new BadRequestException('No active supervision relationship found');
    }

    const supervisionMessage = this.supervisionMessagesRepository.create({
      supervision: { id: supervision.id },
      supervisionId: supervision.id,
      sender: { id: senderId },
      senderId,
      receiver: { id: receiverId },
      receiverId,
      type,
      message,
      isRead: false,
    });

    return this.supervisionMessagesRepository.save(supervisionMessage);
  }

  /**
   * 获取用户的监督消息列表
   */
  async getMessages(userId: string): Promise<SupervisionMessage[]> {
    return this.supervisionMessagesRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 标记消息为已读
   */
  async markMessageAsRead(messageId: string): Promise<SupervisionMessage> {
    const message = await this.supervisionMessagesRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    message.isRead = true;
    return this.supervisionMessagesRepository.save(message);
  }
}
