ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('buyer', 'photographer', 'admin'));

CREATE TABLE site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  platform_fee_percent INTEGER NOT NULL DEFAULT 15
    CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 50),
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  privacy_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, platform_fee_percent, social_links, terms_content, privacy_content)
VALUES (
  1,
  15,
  '[
    {"label": "Instagram", "url": "https://instagram.com/corsa", "icon": "instagram"},
    {"label": "E-mail", "url": "mailto:contato@corsa.dev", "icon": "mail"}
  ]'::jsonb,
  '[
    {"type": "heading", "content": "Termos de Uso"},
    {"type": "paragraph", "content": "Estes termos regulam o uso da plataforma Corsa, marketplace de fotografia automotiva. Ao criar uma conta ou comprar fotos, você concorda com as condições abaixo."},
    {"type": "subheading", "content": "Contas e responsabilidades"},
    {"type": "paragraph", "content": "Você é responsável por manter suas credenciais seguras e por todas as atividades realizadas na sua conta. Fotógrafos devem garantir que possuem os direitos de imagem das fotos publicadas."},
    {"type": "separator"},
    {"type": "subheading", "content": "Compras e licença de uso"},
    {"type": "paragraph", "content": "A compra de uma foto concede licença de uso pessoal. A revenda, redistribuição ou uso comercial sem autorização do fotógrafo é proibida."},
    {"type": "subheading", "content": "Pagamentos e repasses"},
    {"type": "paragraph", "content": "Os pagamentos são processados na plataforma. O repasse ao fotógrafo corresponde ao percentual configurado nas configurações do site, deduzido da taxa da plataforma."}
  ]'::jsonb,
  '[
    {"type": "heading", "content": "Política de Privacidade"},
    {"type": "paragraph", "content": "A Corsa respeita sua privacidade. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais."},
    {"type": "subheading", "content": "Dados coletados"},
    {"type": "paragraph", "content": "Coletamos nome, e-mail, dados de cobrança quando necessário e informações de uso da plataforma para operar o serviço e melhorar a experiência."},
    {"type": "separator"},
    {"type": "subheading", "content": "Uso dos dados"},
    {"type": "paragraph", "content": "Utilizamos seus dados para autenticação, processamento de pedidos, comunicações sobre sua conta e cumprimento de obrigações legais. Não vendemos seus dados a terceiros."},
    {"type": "subheading", "content": "Contato"},
    {"type": "paragraph", "content": "Para questões sobre privacidade, entre em contato pelo e-mail contato@corsa.dev."}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
