import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, PerfilUsuario } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const senhaCorreta = process.env.APP_PASSWORD ?? 'LojaCarmelle26';

    if (dto.senha !== senhaCorreta) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // Busca o usuário admin padrão; cria se não existir
    let usuario = await this.usuariosRepo.findOne({
      where: { perfil: PerfilUsuario.ADMIN, ativo: true },
    });

    if (!usuario) {
      usuario = this.usuariosRepo.create({
        nome: 'Administrador',
        email: 'admin@modacrm.local',
        senhaHash: '-',
        perfil: PerfilUsuario.ADMIN,
        ativo: true,
      });
      usuario = await this.usuariosRepo.save(usuario);
    }

    await this.usuariosRepo.update(usuario.id, { ultimoAcesso: new Date() });

    return this.gerarTokens(usuario);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
      });

      const usuario = await this.usuariosRepo.findOne({
        where: { id: payload.sub, ativo: true },
      });

      if (!usuario) throw new UnauthorizedException();

      return this.gerarTokens(usuario);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  private gerarTokens(usuario: Usuario) {
    const payload = { sub: usuario.id, email: usuario.email, perfil: usuario.perfil };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'secret',
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}
