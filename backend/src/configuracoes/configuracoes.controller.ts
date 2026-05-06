import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PerfilUsuario } from '../usuarios/entities/usuario.entity';
import { ConfiguracoesService } from './configuracoes.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@ApiTags('configuracoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  @ApiOperation({ summary: 'Obter configurações da loja' })
  findOne() { return this.configuracoesService.findOne(); }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(PerfilUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar configurações (admin)' })
  update(@Body() dto: UpdateConfiguracaoDto) { return this.configuracoesService.update(dto); }
}
