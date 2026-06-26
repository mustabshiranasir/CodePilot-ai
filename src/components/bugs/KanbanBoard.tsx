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
import { getPriorityBg, formatTimeAgo } from '../../lib/utils';
import type { Bug } from '../../types';
import { BUG_STATUSES } from '../../types';

const statusConfig: Record<string, { label: string; bar: string }> = {
  todo: { label: 'Todo', bar: 'bg-gray-500' },
  in_progress: { label: 'In Progress', bar: 'bg-blue-500' },
  testing: { label: 'Testing', bar: 'bg-purple-500' },
  resolved: { label: 'Resolved', bar: 'bg-green-500' },
  closed: { label: 'Closed', bar: 'bg-gray-500' },
};

function BugCard({ bug, dragging }: { bug: Bug; dragging?: boolean }) {
  const navigate = useNavigate();

  return (
    <div
      className={`group cursor-pointer ${dragging ? '' : ''}`}
      onClick={() => !dragging && navigate(`/dashboard/bugs/${bug.id}`)}
    >
      <div className="p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] hover:border-blue-500/30 transition-all duration-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-mono text-[var(--text-tertiary)]">#{bug.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${getPriorityBg(bug.priority)}`}>
            {bug.priority}
          </span>
        </div>
        <h4 className="text-sm font-medium text-[var(--text-primary)] leading-snug line-clamp-2">{bug.title}</h4>
        <div className="flex flex-wrap gap-1">
          {bug.labels.slice(0, 3).map(l => (
            <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#21262D] text-[var(--text-tertiary)] border border-[var(--border-primary)]">
              {l}
            </span>
          ))}
          {bug.labels.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--text-tertiary)]">
              +{bug.labels.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[7px] font-bold">
              {bug.assignee.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">{bug.assignee}</span>
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">{formatTimeAgo(bug.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function Column({ status, bugs }: { status: string; bugs: Bug[] }) {
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
            {bugs.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto transition-colors ${isOver ? 'bg-blue-500/5' : ''}`}
      >
        {bugs.map(bug => (
          <BugCard key={bug.id} bug={bug} />
        ))}
        {bugs.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-[var(--text-tertiary)]">
            No bugs
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { bugs, moveBug } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeBug = activeId ? bugs.find(b => b.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const bugId = active.id as string;
    const targetStatus = over.id as Bug['status'];

    if (BUG_STATUSES.includes(targetStatus as any)) {
      moveBug(bugId, targetStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-[600px]">
        {BUG_STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            bugs={bugs.filter(b => b.status === status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeBug && (
          <div className="rotate-3 opacity-90">
            <BugCard bug={activeBug} dragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
