-- CodePilot AI Database Schema
-- Run this in Supabase SQL Editor
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS

-- 1. Tables (idempotent)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'Developer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop FK constraint if present (team invites need profiles without auth.users)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles') THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL CHECK (type IN ('github', 'upload')),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  default_branch TEXT DEFAULT 'main',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL CHECK (file_type IN ('zip', 'github')),
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'scanned', 'failed')),
  total_files INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS code_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES project_uploads(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
  total_files INTEGER DEFAULT 0,
  total_issues INTEGER DEFAULT 0,
  resolved_issues INTEGER DEFAULT 0,
  code_quality_score NUMERIC(5,2) DEFAULT 0,
  security_score NUMERIC(5,2) DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0,
  team_productivity_score NUMERIC(5,2) DEFAULT 0,
  improvement_score NUMERIC(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES code_scans(id) ON DELETE CASCADE,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL CHECK (type IN ('code_quality', 'security', 'performance', 'architecture')),
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  code_snippet TEXT DEFAULT '',
  root_cause TEXT DEFAULT '',
  ai_explanation TEXT DEFAULT '',
  recommended_fix TEXT DEFAULT '',
  assignee TEXT DEFAULT 'Unassigned',
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'assigned', 'in_progress', 'testing', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  user_name TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES code_scans(id) ON DELETE CASCADE,
  total_vulnerabilities INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  exposed_keys INTEGER DEFAULT 0,
  sql_injections INTEGER DEFAULT 0,
  auth_bypass INTEGER DEFAULT 0,
  insecure_jwt INTEGER DEFAULT 0,
  missing_validation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Developer',
  invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 2. Fix columns if table already existed from old schema
ALTER TABLE issue_comments ADD COLUMN IF NOT EXISTS issue_id UUID REFERENCES issues(id) ON DELETE CASCADE;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS issue_id UUID REFERENCES issues(id) ON DELETE SET NULL;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS repository_id UUID REFERENCES repositories(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS issue_id UUID REFERENCES issues(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'Medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';

-- 3. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (idempotent)
-- Fix: drop old self-only update policy so team role management works across members
DROP POLICY IF EXISTS update_profiles ON profiles;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'view_profiles') THEN
    CREATE POLICY view_profiles ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'update_profiles') THEN
    CREATE POLICY update_profiles ON profiles FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'insert_profiles') THEN
    CREATE POLICY insert_profiles ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'delete_profiles') THEN
    CREATE POLICY delete_profiles ON profiles FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repositories' AND policyname = 'view_repositories') THEN
    CREATE POLICY view_repositories ON repositories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repositories' AND policyname = 'create_repositories') THEN
    CREATE POLICY create_repositories ON repositories FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repositories' AND policyname = 'update_repositories') THEN
    CREATE POLICY update_repositories ON repositories FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repositories' AND policyname = 'delete_repositories') THEN
    CREATE POLICY delete_repositories ON repositories FOR DELETE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issues' AND policyname = 'view_issues') THEN
    CREATE POLICY view_issues ON issues FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issues' AND policyname = 'update_issues') THEN
    CREATE POLICY update_issues ON issues FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issues' AND policyname = 'insert_issues') THEN
    CREATE POLICY insert_issues ON issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issue_comments' AND policyname = 'view_comments') THEN
    CREATE POLICY view_comments ON issue_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issue_comments' AND policyname = 'create_comments') THEN
    CREATE POLICY create_comments ON issue_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issue_comments' AND policyname = 'delete_comments') THEN
    CREATE POLICY delete_comments ON issue_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'view_activities') THEN
    CREATE POLICY view_activities ON activity_logs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'create_activities') THEN
    CREATE POLICY create_activities ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'view_notifications') THEN
    CREATE POLICY view_notifications ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'create_notifications') THEN
    CREATE POLICY create_notifications ON notifications FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'update_notifications') THEN
    CREATE POLICY update_notifications ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'delete_notifications') THEN
    CREATE POLICY delete_notifications ON notifications FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'code_scans' AND policyname = 'view_scans') THEN
    CREATE POLICY view_scans ON code_scans FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'code_scans' AND policyname = 'create_scans') THEN
    CREATE POLICY create_scans ON code_scans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'code_scans' AND policyname = 'update_scans') THEN
    CREATE POLICY update_scans ON code_scans FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_uploads' AND policyname = 'view_uploads') THEN
    CREATE POLICY view_uploads ON project_uploads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_uploads' AND policyname = 'create_uploads') THEN
    CREATE POLICY create_uploads ON project_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_reports' AND policyname = 'view_security') THEN
    CREATE POLICY view_security ON security_reports FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_reports' AND policyname = 'create_security') THEN
    CREATE POLICY create_security ON security_reports FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_reports' AND policyname = 'update_security') THEN
    CREATE POLICY update_security ON security_reports FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_reports' AND policyname = 'delete_security') THEN
    CREATE POLICY delete_security ON security_reports FOR DELETE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'view_invitations') THEN
    CREATE POLICY view_invitations ON invitations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'create_invitations') THEN
    CREATE POLICY create_invitations ON invitations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'update_invitations') THEN
    CREATE POLICY update_invitations ON invitations FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'delete_invitations') THEN
    CREATE POLICY delete_invitations ON invitations FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_repositories_owner ON repositories(owner_id);
CREATE INDEX IF NOT EXISTS idx_issues_scan ON issues(scan_id);
CREATE INDEX IF NOT EXISTS idx_issues_repo ON issues(repository_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_code_scans_repo ON code_scans(repository_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_issue ON activity_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 6. Backfill profiles for existing auth users (safe to re-run)
INSERT INTO public.profiles (id, name, email, avatar)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  ''
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Auto-create profile on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    ''
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
