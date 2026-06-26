import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useData } from '../../contexts/DataContext';
import { formatTimeAgo } from '../../lib/utils';
import type { Issue } from '../../types';
import { ISSUE_STATUSES, SEVERITY_COLORS } from '../../types';

const statusConfig: Record<string, { label: string; bar: string }> = {
  detected: { label: 'Detected', bar: 'bg-gray-500' },
  assigned: { label: 'Assigned', bar: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bar: 'bg-purple-500' },
  testing: { label: 'Testing', bar: 'bg-orange-500' },
  resolved: { label: 'Resolved', bar: 'bg-green-500' },
  closed: { label: 'Closed', bar: 'bg-gray-500' },
};

function IssueCard({ issue, dragging }: { issue: Issue; dragging?: boolean }) {
  const navigate = useNavigate();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => !dragging && navigate(`/dashboard/bugs/${issue.id}`)}
    >
      <div className="p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] hover:border-blue-500/30 transition-all duration-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${SEVERITY_COLORS[issue.severity] || ''}`}>
            {issue.severity}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{issue.type.replace(/_/g, ' ')}</span>
        </div>
        <h4 className="text-sm font-medium text-[var(--text-primary)] leading-snug line-clamp-2">{issue.title}</h4>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[120px]">{issue.filePath}</span>
          <span className="text-[10px] text-[var(--text-tertiary)]">{formatTimeAgo(issue.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function Column({ status, issues }: { status: string; issues: Issue[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = statusConfig[status];

  return (
    <div className="flex flex-col rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${config.bar}`} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{config.label}</h3>
          </div>
          <span className="text-xs font-mono text-[var(--text-tertiary)] bg-[#21262D] px-2 py-0.5 rounded">
            {issues.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto transition-colors ${isOver ? 'bg-blue-500/5' : ''}`}
      >
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
        {issues.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-[var(--text-tertiary)]">
            No issues
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { issues, updateIssue } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeIssue = activeId ? issues.find(i => i.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id as string;
    const targetStatus = over.id as Issue['status'];

    if (ISSUE_STATUSES.includes(targetStatus as any)) {
      updateIssue(issueId, { status: targetStatus });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 min-h-[600px]">
        {ISSUE_STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            issues={issues.filter(i => i.status === status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="rotate-3 opacity-90">
            <IssueCard issue={activeIssue} dragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
