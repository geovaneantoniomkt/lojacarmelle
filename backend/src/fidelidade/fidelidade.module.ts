import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtratoPontos } from './entities/extrato-pontos.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { FidelidadeService } from './fidelidade.service';
import { FidelidadeController } from './fidelidade.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExtratoPontos, Cliente])],
  controllers: [FidelidadeController],
  providers: [FidelidadeService],
  exports: [FidelidadeService],
})
export class FidelidadeModule {}
