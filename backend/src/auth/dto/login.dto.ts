import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'minhasenha123' })
  @IsString()
  @MinLength(1)
  senha: string;
}
