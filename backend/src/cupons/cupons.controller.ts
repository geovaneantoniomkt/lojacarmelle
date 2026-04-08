import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CuponsService } from './cupons.service';
import { CreateCupomDto } from './dto/create-cupom.dto';

@ApiTags('cupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cupons')
export class CuponsController {
  constructor(private readonly cuponsService: CuponsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cupom' })
  create(@Body() dto: CreateCupomDto, @CurrentUser() user: Usuario) {
    return this.cuponsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cupons' })
  findAll() {
    return this.cuponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cupom por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuponsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cupom' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCupomDto>,
  ) {
    return this.cuponsService.update(id, dto);
  }

  @Get(':codigo/validar')
  @ApiOperation({ summary: 'Validar cupom por código' })
  @ApiQuery({ name: 'clienteId', required: true })
  @ApiQuery({ name: 'subtotal', required: true, type: Number })
  validar(
    @Param('codigo') codigo: string,
    @Query('clienteId') clienteId: string,
    @Query('subtotal') subtotal: string,
  ) {
    return this.cuponsService.validar(codigo, clienteId, parseFloat(subtotal));
  }
}
