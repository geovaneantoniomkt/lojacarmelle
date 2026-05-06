import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { CuponsModule } from './cupons/cupons.module';
import { VendasModule } from './vendas/vendas.module';
import { FidelidadeModule } from './fidelidade/fidelidade.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { CampanhasModule } from './campanhas/campanhas.module';
import { AlertasModule } from './alertas/alertas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database')!,
    }),
    AuthModule,
    UsuariosModule,
    ClientesModule,
    CuponsModule,
    VendasModule,
    FidelidadeModule,
    DashboardModule,
    ConfiguracoesModule,
    CampanhasModule,
    AlertasModule,
  ],
})
export class AppModule {}
