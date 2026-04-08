import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cupom, TipoDesconto } from './entities/cupom.entity';
import { CreateCupomDto } from './dto/create-cupom.dto';

@Injectable()
export class CuponsService {
  constructor(
    @InjectRepository(Cupom)
    private readonly cuponsRepo: Repository<Cupom>,
  ) {}

  async create(dto: CreateCupomDto, criadoPorId: string): Promise<Cupom> {
    const existing = await this.cuponsRepo.findOne({
      where: { codigo: dto.codigo.toUpperCase() },
    });
    if (existing) throw new ConflictException('Código de cupom já existe');

    const cupom = this.cuponsRepo.create({
      ...dto,
      codigo: dto.codigo.toUpperCase(),
      criadoPorId,
    });
    return this.cuponsRepo.save(cupom);
  }

  async findAll(): Promise<Cupom[]> {
    return this.cuponsRepo.find({ order: { criadoEm: 'DESC' } });
  }

  async findOne(id: string): Promise<Cupom> {
    const cupom = await this.cuponsRepo.findOne({ where: { id } });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    return cupom;
  }

  async update(id: string, dto: Partial<CreateCupomDto>): Promise<Cupom> {
    const cupom = await this.findOne(id);
    if (dto.codigo) dto.codigo = dto.codigo.toUpperCase();
    Object.assign(cupom, dto);
    return this.cuponsRepo.save(cupom);
  }

  /**
   * Valida cupom para aplicação em uma venda.
   * Retorna o cupom com o desconto calculado sobre o subtotal.
   */
  async validar(
    codigo: string,
    clienteId: string,
    subtotal: number,
  ): Promise<{ cupom: Cupom; valorDesconto: number }> {
    const cupom = await this.cuponsRepo.findOne({
      where: { codigo: codigo.toUpperCase(), ativo: true },
    });

    if (!cupom) throw new BadRequestException('Cupom inválido ou inativo');

    const hoje = new Date().toISOString().split('T')[0];
    if (cupom.validoAte < hoje) {
      throw new BadRequestException('Cupom expirado');
    }
    if (cupom.validoDe && cupom.validoDe > hoje) {
      throw new BadRequestException('Cupom ainda não é válido');
    }

    if (
      cupom.limiteUsoTotal !== null &&
      cupom.usosRealizados >= cupom.limiteUsoTotal
    ) {
      throw new BadRequestException('Cupom esgotado');
    }

    // Verifica usos por cliente via query
    const usosCliente = await this.cuponsRepo.manager.query(
      `SELECT COUNT(*) as cnt FROM usos_cupom WHERE cupom_id = $1 AND cliente_id = $2`,
      [cupom.id, clienteId],
    );
    const qtdUsosCliente = parseInt(usosCliente[0]?.cnt ?? '0', 10);
    if (qtdUsosCliente >= (cupom.limiteUsoPorCliente ?? 1)) {
      throw new BadRequestException('Limite de uso por cliente atingido');
    }

    const valorDesconto =
      cupom.tipoDesconto === TipoDesconto.PERCENTUAL
        ? Math.min((subtotal * Number(cupom.valor)) / 100, subtotal)
        : Math.min(Number(cupom.valor), subtotal);

    return { cupom, valorDesconto };
  }
}
