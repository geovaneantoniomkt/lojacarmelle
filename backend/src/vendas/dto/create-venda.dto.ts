import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FormaPagamento } from '../entities/venda.entity';

export class CreateItemVendaDto {
  @ApiProperty({ example: 'Vestido Floral P' })
  @IsString()
  @MaxLength(200)
  produto: string;

  @ApiPropertyOptional({ example: 'vestidos' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoria?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiProperty({ example: 159.9 })
  @IsNumber()
  @Min(0.01)
  valorUnitario: number;
}

export class CreateVendaDto {
  @ApiProperty()
  @IsUUID()
  clienteId: string;

  @ApiPropertyOptional({ description: 'Código do cupom (não ID)' })
  @IsOptional()
  @IsString()
  codigoCupom?: string;

  @ApiProperty({ enum: FormaPagamento })
  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  parcelas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ type: [CreateItemVendaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens: CreateItemVendaDto[];
}
