import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('configuracoes')
export class Configuracao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'nome_loja', type: 'varchar', length: 150 }) nomeLoja: string;
  @Column({ name: 'logo_url', type: 'text', nullable: true }) logoUrl: string | null;
  @Column({ name: 'pontos_por_real', type: 'numeric', precision: 5, scale: 2, default: 1.0 }) pontosPorReal: number;
  @Column({ name: 'pts_nivel_bronze', type: 'int', default: 0 }) ptsNivelBronze: number;
  @Column({ name: 'pts_nivel_prata', type: 'int', default: 500 }) ptsNivelPrata: number;
  @Column({ name: 'pts_nivel_ouro', type: 'int', default: 2000 }) ptsNivelOuro: number;
  @Column({ name: 'pts_nivel_vip', type: 'int', default: 5000 }) ptsNivelVip: number;
  @Column({ name: 'dias_inatividade_alerta', type: 'int', default: 60 }) diasInatividadeAlerta: number;
  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' }) atualizadoEm: Date;
}
