import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Venda } from '../vendas/entities/venda.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
    @InjectRepository(Venda)
    private readonly vendasRepo: Repository<Venda>,
  ) {}

  async kpis() {
    const totalClientes = await this.clientesRepo.count();
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

    const vendasMesResult = await this.vendasRepo
      .createQueryBuilder('v')
      .select('COUNT(v.id)', 'total')
      .addSelect('COALESCE(SUM(v.valorFinal), 0)', 'receita')
      .where('v.dataVenda BETWEEN :inicio AND :fim', { inicio: inicioMes, fim: fimMes })
      .getRawOne();

    const alertasPendentes = await this.vendasRepo.manager.query(
      `SELECT COUNT(*) as cnt FROM alertas WHERE lido = false`,
    );

    return {
      totalClientes,
      vendasMes: parseInt(vendasMesResult?.total ?? '0'),
      receitaMes: parseFloat(vendasMesResult?.receita ?? '0'),
      alertasPendentes: parseInt(alertasPendentes[0]?.cnt ?? '0'),
    };
  }

  async vendasPorMes() {
    return this.vendasRepo.manager.query(`
      SELECT TO_CHAR(data_venda, 'YYYY-MM') AS mes, COUNT(*)::int AS total_vendas, SUM(valor_final) AS receita
      FROM vendas WHERE data_venda >= NOW() - INTERVAL '12 months'
      GROUP BY mes ORDER BY mes ASC
    `);
  }

  async topCategorias() {
    return this.vendasRepo.manager.query(`
      SELECT COALESCE(categoria, 'Outros') AS categoria, SUM(quantidade)::int AS total_itens, SUM(valor_total) AS receita
      FROM itens_venda GROUP BY categoria ORDER BY receita DESC LIMIT 8
    `);
  }

  async clientesNovos() {
    return this.vendasRepo.manager.query(`
      SELECT TO_CHAR(criado_em, 'YYYY-MM') AS mes, COUNT(*)::int AS novos
      FROM clientes WHERE criado_em >= NOW() - INTERVAL '6 months'
      GROUP BY mes ORDER BY mes ASC
    `);
  }
}
