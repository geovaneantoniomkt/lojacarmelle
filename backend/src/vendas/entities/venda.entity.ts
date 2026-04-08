import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Cupom } from '../../cupons/entities/cupom.entity';
import { ItemVenda } from './item-venda.entity';

export enum FormaPagamento {
  PIX = 'pix',
  CREDITO = 'credito',
  DEBITO = 'debito',
  DINHEIRO = 'dinheiro',
  LINK = 'link',
  BOLETO = 'boleto',
  CREDIARIO = 'crediario',
}

@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, { eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'vendedora_id', type: 'uuid' })
  vendedoraId: string;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'vendedora_id' })
  vendedora: Usuario;

  @Column({ name: 'cupom_id', type: 'uuid', nullable: true })
  cupomId: string | null;

  @ManyToOne(() => Cupom, { nullable: true, eager: false })
  @JoinColumn({ name: 'cupom_id' })
  cupom: Cupom | null;

  @Column({ name: 'data_venda', type: 'timestamptz', default: () => 'NOW()' })
  dataVenda: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'valor_desconto', type: 'numeric', precision: 10, scale: 2, default: 0 })
  valorDesconto: number;

  @Column({ name: 'valor_final', type: 'numeric', precision: 10, scale: 2 })
  valorFinal: number;

  @Column({ name: 'forma_pagamento', type: 'enum', enum: FormaPagamento })
  formaPagamento: FormaPagamento;

  @Column({ type: 'int', default: 1 })
  parcelas: number;

  @Column({ name: 'pontos_gerados', type: 'int', default: 0 })
  pontosGerados: number;

  @Column({ nullable: true, type: 'text' })
  observacoes: string | null;

  @OneToMany(() => ItemVenda, (item) => item.venda, { cascade: true, eager: true })
  itens: ItemVenda[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
