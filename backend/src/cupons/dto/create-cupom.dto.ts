import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDesconto } from '../entities/cupom.entity';

export class CreateCupomDto {
  @ApiProperty({ example: 'VERAO20' })
  @IsString()
  @MaxLength(30)
  codigo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descricao?: string;

  @ApiProperty({ enum: TipoDesconto })
  @IsEnum(TipoDesconto)
  tipoDesconto: TipoDesconto;

  @ApiProperty({ example: 20, description: '% ou R$ fixo' })
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  validoDe?: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  validoAte: string;

  @ApiPropertyOptional({ description: 'null = sem limite' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limiteUsoTotal?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limiteUsoPorCliente?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campanhaId?: string;
}
