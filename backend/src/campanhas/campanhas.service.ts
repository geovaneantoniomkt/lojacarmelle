import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campanha } from './entities/campanha.entity';
import { CreateCampanhaDto } from './dto/create-campanha.dto';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(Campanha)
    private readonly campanhasRepo: Repository<Campanha>,
  ) {}

  async create(dto: CreateCampanhaDto, criadoPorId: string): Promise<Campanha> {
    const campanha = this.campanhasRepo.create({ ...dto, criadoPorId });
    return this.campanhasRepo.save(campanha);
  }

  async findAll(): Promise<Campanha[]> {
    return this.campanhasRepo.find({ order: { criadoEm: 'DESC' } });
  }

  async findOne(id: string): Promise<Campanha> {
    const c = await this.campanhasRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Campanha não encontrada');
    return c;
  }

  async update(id: string, dto: Partial<CreateCampanhaDto>): Promise<Campanha> {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.campanhasRepo.save(c);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.campanhasRepo.delete(id);
  }
}
