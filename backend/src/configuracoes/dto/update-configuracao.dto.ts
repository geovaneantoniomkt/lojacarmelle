import { IsString, IsNumber, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfiguracaoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) nomeLoja?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0.01) pontosPorReal?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) ptsNivelPrata?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) ptsNivelOuro?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) ptsNivelVip?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) diasInatividadeAlerta?: number;
}
