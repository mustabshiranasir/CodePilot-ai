-- Drop legacy tables from old DevFlow schema (replaced by CodePilot AI equivalents)
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.bugs CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
