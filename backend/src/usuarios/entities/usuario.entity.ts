import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum PerfilUsuario {
  ADMIN = 'admin',
  GERENTE = 'gerente',
  VENDEDORA = 'vendedora',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'senha_hash', type: 'text' })
  senhaHash: string;

  @Column({
    type: 'enum',
    enum: PerfilUsuario,
    default: PerfilUsuario.VENDEDORA,
  })
  perfil: PerfilUsuario;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'ultimo_acesso', nullable: true, type: 'timestamptz' })
  ultimoAcesso: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;
}
