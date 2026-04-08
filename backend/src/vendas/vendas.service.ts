import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Venda } from './entities/venda.entity';
import { ItemVenda } from './entities/item-venda.entity';
import { ExtratoPontos } from '../fidelidade/entities/extrato-pontos.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CuponsService } from '../cupons/cupons.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { QueryVendasDto } from './dto/query-vendas.dto';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendasRepo: Repository<Venda>,
    @InjectRepository(ItemVenda)
    private readonly itensRepo: Repository<ItemVenda>,
    @InjectRepository(ExtratoPontos)
    private readonly extratoRepo: Repository<ExtratoPontos>,
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
    private readonly cuponsService: CuponsService,
  ) {}

  async create(dto: CreateVendaDto, vendedoraId: string): Promise<Venda> {
    // Calcular subtotal a partir dos itens
    const subtotal = dto.itens.reduce(
      (acc, item) => acc + item.valorUnitario * item.quantidade,
      0,
    );

    let cupomId: string | null = null;
    let valorDesconto = 0;

    // Validar e aplicar cupom, se informado
    if (dto.codigoCupom) {
      const { cupom, valorDesconto: desconto } = await this.cuponsService.validar(
        dto.codigoCupom,
        dto.clienteId,
        subtotal,
      );
      cupomId = cupom.id;
      valorDesconto = desconto;

      // Incrementar usos_realizados do cupom
      await this.cuponsService['cuponsRepo'].increment(
        { id: cupom.id },
        'usosRealizados',
        1,
      );
    }

    const valorFinal = Math.max(subtotal - valorDesconto, 0);

    // Calcular pontos (1 ponto por R$1 no valor_final — regra da configuracoes)
    const config = await this.vendasRepo.manager.query(
      `SELECT pontos_por_real FROM configuracoes LIMIT 1`,
    );
    const pontosPorReal = parseFloat(config[0]?.pontos_por_real ?? '1');
    const pontosGerados = Math.floor(valorFinal * pontosPorReal);

    // Criar venda dentro de uma transaction
    return this.vendasRepo.manager.transaction(async (em) => {
      // Salvar venda
      const venda = em.create(Venda, {
        clienteId: dto.clienteId,
        vendedoraId,
        cupomId,
        subtotal,
        valorDesconto,
        valorFinal,
        formaPagamento: dto.formaPagamento,
        parcelas: dto.parcelas ?? 1,
        pontosGerados,
        observacoes: dto.observacoes ?? null,
      });
      const vendaSalva = await em.save(venda);

      // Salvar itens
      const itens = dto.itens.map((item) =>
        em.create(ItemVenda, {
          vendaId: vendaSalva.id,
          produto: item.produto,
          categoria: item.categoria ?? null,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorUnitario * item.quantidade,
        }),
      );
      await em.save(itens);

      // Registrar uso do cupom
      if (cupomId) {
        await em.query(
          `INSERT INTO usos_cupom (cupom_id, cliente_id, venda_id) VALUES ($1, $2, $3)`,
          [cupomId, dto.clienteId, vendaSalva.id],
        );
      }

      // Registrar extrato de pontos
      if (pontosGerados > 0) {
        const extrato = em.create(ExtratoPontos, {
          clienteId: dto.clienteId,
          vendaId: vendaSalva.id,
          pontos: pontosGerados,
          descricao: `Compra #${vendaSalva.id.slice(-8).toUpperCase()}`,
        });
        await em.save(extrato);

        // Atualizar pontos do cliente
        await em.increment(Cliente, { id: dto.clienteId }, 'pontosAcumulados', pontosGerados);
      }

      return em.findOne(Venda, {
        where: { id: vendaSalva.id },
        relations: ['itens', 'cliente', 'vendedora', 'cupom'],
      }) as Promise<Venda>;
    });
  }

  async findAll(query: QueryVendasDto) {
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 20), 100);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Venda> = {};
    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.vendedoraId) where.vendedoraId = query.vendedoraId;

    if (query.dataInicio && query.dataFim) {
      where.dataVenda = Between(
        new Date(query.dataInicio),
        new Date(query.dataFim + 'T23:59:59'),
      );
    } else if (query.dataInicio) {
      where.dataVenda = MoreThanOrEqual(new Date(query.dataInicio));
    } else if (query.dataFim) {
      where.dataVenda = LessThanOrEqual(new Date(query.dataFim + 'T23:59:59'));
    }

    const [data, total] = await this.vendasRepo.findAndCount({
      where,
      relations: ['itens', 'cliente', 'vendedora', 'cupom'],
      order: { dataVenda: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Venda> {
    const venda = await this.vendasRepo.findOne({
      where: { id },
      relations: ['itens', 'cliente', 'vendedora', 'cupom'],
    });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    return venda;
  }

  async extratoPontos(clienteId: string) {
    return this.extratoRepo.find({
      where: { clienteId },
      order: { criadoEm: 'DESC' },
      take: 50,
    });
  }
}
