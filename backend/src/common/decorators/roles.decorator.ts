import { SetMetadata } from '@nestjs/common';
import { PerfilUsuario } from '../../usuarios/entities/usuario.entity';
import { ROLES_KEY } from '../../auth/guards/roles.guard';

export const Roles = (...roles: PerfilUsuario[]) => SetMetadata(ROLES_KEY, roles);
