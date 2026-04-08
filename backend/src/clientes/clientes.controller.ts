import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PerfilUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { QueryClientesDto } from './dto/query-clientes.dto';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar nova cliente' })
  create(@Body() dto: CreateClienteDto, @CurrentUser() user: Usuario) {
    return this.clientesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes com filtros e paginação' })
  findAll(@Query() query: QueryClientesDto) {
    return this.clientesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Histórico de compras da cliente' })
  historico(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.historico(id);
  }

  @Get(':id/pontos')
  @ApiOperation({ summary: 'Extrato de pontos da cliente' })
  extratoPontos(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.extratoPontos(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados da cliente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateClienteDto>,
  ) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(PerfilUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover cliente (apenas admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }
}
