import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum StatusCliente {
  NOVA = 'nova',
  RECORRENTE = 'recorrente',
  VIP = 'vip',
  INATIVA = 'inativa',
  REATIVACAO = 'reativacao',
}

export enum OrigemCadastro {
  LOJA = 'loja',
  INDICACAO = 'indicacao',
  INSTAGRAM = 'instagram',
  ANUNCIO = 'anuncio',
  EVENTO = 'evento',
  CAMPANHA = 'campanha',
  OUTRA = 'outra',
}

export enum NivelFidelidade {
  BRONZE = 'bronze',
  PRATA = 'prata',
  OURO = 'ouro',
  VIP = 'vip',
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_completo', type: 'varchar', length: 150 })
  nomeCompleto: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'cpf_criptografado', type: 'text', nullable: true })
  cpfCriptografado: string | null;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bairro: string | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  endereco: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  instagram: string | null;

  @Column({
    name: 'status_crm',
    type: 'enum',
    enum: StatusCliente,
    default: StatusCliente.NOVA,
  })
  statusCrm: StatusCliente;

  @Column({
    name: 'origem_cadastro',
    type: 'enum',
    enum: OrigemCadastro,
    default: OrigemCadastro.LOJA,
  })
  origemCadastro: OrigemCadastro;

  @Column({ name: 'indicado_por_id', type: 'uuid', nullable: true })
  indicadoPorId: string | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @Column({ name: 'consentimento_email', type: 'boolean', default: false })
  consentimentoEmail: boolean;

  @Column({ name: 'consentimento_whatsapp', type: 'boolean', default: false })
  consentimentoWhatsapp: boolean;

  @Column({ name: 'data_consentimento', type: 'timestamptz', nullable: true })
  dataConsentimento: Date | null;

  @Column({ name: 'pontos_acumulados', type: 'int', default: 0 })
  pontosAcumulados: number;

  @Column({
    name: 'nivel_fidelidade',
    type: 'enum',
    enum: NivelFidelidade,
    default: NivelFidelidade.BRONZE,
  })
  nivelFidelidade: NivelFidelidade;

  @Column({ name: 'total_gasto', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalGasto: number;

  @Column({ name: 'total_compras', type: 'int', default: 0 })
  totalCompras: number;

  @Column({ name: 'ticket_medio', type: 'numeric', precision: 10, scale: 2, default: 0 })
  ticketMedio: number;

  @Column({ name: 'ultima_compra_em', type: 'timestamptz', nullable: true })
  ultimaCompraEm: Date | null;

  @Column({ name: 'primeira_compra_em', type: 'timestamptz', nullable: true })
  primeiraCompraEm: Date | null;

  @Column({ name: 'cadastrado_por_id', type: 'uuid', nullable: true })
  cadastradoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'cadastrado_por_id' })
  cadastradoPor: Usuario | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;
}
