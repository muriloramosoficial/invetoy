-- Add CPF to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Add CNPJ to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Add Asaas API configuration columns to tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_api_key_sandbox TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_api_key_production TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_env TEXT DEFAULT 'sandbox';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_webhook_url_sandbox TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_webhook_url_production TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_webhook_secret_sandbox TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS asaas_webhook_secret_production TEXT;

-- Comments for clarity
COMMENT ON COLUMN profiles.cpf IS 'CPF do responsavel legal pela empresa';
COMMENT ON COLUMN tenants.cnpj IS 'CNPJ da empresa (obrigatorio para planos pagos)';
COMMENT ON COLUMN tenants.asaas_api_key_sandbox IS 'Chave de API do Asaas ambiente sandbox';
COMMENT ON COLUMN tenants.asaas_api_key_production IS 'Chave de API do Asaas ambiente producao';
COMMENT ON COLUMN tenants.asaas_env IS 'Ambiente ativo do Asaas: sandbox ou production';
COMMENT ON COLUMN tenants.asaas_webhook_url_sandbox IS 'URL de webhook do Asaas (sandbox)';
COMMENT ON COLUMN tenants.asaas_webhook_url_production IS 'URL de webhook do Asaas (producao)';
COMMENT ON COLUMN tenants.asaas_webhook_secret_sandbox IS 'Secret do webhook Asaas (sandbox)';
COMMENT ON COLUMN tenants.asaas_webhook_secret_production IS 'Secret do webhook Asaas (producao)';
