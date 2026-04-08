import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { QueryClientesDto } from './dto/query-clientes.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto, cadastradoPorId: string): Promise<Cliente> {
    const { cpf, ...rest } = dto as any;

    const cliente = this.clientesRepo.create({
      ...rest,
      cadastradoPorId,
      dataConsentimento:
        dto.consentimentoEmail || dto.consentimentoWhatsapp ? new Date() : undefined,
    } as Partial<Cliente>);

    return this.clientesRepo.save(cliente as Cliente);
  }

  async findAll(query: QueryClientesDto) {
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 20), 100);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Cliente>[] = [];

    const baseFilter: FindOptionsWhere<Cliente> = {};
    if (query.status) baseFilter.statusCrm = query.status;
    if (query.nivel) baseFilter.nivelFidelidade = query.nivel;

    if (query.busca) {
      const termo = query.busca;
      where.push(
        { ...baseFilter, nomeCompleto: ILike(`%${termo}%`) },
        { ...baseFilter, telefone: ILike(`%${termo}%`) },
        { ...baseFilter, email: ILike(`%${termo}%`) },
      );
    } else {
      where.push(baseFilter);
    }

    const [data, total] = await this.clientesRepo.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { criadoEm: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clientesRepo.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente não encontrado`);
    return cliente;
  }

  async update(id: string, dto: Partial<CreateClienteDto>): Promise<Cliente> {
    const cliente = await this.findOne(id);
    const { cpf, ...rest } = dto as any;
    Object.assign(cliente, rest);
    return this.clientesRepo.save(cliente);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.clientesRepo.delete(id);
  }

  async historico(clienteId: string) {
    await this.findOne(clienteId);
    return this.clientesRepo.manager.query(
      `SELECT v.id, v.data_venda, v.valor_final, v.forma_pagamento, v.pontos_gerados,
              json_agg(json_build_object('produto', i.produto, 'categoria', i.categoria,
                'quantidade', i.quantidade, 'valor_total', i.valor_total)) as itens
       FROM vendas v
       JOIN itens_venda i ON i.venda_id = v.id
       WHERE v.cliente_id = $1
       GROUP BY v.id
       ORDER BY v.data_venda DESC
       LIMIT 50`,
      [clienteId],
    );
  }

  async extratoPontos(clienteId: string) {
    await this.findOne(clienteId);
    return this.clientesRepo.manager.query(
      `SELECT pontos, descricao, criado_em FROM extrato_pontos
       WHERE cliente_id = $1
       ORDER BY criado_em DESC
       LIMIT 50`,
      [clienteId],
    );
  }
}
