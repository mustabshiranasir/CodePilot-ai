export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status?: 'active' | 'away' | 'offline';
}

export interface Repository {
  id: string;
  name: string;
  url?: string;
  type: 'github' | 'upload';
  ownerId: string;
  description?: string;
  language?: string;
  stars?: number;
  defaultBranch?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpload {
  id: string;
  repositoryId: string;
  userId: string;
  fileName: string;
  fileSize?: number;
  fileType: 'zip' | 'github';
  status: 'uploaded' | 'processing' | 'scanned' | 'failed';
  totalFiles: number;
  createdAt: string;
}

export interface CodeScan {
  id: string;
  repositoryId: string;
  uploadId?: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  totalFiles: number;
  totalIssues: number;
  resolvedIssues: number;
  codeQualityScore: number;
  securityScore: number;
  performanceScore: number;
  teamProductivityScore: number;
  improvementScore: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  scanId: string;
  repositoryId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'code_quality' | 'security' | 'performance' | 'architecture';
  category: string;
  filePath: string;
  codeSnippet: string;
  rootCause: string;
  aiExplanation: string;
  recommendedFix: string;
  assignee: string;
  assigneeId?: string;
  status: 'detected' | 'assigned' | 'in_progress' | 'testing' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  author: string;
  userId?: string;
  content: string;
  mentions: string[];
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'scan_started' | 'scan_completed' | 'issue_detected' | 'issue_assigned' | 'issue_resolved' | 'issue_closed' | 'comment' | 'repository_connected' | 'project_uploaded' | 'scan_failed';
  message: string;
  userId: string;
  userName?: string;
  issueId?: string;
  repositoryId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'issue_assigned' | 'scan_completed' | 'issue_resolved' | 'new_issue' | 'comment' | 'mention';
  message: string;
  issueId?: string;
  read: boolean;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  name: string;
  role: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface Stats {
  totalRepositories: number;
  totalScans: number;
  totalIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  codeQualityScore: number;
  securityScore: number;
  performanceScore: number;
}

export interface SecurityReport {
  id: string;
  scanId: string;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  exposedKeys: number;
  sqlInjections: number;
  authBypass: number;
  insecureJwt: number;
  missingValidation: number;
  createdAt: string;
}

export type Theme = 'dark' | 'light';

export const ISSUE_TYPES = ['code_quality', 'security', 'performance', 'architecture'] as const;
export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const ISSUE_STATUSES = ['detected', 'assigned', 'in_progress', 'testing', 'resolved', 'closed'] as const;
export const SCAN_STATUSES = ['pending', 'scanning', 'completed', 'failed'] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-500/10 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  code_quality: 'Code Quality',
  security: 'Security',
  performance: 'Performance',
  architecture: 'Architecture',
};
