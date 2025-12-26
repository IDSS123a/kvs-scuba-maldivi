-- ============================================================================
-- CHECKLIST SYSTEM OVERHAUL - DATABASE MIGRATION
-- Project: KVS-SCUBA Maldives 2026
-- ============================================================================

-- 1. DROP existing table (if exists) and recreate with proper structure
DROP TABLE IF EXISTS public.checklist_items CASCADE;

-- Create new comprehensive checklist_items table
CREATE TABLE public.checklist_items (
  id TEXT NOT NULL,  -- e.g., 'doc_001', 'mon_001'
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,  -- 'documents', 'money', 'diving_equipment', etc.
  name TEXT NOT NULL,  -- Display name in Bosnian
  name_en TEXT,        -- Display name in English
  description TEXT,
  description_en TEXT,
  mandatory BOOLEAN DEFAULT false,
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  icon TEXT,           -- Emoji icon
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  sort_order INTEGER,  -- For ordering within category
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)  -- Each user has their own checklist items
);

-- Create indexes for performance
CREATE INDEX idx_checklist_items_user_id ON public.checklist_items(user_id);
CREATE INDEX idx_checklist_items_category ON public.checklist_items(category);
CREATE INDEX idx_checklist_items_mandatory ON public.checklist_items(mandatory);

-- Enable Row Level Security
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies
-- Users can manage their own checklist
DROP POLICY IF EXISTS "Users can manage own checklist" ON public.checklist_items;
CREATE POLICY "Users can manage own checklist" ON public.checklist_items
  FOR ALL USING (auth.uid() = user_id);

-- Admins can see all checklists
DROP POLICY IF EXISTS "Admins can view all checklists" ON public.checklist_items;
CREATE POLICY "Admins can view all checklists" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Readiness Calculation Function
CREATE OR REPLACE FUNCTION public.calculate_readiness_status(user_uuid UUID)
RETURNS TABLE (total_mandatory INTEGER, checked_mandatory INTEGER, is_ready BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_mandatory,
    COUNT(CASE WHEN checked = true THEN 1 END)::INTEGER as checked_mandatory,
    COUNT(CASE WHEN checked = true THEN 1 END) = COUNT(*) as is_ready
  FROM public.checklist_items
  WHERE user_id = user_uuid
    AND mandatory = true
    AND id IN (
      'doc_001', 'doc_002', 'doc_005',
      'mon_001', 'mon_002',
      'div_001', 'div_002', 'div_003', 'div_004', 'div_005', 'div_006', 'div_007', 'div_008',
      'footwear_006',
      'hea_001', 'hea_003', 'hea_004', 'hea_012'
    );
END;
$$ LANGUAGE plpgsql;
