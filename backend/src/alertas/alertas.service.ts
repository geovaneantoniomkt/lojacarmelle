import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './entities/alerta.entity';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private readonly alertasRepo: Repository<Alerta>,
  ) {}

  async findAll(apenasNaoLidos = false): Promise<Alerta[]> {
    return this.alertasRepo.find({
      where: apenasNaoLidos ? { lido: false } : {},
      relations: ['cliente'],
      order: { criadoEm: 'DESC' },
      take: 100,
    });
  }

  async marcarLido(id: string, lido_por_id: string): Promise<Alerta> {
    const alerta = await this.alertasRepo.findOne({ where: { id } });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');
    alerta.lido = true;
    alerta.lidoPorId = lido_por_id;
    alerta.lidoEm = new Date();
    return this.alertasRepo.save(alerta);
  }

  async marcarTodosLidos(lido_por_id: string): Promise<{ affected: number }> {
    const result = await this.alertasRepo.update(
      { lido: false },
      { lido: true, lidoPorId: lido_por_id, lidoEm: new Date() },
    );
    return { affected: result.affected ?? 0 };
  }

  async contarNaoLidos(): Promise<number> {
    return this.alertasRepo.count({ where: { lido: false } });
  }
}
