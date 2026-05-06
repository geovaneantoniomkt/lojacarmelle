import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FidelidadeService } from './fidelidade.service';
import { ResgatarPontosDto } from './dto/resgatar-pontos.dto';

@ApiTags('fidelidade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fidelidade')
export class FidelidadeController {
  constructor(private readonly fidelidadeService: FidelidadeService) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Ranking de clientes por pontos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  ranking(@Query('limit') limit?: string) {
    return this.fidelidadeService.ranking(limit ? parseInt(limit) : 10);
  }

  @Get('extrato/:clienteId')
  @ApiOperation({ summary: 'Extrato de pontos de uma cliente' })
  extrato(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.fidelidadeService.extrato(clienteId);
  }

  @Post('resgatar')
  @ApiOperation({ summary: 'Resgatar pontos de uma cliente' })
  resgatar(@Body() dto: ResgatarPontosDto) {
    return this.fidelidadeService.resgatar(dto);
  }
}
