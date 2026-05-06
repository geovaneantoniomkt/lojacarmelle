import { Controller, Get, Patch, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AlertasService } from './alertas.service';

@ApiTags('alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas' })
  @ApiQuery({ name: 'naoLidos', required: false, type: Boolean })
  findAll(@Query('naoLidos') naoLidos?: string) {
    return this.alertasService.findAll(naoLidos === 'true');
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar alertas não lidos' })
  async count() {
    const total = await this.alertasService.contarNaoLidos();
    return { total };
  }

  @Patch(':id/lido')
  @ApiOperation({ summary: 'Marcar alerta como lido' })
  marcarLido(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: Usuario) {
    return this.alertasService.marcarLido(id, user.id);
  }

  @Patch('marcar-todos-lidos')
  @ApiOperation({ summary: 'Marcar todos alertas como lidos' })
  marcarTodosLidos(@CurrentUser() user: Usuario) {
    return this.alertasService.marcarTodosLidos(user.id);
  }
}
