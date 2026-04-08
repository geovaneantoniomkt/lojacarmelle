import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1712500000000 implements MigrationInterface {
  name = 'InitialSchema1712500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // EXTENSÕES
    // ============================================================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ============================================================
    // TIPOS ENUM
    // ============================================================
    await queryRunner.query(`
      CREATE TYPE perfil_usuario AS ENUM ('admin', 'gerente', 'vendedora')
    `);
    await queryRunner.query(`
      CREATE TYPE status_cliente AS ENUM ('nova', 'recorrente', 'vip', 'inativa', 'reativacao')
    `);
    await queryRunner.query(`
      CREATE TYPE origem_cadastro AS ENUM (
        'loja', 'indicacao', 'instagram', 'anuncio', 'evento', 'campanha', 'outra'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE nivel_fidelidade AS ENUM ('bronze', 'prata', 'ouro', 'vip')
    `);
    await queryRunner.query(`
      CREATE TYPE forma_pagamento AS ENUM (
        'pix', 'credito', 'debito', 'dinheiro', 'link', 'boleto', 'crediario'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE tipo_desconto AS ENUM ('percentual', 'fixo')
    `);
    await queryRunner.query(`
      CREATE TYPE tipo_alerta AS ENUM (
        'aniversario', 'inatividade', 'recompra', 'nivel_fidelidade', 'campanha_vencendo'
      )
    `);

    // ============================================================
    // USUÁRIAS DO SISTEMA
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        senha_hash    TEXT NOT NULL,
        perfil        perfil_usuario NOT NULL DEFAULT 'vendedora',
        ativo         BOOLEAN NOT NULL DEFAULT true,
        ultimo_acesso TIMESTAMPTZ,
        criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ============================================================
    // CLIENTES
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE clientes (
        id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome_completo          VARCHAR(150) NOT NULL,
        telefone               VARCHAR(20),
        email                  VARCHAR(150),
        cpf_criptografado      TEXT,
        data_nascimento        DATE,
        cidade                 VARCHAR(100),
        bairro                 VARCHAR(100),
        endereco               VARCHAR(250),
        instagram              VARCHAR(80),
        status_crm             status_cliente NOT NULL DEFAULT 'nova',
        origem_cadastro        origem_cadastro NOT NULL DEFAULT 'loja',
        indicado_por_id        UUID REFERENCES clientes(id),
        observacoes            TEXT,
        consentimento_email    BOOLEAN NOT NULL DEFAULT false,
        consentimento_whatsapp BOOLEAN NOT NULL DEFAULT false,
        data_consentimento     TIMESTAMPTZ,
        pontos_acumulados      INTEGER NOT NULL DEFAULT 0,
        nivel_fidelidade       nivel_fidelidade NOT NULL DEFAULT 'bronze',
        total_gasto            NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_compras          INTEGER NOT NULL DEFAULT 0,
        ticket_medio           NUMERIC(10,2) NOT NULL DEFAULT 0,
        ultima_compra_em       TIMESTAMPTZ,
        primeira_compra_em     TIMESTAMPTZ,
        cadastrado_por_id      UUID REFERENCES usuarios(id),
        criado_em              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        atualizado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_clientes_email         ON clientes(email)`);
    await queryRunner.query(`CREATE INDEX idx_clientes_telefone      ON clientes(telefone)`);
    await queryRunner.query(`CREATE INDEX idx_clientes_status_crm    ON clientes(status_crm)`);
    await queryRunner.query(`CREATE INDEX idx_clientes_nascimento    ON clientes(data_nascimento)`);
    await queryRunner.query(`CREATE INDEX idx_clientes_ultima_compra ON clientes(ultima_compra_em)`);
    await queryRunner.query(`CREATE INDEX idx_clientes_nivel         ON clientes(nivel_fidelidade)`);

    // ============================================================
    // PREFERÊNCIAS DAS CLIENTES
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE preferencias_clientes (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
        estilos          TEXT[],
        categorias       TEXT[],
        cores_preferidas TEXT[],
        ocasioes         TEXT[],
        num_roupa        VARCHAR(10),
        num_calcado      VARCHAR(10),
        faixa_preco_min  NUMERIC(10,2),
        faixa_preco_max  NUMERIC(10,2),
        prefere_whatsapp BOOLEAN DEFAULT false,
        compra_datas_comemorativas BOOLEAN DEFAULT false,
        ja_pediu_reserva BOOLEAN DEFAULT false,
        cliente_vip_manual BOOLEAN DEFAULT false,
        notas_estilo     TEXT,
        atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (cliente_id)
      )
    `);

    // ============================================================
    // CAMPANHAS
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE campanhas (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome          VARCHAR(150) NOT NULL,
        descricao     TEXT,
        data_inicio   DATE,
        data_fim      DATE,
        ativa         BOOLEAN NOT NULL DEFAULT true,
        criado_por_id UUID REFERENCES usuarios(id),
        criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ============================================================
    // CUPONS
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE cupons (
        id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        codigo                  VARCHAR(30) NOT NULL UNIQUE,
        descricao               VARCHAR(200),
        tipo_desconto           tipo_desconto NOT NULL,
        valor                   NUMERIC(10,2) NOT NULL,
        valido_de               DATE,
        valido_ate              DATE NOT NULL,
        limite_uso_total        INTEGER,
        limite_uso_por_cliente  INTEGER DEFAULT 1,
        usos_realizados         INTEGER NOT NULL DEFAULT 0,
        ativo                   BOOLEAN NOT NULL DEFAULT true,
        campanha_id             UUID REFERENCES campanhas(id),
        criado_por_id           UUID REFERENCES usuarios(id),
        criado_em               TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_cupons_codigo   ON cupons(codigo)`);
    await queryRunner.query(`CREATE INDEX idx_cupons_validade ON cupons(valido_ate)`);

    // ============================================================
    // VENDAS
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE vendas (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cliente_id      UUID NOT NULL REFERENCES clientes(id),
        vendedora_id    UUID NOT NULL REFERENCES usuarios(id),
        cupom_id        UUID REFERENCES cupons(id),
        data_venda      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        subtotal        NUMERIC(10,2) NOT NULL,
        valor_desconto  NUMERIC(10,2) NOT NULL DEFAULT 0,
        valor_final     NUMERIC(10,2) NOT NULL,
        forma_pagamento forma_pagamento NOT NULL,
        parcelas        INTEGER DEFAULT 1,
        pontos_gerados  INTEGER NOT NULL DEFAULT 0,
        observacoes     TEXT,
        criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_vendas_cliente   ON vendas(cliente_id)`);
    await queryRunner.query(`CREATE INDEX idx_vendas_vendedora ON vendas(vendedora_id)`);
    await queryRunner.query(`CREATE INDEX idx_vendas_data      ON vendas(data_venda)`);
    await queryRunner.query(`CREATE INDEX idx_vendas_cupom     ON vendas(cupom_id)`);

    // ============================================================
    // ITENS DA VENDA
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE itens_venda (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        venda_id       UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        produto        VARCHAR(200) NOT NULL,
        categoria      VARCHAR(80),
        quantidade     INTEGER NOT NULL DEFAULT 1,
        valor_unitario NUMERIC(10,2) NOT NULL,
        valor_total    NUMERIC(10,2) NOT NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_itens_venda ON itens_venda(venda_id)`);

    // ============================================================
    // USOS DE CUPOM
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE usos_cupom (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cupom_id   UUID NOT NULL REFERENCES cupons(id),
        cliente_id UUID NOT NULL REFERENCES clientes(id),
        venda_id   UUID NOT NULL REFERENCES vendas(id),
        usado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (cupom_id, cliente_id, venda_id)
      )
    `);

    // ============================================================
    // EXTRATO DE PONTOS
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE extrato_pontos (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cliente_id UUID NOT NULL REFERENCES clientes(id),
        venda_id   UUID REFERENCES vendas(id),
        pontos     INTEGER NOT NULL,
        descricao  VARCHAR(200),
        criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_extrato_cliente ON extrato_pontos(cliente_id)`);

    // ============================================================
    // ALERTAS
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE alertas (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tipo        tipo_alerta NOT NULL,
        cliente_id  UUID REFERENCES clientes(id),
        campanha_id UUID REFERENCES campanhas(id),
        titulo      VARCHAR(200) NOT NULL,
        descricao   TEXT,
        lido        BOOLEAN NOT NULL DEFAULT false,
        lido_por_id UUID REFERENCES usuarios(id),
        lido_em     TIMESTAMPTZ,
        criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_alertas_lido   ON alertas(lido)`);
    await queryRunner.query(`CREATE INDEX idx_alertas_criado ON alertas(criado_em DESC)`);

    // ============================================================
    // LISTAS DE SEGMENTAÇÃO
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE listas_segmentacao (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome           VARCHAR(150) NOT NULL,
        filtros_json   JSONB NOT NULL,
        total_clientes INTEGER,
        criado_por_id  UUID REFERENCES usuarios(id),
        criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ============================================================
    // CONFIGURAÇÕES DA LOJA
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE configuracoes (
        id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome_loja               VARCHAR(150) NOT NULL,
        logo_url                TEXT,
        pontos_por_real         NUMERIC(5,2) NOT NULL DEFAULT 1.0,
        pts_nivel_bronze        INTEGER NOT NULL DEFAULT 0,
        pts_nivel_prata         INTEGER NOT NULL DEFAULT 500,
        pts_nivel_ouro          INTEGER NOT NULL DEFAULT 2000,
        pts_nivel_vip           INTEGER NOT NULL DEFAULT 5000,
        dias_inatividade_alerta INTEGER NOT NULL DEFAULT 60,
        atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ============================================================
    // TRIGGER: atualizar métricas do cliente após venda
    // ============================================================
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION atualizar_metricas_cliente()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE clientes
        SET
          total_gasto       = (SELECT COALESCE(SUM(valor_final), 0) FROM vendas WHERE cliente_id = NEW.cliente_id),
          total_compras     = (SELECT COUNT(*) FROM vendas WHERE cliente_id = NEW.cliente_id),
          ticket_medio      = (SELECT COALESCE(AVG(valor_final), 0) FROM vendas WHERE cliente_id = NEW.cliente_id),
          ultima_compra_em  = (SELECT MAX(data_venda) FROM vendas WHERE cliente_id = NEW.cliente_id),
          primeira_compra_em = (SELECT MIN(data_venda) FROM vendas WHERE cliente_id = NEW.cliente_id),
          atualizado_em     = NOW()
        WHERE id = NEW.cliente_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trig_metricas_cliente
      AFTER INSERT OR UPDATE ON vendas
      FOR EACH ROW EXECUTE FUNCTION atualizar_metricas_cliente()
    `);

    // ============================================================
    // TRIGGER: atualizar status CRM e nível de fidelidade
    // ============================================================
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION atualizar_status_crm()
      RETURNS TRIGGER AS $$
      DECLARE
        v_total_compras INTEGER;
        v_ticket_medio  NUMERIC;
        v_dias_inativo  INTEGER;
        v_config        configuracoes%ROWTYPE;
      BEGIN
        SELECT * INTO v_config FROM configuracoes LIMIT 1;

        v_total_compras := NEW.total_compras;
        v_ticket_medio  := NEW.ticket_medio;
        v_dias_inativo  := EXTRACT(DAY FROM NOW() - NEW.ultima_compra_em);

        IF v_dias_inativo > COALESCE(v_config.dias_inatividade_alerta, 90) THEN
          NEW.status_crm := 'inativa';
        ELSIF v_total_compras = 0 THEN
          NEW.status_crm := 'nova';
        ELSIF NEW.pontos_acumulados >= COALESCE(v_config.pts_nivel_vip, 5000)
              OR v_ticket_medio >= 600 THEN
          NEW.status_crm := 'vip';
        ELSIF v_total_compras >= 2 THEN
          NEW.status_crm := 'recorrente';
        ELSE
          NEW.status_crm := 'nova';
        END IF;

        IF NEW.pontos_acumulados >= COALESCE(v_config.pts_nivel_vip, 5000) THEN
          NEW.nivel_fidelidade := 'vip';
        ELSIF NEW.pontos_acumulados >= COALESCE(v_config.pts_nivel_ouro, 2000) THEN
          NEW.nivel_fidelidade := 'ouro';
        ELSIF NEW.pontos_acumulados >= COALESCE(v_config.pts_nivel_prata, 500) THEN
          NEW.nivel_fidelidade := 'prata';
        ELSE
          NEW.nivel_fidelidade := 'bronze';
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trig_status_crm
      BEFORE UPDATE OF total_compras, pontos_acumulados, ultima_compra_em
      ON clientes
      FOR EACH ROW EXECUTE FUNCTION atualizar_status_crm()
    `);

    // ============================================================
    // DADOS INICIAIS
    // ============================================================
    await queryRunner.query(`
      INSERT INTO configuracoes (
        nome_loja, pontos_por_real,
        pts_nivel_bronze, pts_nivel_prata, pts_nivel_ouro, pts_nivel_vip,
        dias_inatividade_alerta
      ) VALUES (
        'Minha Loja', 1.0,
        0, 500, 2000, 5000,
        60
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trig_status_crm ON clientes`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trig_metricas_cliente ON vendas`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS atualizar_status_crm`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS atualizar_metricas_cliente`);

    await queryRunner.query(`DROP TABLE IF EXISTS configuracoes`);
    await queryRunner.query(`DROP TABLE IF EXISTS listas_segmentacao`);
    await queryRunner.query(`DROP TABLE IF EXISTS alertas`);
    await queryRunner.query(`DROP TABLE IF EXISTS extrato_pontos`);
    await queryRunner.query(`DROP TABLE IF EXISTS usos_cupom`);
    await queryRunner.query(`DROP TABLE IF EXISTS itens_venda`);
    await queryRunner.query(`DROP TABLE IF EXISTS vendas`);
    await queryRunner.query(`DROP TABLE IF EXISTS cupons`);
    await queryRunner.query(`DROP TABLE IF EXISTS campanhas`);
    await queryRunner.query(`DROP TABLE IF EXISTS preferencias_clientes`);
    await queryRunner.query(`DROP TABLE IF EXISTS clientes`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);

    await queryRunner.query(`DROP TYPE IF EXISTS tipo_alerta`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_desconto`);
    await queryRunner.query(`DROP TYPE IF EXISTS forma_pagamento`);
    await queryRunner.query(`DROP TYPE IF EXISTS nivel_fidelidade`);
    await queryRunner.query(`DROP TYPE IF EXISTS origem_cadastro`);
    await queryRunner.query(`DROP TYPE IF EXISTS status_cliente`);
    await queryRunner.query(`DROP TYPE IF EXISTS perfil_usuario`);
  }
}
