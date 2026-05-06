import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoAlerta {
  ANIVERSARIO = 'aniversario',
  INATIVIDADE = 'inatividade',
  RECOMPRA = 'recompra',
  NIVEL_FIDELIDADE = 'nivel_fidelidade',
  CAMPANHA_VENCENDO = 'campanha_vencendo',
}

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: TipoAlerta }) tipo: TipoAlerta;
  @Column({ name: 'cliente_id', type: 'uuid', nullable: true }) clienteId: string | null;
  @ManyToOne(() => Cliente, { nullable: true, eager: false }) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente | null;
  @Column({ name: 'campanha_id', type: 'uuid', nullable: true }) campanhaId: string | null;
  @Column({ type: 'varchar', length: 200 }) titulo: string;
  @Column({ type: 'text', nullable: true }) descricao: string | null;
  @Column({ type: 'boolean', default: false }) lido: boolean;
  @Column({ name: 'lido_por_id', type: 'uuid', nullable: true }) lidoPorId: string | null;
  @ManyToOne(() => Usuario, { nullable: true, eager: false }) @JoinColumn({ name: 'lido_por_id' }) lidoPor: Usuario | null;
  @Column({ name: 'lido_em', type: 'timestamptz', nullable: true }) lidoEm: Date | null;
  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' }) criadoEm: Date;
}
