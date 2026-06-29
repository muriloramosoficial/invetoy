-- ============================================================
-- INVENTOY - User Management (suspend, ban, status)
-- ============================================================

-- Add status and management columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'banned'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended_reason text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_reason text;

-- Comments
COMMENT ON COLUMN public.profiles.status IS 'active: normal, suspended: temporario, banned: permanente';
COMMENT ON COLUMN public.profiles.suspended_at IS 'Quando foi suspenso';
COMMENT ON COLUMN public.profiles.suspended_by IS 'Quem suspendeu (admin id)';
COMMENT ON COLUMN public.profiles.suspended_reason IS 'Motivo da suspensao';
COMMENT ON COLUMN public.profiles.banned_at IS 'Quando foi banido';
COMMENT ON COLUMN public.profiles.banned_by IS 'Quem baniu (admin id)';
COMMENT ON COLUMN public.profiles.banned_reason IS 'Motivo do banimento';
