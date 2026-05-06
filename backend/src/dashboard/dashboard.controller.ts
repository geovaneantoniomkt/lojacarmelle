import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs gerais da loja' })
  kpis() { return this.dashboardService.kpis(); }

  @Get('vendas-por-mes')
  @ApiOperation({ summary: 'Vendas agrupadas por mês (12 meses)' })
  vendasPorMes() { return this.dashboardService.vendasPorMes(); }

  @Get('top-categorias')
  @ApiOperation({ summary: 'Categorias mais vendidas' })
  topCategorias() { return this.dashboardService.topCategorias(); }

  @Get('clientes-novos')
  @ApiOperation({ summary: 'Novos clientes por mês (6 meses)' })
  clientesNovos() { return this.dashboardService.clientesNovos(); }
}
