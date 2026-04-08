import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './entities/venda.entity';
import { ItemVenda } from './entities/item-venda.entity';
import { ExtratoPontos } from '../fidelidade/entities/extrato-pontos.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { VendasController } from './vendas.controller';
import { VendasService } from './vendas.service';
import { CuponsModule } from '../cupons/cupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venda, ItemVenda, ExtratoPontos, Cliente]),
    CuponsModule,
  ],
  controllers: [VendasController],
  providers: [VendasService],
  exports: [VendasService],
})
export class VendasModule {}
