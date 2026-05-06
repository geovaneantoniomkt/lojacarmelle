import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existing = await this.usuariosRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuariosRepo.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      perfil: dto.perfil,
      ativo: dto.ativo ?? true,
    });
    return this.usuariosRepo.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepo.find({ order: { criadoEm: 'DESC' } });
  }

  async findOne(id: string): Promise<Usuario> {
    const u = await this.usuariosRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return u;
  }

  async update(id: string, dto: Partial<CreateUsuarioDto>): Promise<Usuario> {
    const u = await this.findOne(id);
    if (dto.senha) {
      u.senhaHash = await bcrypt.hash(dto.senha, 10);
    }
    if (dto.nome !== undefined) u.nome = dto.nome;
    if (dto.email !== undefined) u.email = dto.email;
    if (dto.perfil !== undefined) u.perfil = dto.perfil;
    if (dto.ativo !== undefined) u.ativo = dto.ativo;
    return this.usuariosRepo.save(u);
  }

  async toggleAtivo(id: string): Promise<Usuario> {
    const u = await this.findOne(id);
    u.ativo = !u.ativo;
    return this.usuariosRepo.save(u);
  }
}
