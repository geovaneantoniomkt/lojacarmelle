import { IsInt, IsString, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResgatarPontosDto {
  @ApiProperty()
  @IsUUID()
  clienteId: string;

  @ApiProperty({ example: 100, description: 'Quantidade de pontos a resgatar' })
  @IsInt()
  @Min(1)
  pontos: number;

  @ApiPropertyOptional({ example: 'Resgate por cupom de desconto' })
  @IsOptional()
  @IsString()
  descricao?: string;
}
