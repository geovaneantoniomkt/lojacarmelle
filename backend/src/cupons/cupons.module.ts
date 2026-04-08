import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cupom } from './entities/cupom.entity';
import { CuponsController } from './cupons.controller';
import { CuponsService } from './cupons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cupom])],
  controllers: [CuponsController],
  providers: [CuponsService],
  exports: [CuponsService],
})
export class CuponsModule {}
