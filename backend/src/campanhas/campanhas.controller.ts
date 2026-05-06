import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PerfilUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { CampanhasService } from './campanhas.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';

@ApiTags('campanhas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campanhas')
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar campanha' })
  create(@Body() dto: CreateCampanhaDto, @CurrentUser() user: Usuario) {
    return this.campanhasService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campanhas' })
  findAll() { return this.campanhasService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar campanha por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.campanhasService.findOne(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar campanha' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCampanhaDto>) {
    return this.campanhasService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiOperation({ summary: 'Remover campanha' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.campanhasService.remove(id); }
}
