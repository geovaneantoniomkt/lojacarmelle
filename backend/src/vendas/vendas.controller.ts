import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { QueryVendasDto } from './dto/query-vendas.dto';

@ApiTags('vendas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nova venda com itens' })
  create(@Body() dto: CreateVendaDto, @CurrentUser() user: Usuario) {
    return this.vendasService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vendas com filtros' })
  findAll(@Query() query: QueryVendasDto) {
    return this.vendasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar venda por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendasService.findOne(id);
  }
}
