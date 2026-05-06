import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PerfilUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Ana Vendedora' })
  @IsString()
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: 'ana@loja.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ enum: PerfilUsuario, default: PerfilUsuario.VENDEDORA })
  @IsOptional()
  @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
