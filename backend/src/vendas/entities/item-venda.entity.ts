import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venda } from './venda.entity';

@Entity('itens_venda')
export class ItemVenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venda_id', type: 'uuid' })
  vendaId: string;

  @ManyToOne(() => Venda, (v) => v.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venda_id' })
  venda: Venda;

  @Column({ type: 'varchar', length: 200 })
  produto: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  categoria: string | null;

  @Column({ type: 'int', default: 1 })
  quantidade: number;

  @Column({ name: 'valor_unitario', type: 'numeric', precision: 10, scale: 2 })
  valorUnitario: number;

  @Column({ name: 'valor_total', type: 'numeric', precision: 10, scale: 2 })
  valorTotal: number;
}
