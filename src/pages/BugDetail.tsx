import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Clock, Trash2, AlertTriangle, Activity, FileCode, Cpu, MapPin, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CommentSection } from '../components/bugs/CommentSection';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/ui/Toast';
import { formatTimeAgo } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';
import { SEVERITY_COLORS } from '../types';
import { cn } from '../lib/utils';

function extractLineNumber(desc: string): number | null {
  const m = desc.match(/line\s+(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

const statusFlow = ['detected', 'assigned', 'in_progress', 'testing', 'resolved', 'closed'];

export default function BugDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { issues, activities, updateIssue, deleteIssue, loading } = useData();
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(true);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-6 w-24 mb-6" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  const issue = issues.find(i => i.id === id);
  const issueActivities = activities.filter(a => a.issueId === id).slice(0, 10);

  if (!issue) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Issue not found</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">The issue you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/dashboard/bugs')}>Back to Issues</Button>
      </div>
    );
  }

  const lineNumber = extractLineNumber(issue.description);
  const statusIndex = statusFlow.indexOf(issue.status);

  const handleDelete = () => {
    deleteIssue(issue.id);
    addToast('success', 'Issue deleted successfully');
    navigate('/dashboard/bugs');
  };

  const handleStatusChange = (newStatus: string) => {
    updateIssue(issue.id, { status: newStatus as any });
    addToast('success', `Issue moved to ${newStatus.replace(/_/g, ' ')}`);
  };

  return (
    <div>
      <button onClick={() => navigate('/dashboard/bugs')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Issues
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge value={issue.status} variant="status" />
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border', SEVERITY_COLORS[issue.severity])}>
                    {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    {issue.type.replace(/_/g, ' ')}
                  </span>
                  {lineNumber && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Line {lineNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{issue.title}</h1>
                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {issue.assignee || 'Unassigned'}</span>
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {issue.category?.replace(/_/g, ' ') || '—'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTimeAgo(issue.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </div>

            {/* Status Progress */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
              {statusFlow.map((s, i) => {
                const isCurrent = issue.status === s;
                const isPassed = statusIndex >= i;
                return (
                  <button key={s} onClick={() => handleStatusChange(s)} className="flex items-center gap-1 group/step">
                    <span className={cn('flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap',
                      isCurrent ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' :
                      isPassed ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                      'border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-blue-500/30 hover:text-blue-400')}>
                      {isPassed ? <CheckCircle className="h-3 w-3" /> : <span className="h-3 w-3" />}
                      {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                    {i < statusFlow.length - 1 && (
                      <ArrowRight className={cn('h-3 w-3 shrink-0', isPassed ? 'text-green-500/50' : 'text-[var(--text-tertiary)]')} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-5">
                {/* What's Wrong - Description */}
                <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> WHAT'S WRONG
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{issue.description}</p>
                </div>

                {/* Code Snippet */}
                {issue.codeSnippet && (
                  <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#21262D] border-b border-[var(--border-primary)]">
                      <span className="text-xs font-mono text-[var(--text-tertiary)] flex items-center gap-2">
                        <FileCode className="h-3.5 w-3.5" /> {issue.filePath}
                        {lineNumber && <span className="text-blue-400">:L{lineNumber}</span>}
                      </span>
                    </div>
                    <pre className="p-4 text-sm text-[var(--text-secondary)] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">{issue.codeSnippet}</pre>
                  </div>
                )}

                {/* AI Analysis */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                  <button onClick={() => setShowAIAnalysis(!showAIAnalysis)} className="w-full flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Cpu className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-blue-400">AI Analysis</h3>
                        <p className="text-xs text-blue-400/60">Root cause & fix recommendation</p>
                      </div>
                    </div>
                    <span className={`text-blue-400 transition-transform ${showAIAnalysis ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {showAIAnalysis && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="p-4 rounded-xl bg-[#0D1117]/50 border border-orange-500/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-orange-400">
                          <Lightbulb className="h-3.5 w-3.5" /> WHY THIS HAPPENED
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{issue.rootCause || 'No root cause analysis available for this issue.'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0D1117]/50 border border-blue-500/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                          <Cpu className="h-3.5 w-3.5" /> DETAILED EXPLANATION
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{issue.aiExplanation || 'No detailed explanation available for this issue.'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" /> HOW TO FIX IT
                        </div>
                        <pre className="text-sm text-[var(--text-secondary)] font-mono text-xs whitespace-pre-wrap leading-relaxed">{issue.recommendedFix || 'No fix recommendation available for this issue.'}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <CommentSection bugId={issue.id} />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] space-y-3 divide-y divide-[var(--border-secondary)]">
                  <div className="flex items-center gap-3 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Assignee</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{issue.assignee || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Category</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{issue.category?.replace(/_/g, ' ') || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <FileCode className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">File</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] font-mono text-xs truncate max-w-[160px]" title={issue.filePath}>{issue.filePath}</p>
                    </div>
                  </div>
                  {lineNumber && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Line Number</p>
                        <p className="text-sm font-medium text-[var(--text-primary)] font-mono">{lineNumber}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-8 w-8 rounded-lg bg-[#21262D] flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Detected</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{formatTimeAgo(issue.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-3">
                    <div className="h-8 w-8 rounded-lg bg-[#21262D] flex items-center justify-center">
                      <Clock className="h-4 w-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Last updated</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{formatTimeAgo(issue.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-400" /> Activity
                  </h3>
                  <div className="space-y-2">
                    {issueActivities.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)]">No activity recorded yet</p>
                    ) : (
                      issueActivities.map(a => (
                        <div key={a.id} className="flex items-start gap-2 text-xs">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-[var(--text-secondary)]">{a.message}</p>
                            <p className="text-[var(--text-tertiary)] text-[10px]">{formatTimeAgo(a.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete}
        title="Delete Issue?" message="This action cannot be undone. This issue and all its comments will be permanently deleted."
        confirmLabel="Delete" variant="danger" />
    </div>
  );
}
