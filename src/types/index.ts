export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  bugCount: number;
  memberCount: number;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'testing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  assignee: string;
  dueDate: string;
  labels: string[];
  attachments: string[];
  reporter: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'bug_created' | 'bug_resolved' | 'bug_assigned' | 'comment' | 'project_created' | 'member_joined';
  message: string;
  user: string;
  timestamp: string;
}

export interface Stats {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  activeProjects: number;
  teamMembers: number;
  criticalBugs: number;
}

export type Theme = 'dark' | 'light';

export const BUG_STATUSES = ['todo', 'in_progress', 'testing', 'resolved', 'closed'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const;
