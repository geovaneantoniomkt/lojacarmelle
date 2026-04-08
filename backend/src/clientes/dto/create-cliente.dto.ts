import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrigemCadastro } from '../entities/cliente.entity';

export class CreateClienteDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @MaxLength(150)
  nomeCompleto: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: 'maria@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bairro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  endereco?: string;

  @ApiPropertyOptional({ example: '@mariasilva' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  instagram?: string;

  @ApiPropertyOptional({ enum: OrigemCadastro, default: OrigemCadastro.LOJA })
  @IsOptional()
  @IsEnum(OrigemCadastro)
  origemCadastro?: OrigemCadastro;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  consentimentoEmail?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  consentimentoWhatsapp?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  indicadoPorId?: string;

  @ApiPropertyOptional({ description: 'CPF em texto plano (será criptografado)' })
  @IsOptional()
  @IsString()
  cpf?: string;
}
