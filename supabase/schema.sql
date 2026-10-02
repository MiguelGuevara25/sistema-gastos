-- ==============================================================================
-- SISTEMA DE GASTOS (FINANZA PRO) - ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE
-- ==============================================================================

-- 1. Tabla de Configuración de Usuario (user_settings)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT 'Usuario',
  currency TEXT DEFAULT 'S/.',
  currency_code TEXT DEFAULT 'PEN',
  monthly_budget NUMERIC(12, 2) DEFAULT 2500.00,
  theme TEXT DEFAULT 'dark',
  exchange_rates JSONB DEFAULT '{"USD": 3.75, "EUR": 4.05, "PEN": 1.0}'::jsonb,
  phantom_expense_threshold NUMERIC(10, 2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Cuentas y Tarjetas (accounts)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'wallet', 'cash', 'credit', 'savings')),
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'Wallet',
  account_number TEXT,
  currency TEXT DEFAULT 'PEN',
  credit_limit NUMERIC(14, 2),
  closing_day INTEGER CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  apr NUMERIC(6, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Categorías (categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Transacciones / Movimientos (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  currency TEXT DEFAULT 'PEN',
  exchange_rate NUMERIC(8, 4) DEFAULT 1.0000,
  installments JSONB,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Gastos Fijos & Servicios Recurrentes (recurring_expenses)
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category_id TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  currency TEXT DEFAULT 'PEN',
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'yearly')),
  last_paid_month TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Deudas y Préstamos (debts_loans)
CREATE TABLE IF NOT EXISTS public.debts_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lent', 'borrowed')),
  person_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
  notes TEXT,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  currency TEXT DEFAULT 'PEN',
  interest_rate NUMERIC(6, 2) DEFAULT 0.00,
  minimum_payment NUMERIC(12, 2) DEFAULT 0.00,
  settled_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Metas de Ahorro (savings_goals)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  deadline DATE,
  color TEXT DEFAULT '#10b981',
  category TEXT,
  icon TEXT DEFAULT 'Target',
  currency TEXT DEFAULT 'PEN',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabla de Retos de Ahorro Gamificados (savings_challenges)
CREATE TABLE IF NOT EXISTS public.savings_challenges (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_units INTEGER NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('weeks', 'days')),
  completed_steps INTEGER[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  badge_icon TEXT DEFAULT 'Trophy',
  reward_badge TEXT DEFAULT 'Medalla',
  currency TEXT DEFAULT 'PEN',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

-- ==============================================================================
-- ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) Y POLÍTICAS DE ACCESO
-- ==============================================================================

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_all" ON public.user_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_all" ON public.accounts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_select" ON public.categories
  FOR SELECT TO authenticated, anon USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "categories_all" ON public.categories
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_all" ON public.transactions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_all" ON public.recurring_expenses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debts_all" ON public.debts_loans
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_all" ON public.savings_goals
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "challenges_all" ON public.savings_challenges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: INICIALIZAR CUENTAS Y AJUSTES AL CREARSE UN NUEVO USUARIO
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insertar configuración inicial
  INSERT INTO public.user_settings (user_id, user_name, currency, currency_code, monthly_budget, exchange_rates, phantom_expense_threshold)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Usuario'),
    'S/.',
    'PEN',
    2500.00,
    '{"USD": 3.75, "EUR": 4.05, "PEN": 1.0}'::jsonb,
    20.00
  );

  -- Insertar cuentas iniciales por defecto
  INSERT INTO public.accounts (user_id, name, type, balance, color, icon, currency) VALUES
    (new.id, 'Efectivo', 'cash', 0.00, '#10b981', 'Banknote', 'PEN'),
    (new.id, 'BCP Débito', 'bank', 0.00, '#3b82f6', 'Landmark', 'PEN'),
    (new.id, 'Yape', 'wallet', 0.00, '#8b5cf6', 'Smartphone', 'PEN'),
    (new.id, 'Tarjeta Crédito', 'credit', 0.00, '#f59e0b', 'CreditCard', 'PEN');

  -- Insertar retos iniciales
  INSERT INTO public.savings_challenges (id, user_id, title, description, type, target_amount, current_amount, start_date, duration_units, unit_type, completed_steps, status, badge_icon, reward_badge, currency)
  VALUES
    ('chal-52-weeks', new.id, 'Reto de las 52 Semanas', 'Ahorra un monto incremental cada semana durante un año completo para acumular un fondo sólido.', '52_weeks', 1378.00, 0.00, CURRENT_DATE, 52, 'weeks', '{}', 'active', 'Calendar', 'Ahorrador de Oro 52', 'PEN'),
    ('chal-30-days-no-spend', new.id, 'Reto 30 Días Cero Gastos Hormiga', 'Evita compras impulsivas y pequeños gastos no esenciales durante 30 días consecutivos.', '30_days_no_spend', 300.00, 0.00, CURRENT_DATE, 30, 'days', '{}', 'active', 'ShieldAlert', 'Escudo Financiero 30D', 'PEN');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categorías maestras
INSERT INTO public.categories (id, user_id, name, icon, color, type) VALUES
  ('cat-vivienda', NULL, 'Vivienda & Alquiler', 'Home', '#3b82f6', 'expense'),
  ('cat-alimentacion', NULL, 'Alimentación & Super', 'ShoppingBag', '#f97316', 'expense'),
  ('cat-transporte', NULL, 'Transporte & Movilidad', 'Car', '#06b6d4', 'expense'),
  ('cat-servicios', NULL, 'Servicios & Recibos', 'Zap', '#eab308', 'expense'),
  ('cat-salud', NULL, 'Salud & Medicina', 'Heart', '#ef4444', 'expense'),
  ('cat-educacion', NULL, 'Educación & Cursos', 'GraduationCap', '#8b5cf6', 'expense'),
  ('cat-entretenimiento', NULL, 'Ocio & Salidas', 'Film', '#ec4899', 'expense'),
  ('cat-suscripciones', NULL, 'Suscripciones & Streaming', 'Tv', '#a855f7', 'expense'),
  ('cat-ropa', NULL, 'Ropa & Calzado', 'Shirt', '#14b8a6', 'expense'),
  ('cat-deudas', NULL, 'Pago de Deudas', 'CreditCard', '#f43f5e', 'expense'),
  ('cat-otros-gastos', NULL, 'Otros Gastos', 'MoreHorizontal', '#64748b', 'expense'),
  ('cat-salario', NULL, 'Sueldo / Salario', 'Briefcase', '#10b981', 'income'),
  ('cat-freelance', NULL, 'Freelance & Proyectos', 'Laptop', '#0ea5e9', 'income'),
  ('cat-inversiones', NULL, 'Rendimientos & Dividendos', 'TrendingUp', '#84cc16', 'income'),
  ('cat-otros-ingresos', NULL, 'Otros Ingresos', 'Coins', '#22c55e', 'income')
ON CONFLICT (id) DO NOTHING;
