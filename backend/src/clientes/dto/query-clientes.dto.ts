import { IsOptional, IsEnum, IsNumberString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusCliente, NivelFidelidade } from '../entities/cliente.entity';

export class QueryClientesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ description: 'Busca por nome, telefone ou e-mail' })
  @IsOptional()
  @IsString()
  busca?: string;

  @ApiPropertyOptional({ enum: StatusCliente })
  @IsOptional()
  @IsEnum(StatusCliente)
  status?: StatusCliente;

  @ApiPropertyOptional({ enum: NivelFidelidade })
  @IsOptional()
  @IsEnum(NivelFidelidade)
  nivel?: NivelFidelidade;
}
