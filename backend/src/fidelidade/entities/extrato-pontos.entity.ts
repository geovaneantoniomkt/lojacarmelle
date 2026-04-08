import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Venda } from '../../vendas/entities/venda.entity';

@Entity('extrato_pontos')
export class ExtratoPontos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, { eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'venda_id', type: 'uuid', nullable: true })
  vendaId: string | null;

  @ManyToOne(() => Venda, { nullable: true, eager: false })
  @JoinColumn({ name: 'venda_id' })
  venda: Venda | null;

  @Column({ type: 'int' })
  pontos: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descricao: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
