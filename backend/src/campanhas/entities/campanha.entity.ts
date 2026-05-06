import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('campanhas')
export class Campanha {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 150 }) nome: string;
  @Column({ type: 'text', nullable: true }) descricao: string | null;
  @Column({ name: 'data_inicio', type: 'date', nullable: true }) dataInicio: string | null;
  @Column({ name: 'data_fim', type: 'date', nullable: true }) dataFim: string | null;
  @Column({ type: 'boolean', default: true }) ativa: boolean;
  @Column({ name: 'criado_por_id', type: 'uuid', nullable: true }) criadoPorId: string | null;
  @ManyToOne(() => Usuario, { nullable: true, eager: false }) @JoinColumn({ name: 'criado_por_id' }) criadoPor: Usuario | null;
  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' }) criadoEm: Date;
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' }) atualizadoEm: Date;
}
