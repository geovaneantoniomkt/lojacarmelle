import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoDesconto {
  PERCENTUAL = 'percentual',
  FIXO = 'fixo',
}

@Entity('cupons')
export class Cupom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descricao: string | null;

  @Column({ name: 'tipo_desconto', type: 'enum', enum: TipoDesconto })
  tipoDesconto: TipoDesconto;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor: number;

  @Column({ name: 'valido_de', type: 'date', nullable: true })
  validoDe: string | null;

  @Column({ name: 'valido_ate', type: 'date' })
  validoAte: string;

  @Column({ name: 'limite_uso_total', type: 'int', nullable: true })
  limiteUsoTotal: number | null;

  @Column({ name: 'limite_uso_por_cliente', type: 'int', default: 1 })
  limiteUsoPorCliente: number;

  @Column({ name: 'usos_realizados', type: 'int', default: 0 })
  usosRealizados: number;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'campanha_id', type: 'uuid', nullable: true })
  campanhaId: string | null;

  @Column({ name: 'criado_por_id', type: 'uuid', nullable: true })
  criadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'criado_por_id' })
  criadoPor: Usuario | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
