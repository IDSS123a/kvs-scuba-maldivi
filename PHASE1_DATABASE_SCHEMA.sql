-- =====================================================
-- PHASE 1.1 DATABASE SCHEMA REDESIGN
-- KVS Scuba Maldivi Application
-- =====================================================
-- Execution Order: CRITICAL - Execute sequentially
-- Dependencies: auth.users (Supabase managed)
-- =====================================================

-- =====================================================
-- TABLE 1: USERS
-- Description: Extends Supabase auth.users with application-specific fields
-- Dependencies: Requires auth.users to exist (created by Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  -- Primary Key and Foreign Key
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Information
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  
  -- Role and Status Management
  role VARCHAR(50) NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin', 'operator', 'auditor')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  
  -- Approval Workflow
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Profile Information
  avatar_url VARCHAR(500),
  bio TEXT,
  agency VARCHAR(100),
  
  -- Audit and Tracking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Data Integrity
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_agency ON public.users(agency);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- =====================================================
-- TABLE 2: ACCESS_REQUESTS
-- Description: Audit and approval workflow for user access
-- Dependencies: users table (created above)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Reference
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Request Details
  requested_role VARCHAR(50) NOT NULL
    CHECK (requested_role IN ('user', 'admin', 'operator', 'auditor')),
  request_type VARCHAR(50) NOT NULL
    CHECK (request_type IN ('access_grant', 'role_change', 'permission_update', 'access_revoke')),
  request_reason TEXT NOT NULL,
  
  -- Approval Workflow
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient queries
CREATE INDEX idx_access_requests_user_id ON public.access_requests(user_id);
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_requests_created_at ON public.access_requests(created_at);
CREATE INDEX idx_access_requests_requested_by ON public.access_requests(requested_by);

-- =====================================================
-- TABLE 3: PAYMENTS
-- Description: Payment tracking for two agencies with amount management
-- Dependencies: users table (created above)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and Agency Reference
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  processed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Agency Information
  agency_name VARCHAR(100) NOT NULL
    CHECK (agency_name IN ('Agency A', 'Agency B')),
  
  -- Payment Details
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL
    CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash', 'check')),
  
  -- Payment Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  
  -- Reference Information
  transaction_id VARCHAR(100) UNIQUE,
  invoice_number VARCHAR(100) UNIQUE,
  reference_code VARCHAR(100),
  
  -- Tracking and Audit
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Notes and Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient queries
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_agency_name ON public.payments(agency_name);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_payments_processed_by ON public.payments(processed_by);

-- =====================================================
-- TABLE 4: USER_ACTIVITY
-- Description: Comprehensive audit logging for user actions and system events
-- Dependencies: users table (created above)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_activity (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Reference
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Activity Tracking
  activity_type VARCHAR(100) NOT NULL
    CHECK (activity_type IN (
      'login', 'logout', 'profile_update', 'password_change', 
      'payment_created', 'payment_updated', 'access_requested', 
      'access_approved', 'access_rejected', 'file_upload', 'file_download',
      'report_generated', 'data_export', 'permission_change', 'role_change',
      'account_deactivated', 'account_reactivated', 'settings_changed'
    )),
  
  -- Activity Details
  description TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  
  -- Request Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  browser_fingerprint VARCHAR(255),
  
  -- Status and Result
  status VARCHAR(50) NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'failure', 'warning')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Tracking
  session_id VARCHAR(100),
  request_id VARCHAR(100)
);

-- Create indexes for efficient audit queries
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at);
CREATE INDEX idx_user_activity_status ON public.user_activity(status);
CREATE INDEX idx_user_activity_ip_address ON public.user_activity(ip_address);

-- =====================================================
-- TABLE 5: CHECKLIST_ITEMS
-- Description: Per-user checklist tracking with completion status and timestamps
-- Dependencies: users table (created above)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.checklist_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Reference
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Checklist Information
  category VARCHAR(100) NOT NULL
    CHECK (category IN (
      'profile_completion', 'document_verification', 'payment_setup',
      'training', 'compliance', 'onboarding', 'certification', 'other'
    )),
  
  -- Item Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  checklist_group VARCHAR(100),
  
  -- Status and Completion
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Completion Tracking
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Due Date Management
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional Metadata
  order_index INTEGER DEFAULT 0,
  evidence_url VARCHAR(500),
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient queries
CREATE INDEX idx_checklist_items_user_id ON public.checklist_items(user_id);
CREATE INDEX idx_checklist_items_status ON public.checklist_items(status);
CREATE INDEX idx_checklist_items_category ON public.checklist_items(category);
CREATE INDEX idx_checklist_items_is_completed ON public.checklist_items(is_completed);
CREATE INDEX idx_checklist_items_due_date ON public.checklist_items(due_date);
CREATE INDEX idx_checklist_items_created_at ON public.checklist_items(created_at);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================
CREATE POLICY users_select_policy ON public.users
  FOR SELECT USING (
    auth.uid() = id OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY users_insert_policy ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY users_update_policy ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- RLS POLICIES FOR ACCESS_REQUESTS TABLE
-- =====================================================
CREATE POLICY access_requests_select_policy ON public.access_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = requested_by OR
    auth.uid() = reviewed_by OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY access_requests_insert_policy ON public.access_requests
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
  );

-- =====================================================
-- RLS POLICIES FOR PAYMENTS TABLE
-- =====================================================
CREATE POLICY payments_select_policy ON public.payments
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = processed_by OR
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
  );

CREATE POLICY payments_insert_policy ON public.payments
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
  );

-- =====================================================
-- RLS POLICIES FOR USER_ACTIVITY TABLE
-- =====================================================
CREATE POLICY user_activity_select_policy ON public.user_activity
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'auditor')
  );

CREATE POLICY user_activity_insert_policy ON public.user_activity
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR CHECKLIST_ITEMS TABLE
-- =====================================================
CREATE POLICY checklist_items_select_policy ON public.checklist_items
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
  );

CREATE POLICY checklist_items_insert_policy ON public.checklist_items
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
  );

CREATE POLICY checklist_items_update_policy ON public.checklist_items
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
  );

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- All tables created with:
-- ✓ Proper PRIMARY and FOREIGN KEY constraints
-- ✓ CHECK constraints for role and status fields
-- ✓ DEFAULT values and UNIQUE constraints
-- ✓ Comprehensive timestamp handling
-- ✓ Efficient indexes for common queries
-- ✓ Row Level Security (RLS) policies enabled
-- ✓ Proper execution order and dependencies
-- =====================================================
