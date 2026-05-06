import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtratoPontos } from './entities/extrato-pontos.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ResgatarPontosDto } from './dto/resgatar-pontos.dto';

@Injectable()
export class FidelidadeService {
  constructor(
    @InjectRepository(ExtratoPontos)
    private readonly extratoRepo: Repository<ExtratoPontos>,
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
  ) {}

  async extrato(clienteId: string) {
    const cliente = await this.clientesRepo.findOne({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const registros = await this.extratoRepo.find({
      where: { clienteId },
      order: { criadoEm: 'DESC' },
      take: 100,
    });

    return {
      cliente: {
        id: cliente.id,
        nome: cliente.nomeCompleto,
        pontosAcumulados: cliente.pontosAcumulados,
        nivelFidelidade: cliente.nivelFidelidade,
      },
      extrato: registros,
    };
  }

  async resgatar(dto: ResgatarPontosDto): Promise<ExtratoPontos> {
    const cliente = await this.clientesRepo.findOne({
      where: { id: dto.clienteId },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrada');

    if (cliente.pontosAcumulados < dto.pontos) {
      throw new BadRequestException(
        `Saldo insuficiente. Pontos disponíveis: ${cliente.pontosAcumulados}`,
      );
    }

    return this.extratoRepo.manager.transaction(async (em) => {
      await em.decrement(
        Cliente,
        { id: dto.clienteId },
        'pontosAcumulados',
        dto.pontos,
      );

      const entrada = em.create(ExtratoPontos, {
        clienteId: dto.clienteId,
        pontos: -dto.pontos,
        descricao: dto.descricao ?? `Resgate de ${dto.pontos} pontos`,
      });

      return em.save(entrada);
    });
  }

  async ranking(limit = 10) {
    return this.clientesRepo.find({
      where: { ativo: undefined },
      order: { pontosAcumulados: 'DESC' },
      take: limit,
      select: ['id', 'nomeCompleto', 'pontosAcumulados', 'nivelFidelidade', 'totalGasto'],
    });
  }
}
