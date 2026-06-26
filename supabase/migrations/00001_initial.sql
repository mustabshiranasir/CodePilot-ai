-- DevFlow Database Schema
-- Run ALL of this at once in the Supabase SQL Editor

-- 1. Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'Developer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS bugs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'testing', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  assignee TEXT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  labels TEXT[] DEFAULT '{}',
  reporter TEXT,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  author TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  user_name TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  bug_id UUID REFERENCES bugs(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (using DO block to avoid errors if they already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles') THEN
    CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can view all projects') THEN
    CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can create projects') THEN
    CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can update their projects') THEN
    CREATE POLICY "Users can update their projects" ON projects FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can delete their projects') THEN
    CREATE POLICY "Users can delete their projects" ON projects FOR DELETE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bugs' AND policyname = 'Users can view all bugs') THEN
    CREATE POLICY "Users can view all bugs" ON bugs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bugs' AND policyname = 'Users can create bugs') THEN
    CREATE POLICY "Users can create bugs" ON bugs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bugs' AND policyname = 'Users can update bugs') THEN
    CREATE POLICY "Users can update bugs" ON bugs FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bugs' AND policyname = 'Users can delete bugs') THEN
    CREATE POLICY "Users can delete bugs" ON bugs FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can view all comments') THEN
    CREATE POLICY "Users can view all comments" ON comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can create comments') THEN
    CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete own comments') THEN
    CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can create notifications') THEN
    CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete own notifications') THEN
    CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Users can view activity logs') THEN
    CREATE POLICY "Users can view activity logs" ON activity_logs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Users can create activity logs') THEN
    CREATE POLICY "Users can create activity logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Users can view project members') THEN
    CREATE POLICY "Users can view project members" ON project_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Project owners can manage members') THEN
    CREATE POLICY "Project owners can manage members" ON project_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Project owners can update members') THEN
    CREATE POLICY "Project owners can update members" ON project_members FOR UPDATE USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Project owners can delete members') THEN
    CREATE POLICY "Project owners can delete members" ON project_members FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid()));
  END IF;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_bugs_project_id ON bugs(project_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_priority ON bugs(priority);
CREATE INDEX IF NOT EXISTS idx_bugs_assignee_id ON bugs(assignee_id);
CREATE INDEX IF NOT EXISTS idx_comments_bug_id ON comments(bug_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_bug_id ON activity_logs(bug_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 5. Auto-create profile on signup
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
