import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Repository, CodeScan, Issue, IssueComment, Activity, Notification, ProjectUpload, Stats, TeamMember } from '../types';
import { useAuth } from './AuthContext';
import { repositoryService } from '../lib/services/repositories';
import { scanService } from '../lib/services/scans';
import { issueService } from '../lib/services/issues';
import { commentService } from '../lib/services/comments';
import { activityService } from '../lib/services/activities';
import { notificationService } from '../lib/services/notifications';
import { uploadService } from '../lib/services/uploads';
import { runScan, calculateScores, parseFileTree } from '../lib/scanEngine';
import { teamService } from '../lib/services/team';
import { securityReportService } from '../lib/services/securityReports';
import { supabase } from '../lib/supabase';

interface FileCacheEntry {
  content: string;
  scanId: string;
}

interface DataContextType {
  repositories: Repository[];
  scans: CodeScan[];
  issues: Issue[];
  comments: IssueComment[];
  activities: Activity[];
  notifications: Notification[];
  uploads: ProjectUpload[];
  stats: Stats;
  loading: boolean;
  error: string | null;

  addRepository: (data: any) => Promise<void>;
  deleteRepository: (id: string) => Promise<void>;

  startScan: (repoId: string, files: { path: string; content: string }[]) => Promise<CodeScan>;
  updateIssue: (id: string, data: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;

  addComment: (issueId: string, author: string, content: string, mentions: string[]) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  unreadCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [scans, setScans] = useState<CodeScan[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [uploads, setUploads] = useState<ProjectUpload[]>([]);
  const [fileCache, setFileCache] = useState<Map<string, FileCacheEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [repoData, scanData, issueData, activityData, uploadData] = await Promise.all([
        repositoryService.getAll(),
        scanService.getAll(),
        issueService.getAll(),
        activityService.getAll(),
        uploadService.getAll(),
      ]);
      setRepositories(repoData);
      setScans(scanData);
      setIssues(issueData);
      setActivities(activityData);
      setUploads(uploadData);

      const notifData = await notificationService.getByUserId(user.id);
      setNotifications(notifData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const notifyUser = useCallback(async (userId: string, prefKey: string, type: Notification['type'], message: string, issueId?: string) => {
    try {
      const { data } = await supabase.from('profiles').select('notification_prefs').eq('id', userId).single();
      const prefs = (data?.notification_prefs || {}) as Record<string, boolean>;
      if (prefs[prefKey] === false) return;
      const created = await notificationService.create({ userId, type, message, issueId, read: false });
      setNotifications(prev => {
        if (prev.some(n => n.id === created.id)) return prev;
        return [created, ...prev];
      });
    } catch (e) {
      console.error(`[notify] Failed for ${userId} (${prefKey}):`, e);
    }
  }, []);

  const resolveUserName = useCallback(async (name: string): Promise<string | null> => {
    const { data } = await supabase.from('profiles').select('id').eq('name', name).maybeSingle();
    return data?.id || null;
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('db-changes');

    channel.on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'code_scans' }, (payload: any) => {
      const scan = payload.new as CodeScan;
      setScans(prev => {
        if (prev.some(s => s.id === scan.id)) return prev;
        return [scan, ...prev];
      });
    });

    channel.on('postgres_changes' as any, { event: 'UPDATE', schema: 'public', table: 'code_scans' }, (payload: any) => {
      const updated = payload.new as CodeScan;
      setScans(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
    });

    channel.on('postgres_changes' as any, { event: 'DELETE', schema: 'public', table: 'code_scans' }, (payload: any) => {
      setScans(prev => prev.filter(s => s.id !== payload.old.id));
    });

    channel.on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'issues' }, (payload: any) => {
      const issue = payload.new as Issue;
      setIssues(prev => {
        if (prev.some(i => i.id === issue.id)) return prev;
        return [issue, ...prev];
      });
    });

    channel.on('postgres_changes' as any, { event: 'UPDATE', schema: 'public', table: 'issues' }, (payload: any) => {
      const updated = payload.new as Issue;
      setIssues(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    });

    channel.on('postgres_changes' as any, { event: 'DELETE', schema: 'public', table: 'issues' }, (payload: any) => {
      setIssues(prev => prev.filter(i => i.id !== payload.old.id));
    });

    channel.on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'activities' }, (payload: any) => {
      const activity = payload.new as Activity;
      setActivities(prev => {
        if (prev.some(a => a.id === activity.id)) return prev;
        return [activity, ...prev];
      });
    });

    channel.on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
      const raw = payload.new as any;
      if (raw.user_id !== user.id) return;
      const notif: Notification = {
        id: raw.id, userId: raw.user_id, type: raw.type, message: raw.message,
        issueId: raw.issue_id, read: raw.read, createdAt: raw.created_at,
      };
      setNotifications(prev => {
        if (prev.some(n => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
    });

    channel.subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addActivity = useCallback(async (a: Omit<Activity, 'id' | 'createdAt'>) => {
    try { const c = await activityService.create(a); setActivities(prev => [c, ...prev]); } catch (e) { console.error('[activity] Failed to create:', e); }
  }, []);

  const addRepository = useCallback(async (data: any) => {
    const created = await repositoryService.create({ ...data, ownerId: user?.id || '' });
    setRepositories(prev => [created, ...prev]);
    await addActivity({ type: 'repository_connected', message: `Repository "${data.name}" connected`, userId: user?.id || '', userName: user?.name, repositoryId: created.id });
  }, [user, addActivity]);

  const deleteRepository = useCallback(async (id: string) => {
    await repositoryService.delete(id);
    setRepositories(prev => prev.filter(r => r.id !== id));
    setScans(prev => prev.filter(s => s.repositoryId !== id));
    setIssues(prev => prev.filter(i => i.repositoryId !== id));
  }, []);

  const startScan = useCallback(async (repoId: string, files: { path: string; content: string }[]) => {
    if (!user) throw new Error('Not authenticated');

    const parsed = parseFileTree(files);

    const scan = await scanService.create({
      repositoryId: repoId, status: 'scanning', totalFiles: parsed.length,
      totalIssues: 0, resolvedIssues: 0, codeQualityScore: 0, securityScore: 0,
      performanceScore: 0, teamProductivityScore: 0, improvementScore: 0,
      startedAt: new Date().toISOString(),
    });
    setScans(prev => [scan, ...prev]);
    setFileCache(prev => {
      const next = new Map(prev);
      parsed.forEach(f => next.set(`${repoId}:${f.path}`, { content: f.content, scanId: scan.id }));
      return next;
    });
    // Record the upload
    try {
      const upload = await uploadService.create({
        repositoryId: repoId, userId: user.id, fileName: `scan-${Date.now()}.zip`,
        fileType: 'github', status: 'processing', totalFiles: parsed.length,
      });
      await scanService.update(scan.id, { uploadId: upload.id });
      setUploads(prev => [upload, ...prev]);
    } catch (e) { console.error('[upload] Failed to create/update upload:', e); }
    await addActivity({ type: 'scan_started', message: `Scan started for ${parsed.length} files`, userId: user.id, userName: user.name, repositoryId: repoId });

    const detectedIssues = runScan(parsed, scan.id, repoId);

    // Assign issues to actual team members by role
    let teamMembers: TeamMember[] = [];
    try {
      teamMembers = await teamService.getAll();
      console.log(`[assign] Fetched ${teamMembers.length} team members`);
      teamMembers.forEach(m => console.log(`[assign]   "${m.name}" role="${m.role}" id="${m.id}"`));
    } catch (e) {
      console.warn('[assign] Failed to fetch team members:', e);
    }
    const membersByRole: Record<string, TeamMember[]> = {};
    const counter: Record<string, number> = {};
    teamMembers.forEach(m => {
      const key = m.role;
      if (!membersByRole[key]) membersByRole[key] = [];
      membersByRole[key].push(m);
    });
    console.log(`[assign] Role groups:`, Object.fromEntries(Object.entries(membersByRole).map(([k, v]) => [k, v.map(m => m.name)])));
    const allMembers = teamMembers.length > 0 ? teamMembers : null;
    const assignedIssues = detectedIssues.map(issue => {
      const role = issue.assignee;
      console.log(`[assign] Issue needs role "${role}"`);
      let pool = membersByRole[role] || [];
      if (pool.length === 0) {
        console.log(`[assign]   No member with role "${role}", falling back to all ${(allMembers||[]).length} members`);
        pool = allMembers || [];
      }
      if (pool.length > 0) {
        counter[role] = (counter[role] || 0) + 1;
        const member = pool[(counter[role] - 1) % pool.length];
        console.log(`[assign]   → ${member.name} (idx ${(counter[role]-1) % pool.length})`);
        return { ...issue, assignee: member.name, assigneeId: member.id };
      }
      console.log(`[assign]   → NO members available, leaving unassigned`);
      return issue;
    });
    const assignedCount = assignedIssues.filter(i => i.assigneeId).length;
    console.log(`[assign] Assigned ${assignedCount}/${assignedIssues.length} issues`);

    const scores = calculateScores(assignedIssues);

    let createdIssues: Issue[] = [];
    try {
      createdIssues = await issueService.createMany(assignedIssues);
    } catch (err: any) {
      console.error('Failed to store issues:', err, { repoId, scanId: scan.id, detectedIssues });
      await scanService.update(scan.id, { status: 'failed' });
      throw new Error(`Failed to store issues: ${err?.message || err}`);
    }
    setIssues(prev => [...createdIssues, ...prev]);

    const updatedScan = await scanService.update(scan.id, {
      status: 'completed', totalIssues: createdIssues.length, completedAt: new Date().toISOString(),
      ...scores,
    });
    setScans(prev => prev.map(s => s.id === scan.id ? updatedScan : s));

    if (createdIssues.length > 0) {
      await addActivity({ type: 'scan_completed', message: `Scan completed: ${createdIssues.length} issues found`, userId: user.id, userName: user.name, repositoryId: repoId });
    }
    await notifyUser(user.id, 'status', 'scan_completed', `Scan completed: ${createdIssues.length} issues in ${parsed.length} files`);

    // Create security report
    try {
      const secIssues = createdIssues.filter(i => i.type === 'security');
      await securityReportService.create({
        scanId: scan.id,
        totalVulnerabilities: secIssues.length,
        criticalCount: secIssues.filter(i => i.severity === 'critical').length,
        highCount: secIssues.filter(i => i.severity === 'high').length,
        mediumCount: secIssues.filter(i => i.severity === 'medium').length,
        lowCount: secIssues.filter(i => i.severity === 'low').length,
        exposedKeys: secIssues.filter(i => i.category === 'exposed_secrets').length,
        sqlInjections: secIssues.filter(i => i.category === 'sql_injection').length,
        authBypass: secIssues.filter(i => i.category === 'missing_auth').length,
        insecureJwt: 0,
        missingValidation: secIssues.filter(i => i.category === 'dependency_vulnerability').length,
      });
    } catch (e) { console.error('[security] Failed to create security report:', e); }
    return updatedScan;
  }, [user, addActivity, notifyUser]);

  const updateIssue = useCallback(async (id: string, data: Partial<Issue>) => {
    const updated = await issueService.update(id, data);
    setIssues(prev => prev.map(i => i.id === id ? updated : i));
    if (data.status === 'resolved' || data.status === 'closed') {
      await addActivity({ type: 'issue_resolved', message: `Issue "${updated.title}" ${data.status}`, userId: user?.id || '', userName: user?.name, issueId: id });
      if (updated.assigneeId) {
        await notifyUser(updated.assigneeId, 'status', 'issue_resolved', `Issue "${updated.title}" ${data.status}`, id);
      }
      const scan = scans.find(s => s.id === updated.scanId);
      if (scan) {
        const newResolved = scan.resolvedIssues + 1;
        const repoIssues = issues.filter(i => i.repositoryId === updated.repositoryId);
        const scores = calculateScores(repoIssues.map(i => i.id === id ? { ...i, status: data.status! } : i));
        await scanService.update(scan.id, { resolvedIssues: newResolved, ...scores });
        setScans(prev => prev.map(s => s.id === scan.id ? { ...s, resolvedIssues: newResolved, ...scores } : s));

        // Auto-rescan resolved file if we have cached content
        const cacheKey = `${updated.repositoryId}:${updated.filePath}`;
        const cached = fileCache.get(cacheKey);
        if (cached && user) {
          const file = { name: updated.filePath.split('/').pop() || updated.filePath, path: updated.filePath, content: cached.content };
          const rescannedIssues = runScan([file], scan.id, updated.repositoryId);
          const stillPresent = rescannedIssues.filter(ri =>
            ri.title === updated.title || ri.category === updated.category
          );
          if (stillPresent.length === 0) {
            await addActivity({ type: 'issue_resolved', message: `Rescan confirmed: "${updated.title}" is fixed in ${updated.filePath}`, userId: user.id, userName: user.name, issueId: id });
          } else {
            await addActivity({ type: 'issue_resolved', message: `Rescan: "${updated.title}" may still have issues in ${updated.filePath}`, userId: user.id, userName: user.name, issueId: id });
          }
        }
      }
    } else if (data.status === 'assigned') {
      await addActivity({ type: 'issue_assigned', message: `Issue "${updated.title}" assigned to ${updated.assignee}`, userId: user?.id || '', userName: user?.name, issueId: id });
      if (updated.assigneeId) {
        await notifyUser(updated.assigneeId, 'assigned', 'issue_assigned', `Issue "${updated.title}" assigned to you`, id);
      }
    } else if (data.status === 'in_progress' || data.status === 'testing') {
      await addActivity({ type: 'scan_started', message: `Issue "${updated.title}" moved to ${data.status}`, userId: user?.id || '', userName: user?.name, issueId: id });
    }
  }, [user, addActivity, scans, issues, fileCache, notifyUser]);

  const deleteIssue = useCallback(async (id: string) => {
    await issueService.delete(id);
    setIssues(prev => prev.filter(i => i.id !== id));
  }, []);

  const addComment = useCallback(async (issueId: string, author: string, content: string, mentions: string[]) => {
    const created = await commentService.create({ issueId, author, userId: user?.id, content, mentions });
    setComments(prev => [created, ...prev]);
    await addActivity({ type: 'comment', message: `${author} commented on issue`, userId: user?.id || '', userName: user?.name, issueId });
    const issue = issues.find(i => i.id === issueId);
    if (issue?.assigneeId) {
      await notifyUser(issue.assigneeId, 'comments', 'comment', `${author} commented on "${issue.title}"`, issueId);
    }
    for (const name of mentions) {
      const mentionedId = await resolveUserName(name);
      if (mentionedId) {
        await notifyUser(mentionedId, 'mentions', 'mention', `${author} mentioned you`, issueId);
      }
    }
  }, [user, addActivity, issues, notifyUser, resolveUserName]);

  const deleteComment = useCallback(async (id: string) => {
    await commentService.delete(id);
    setComments(prev => prev.filter(c => c.id !== id));
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(async () => {
    if (!user) return;
    await notificationService.deleteAll(user.id);
    setNotifications([]);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const stats: Stats = {
    totalRepositories: repositories.length,
    totalScans: scans.length,
    totalIssues: issues.length,
    resolvedIssues: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    criticalIssues: issues.filter(i => i.severity === 'critical').length,
    codeQualityScore: scans.length > 0 ? Math.round(scans.reduce((sum, s) => sum + (Number.isFinite(Number(s.codeQualityScore)) ? Number(s.codeQualityScore) : 0), 0) / scans.length) : 0,
    securityScore: scans.length > 0 ? Math.round(scans.reduce((sum, s) => sum + (Number.isFinite(Number(s.securityScore)) ? Number(s.securityScore) : 0), 0) / scans.length) : 0,
    performanceScore: scans.length > 0 ? Math.round(scans.reduce((sum, s) => sum + (Number.isFinite(Number(s.performanceScore)) ? Number(s.performanceScore) : 0), 0) / scans.length) : 0,
  };

  return (
    <DataContext.Provider value={{
      repositories, scans, issues, comments, activities, notifications, uploads, stats, loading, error,
      addRepository, deleteRepository, startScan, updateIssue, deleteIssue,
      addComment, deleteComment, markNotificationRead, clearNotifications, unreadCount,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
