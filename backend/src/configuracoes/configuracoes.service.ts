import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracao } from './entities/configuracao.entity';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Configuracao)
    private readonly configRepo: Repository<Configuracao>,
  ) {}

  async findOne(): Promise<Configuracao> {
    const config = await this.configRepo.findOne({ where: {} });
    if (!config) throw new NotFoundException('Configurações não encontradas');
    return config;
  }

  async update(dto: UpdateConfiguracaoDto): Promise<Configuracao> {
    const config = await this.findOne();
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }
}
