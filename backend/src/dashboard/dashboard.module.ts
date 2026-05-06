import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Venda } from '../vendas/entities/venda.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Venda])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
