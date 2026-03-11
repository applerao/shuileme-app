import { ApiProperty } from '@nestjs/swagger';
import { SupervisionResponseDto } from './supervision-response.dto';

export class SupervisionListResponseDto {
  @ApiProperty({ type: [SupervisionResponseDto], description: '我的监督者列表' })
  supervisors: SupervisionResponseDto[];

  @ApiProperty({ type: [SupervisionResponseDto], description: '我的被监督者列表' })
  supervisees: SupervisionResponseDto[];
}
