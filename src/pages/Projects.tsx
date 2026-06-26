import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Users, Bug } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import type { Project } from '../types';

const mockProjects: Project[] = [
  { id: '1', name: 'Frontend App', description: 'React-based dashboard application', status: 'active', createdAt: '2026-01-15', bugCount: 23, memberCount: 4 },
  { id: '2', name: 'API Gateway', description: 'Microservices API gateway service', status: 'active', createdAt: '2026-02-01', bugCount: 12, memberCount: 3 },
  { id: '3', name: 'Mobile App', description: 'React Native mobile application', status: 'active', createdAt: '2026-03-10', bugCount: 31, memberCount: 5 },
  { id: '4', name: 'Legacy System', description: 'Legacy monolith migration project', status: 'archived', createdAt: '2025-11-20', bugCount: 5, memberCount: 2 },
  { id: '5', name: 'Data Pipeline', description: 'Real-time data processing pipeline', status: 'active', createdAt: '2026-04-05', bugCount: 8, memberCount: 3 },
  { id: '6', name: 'Design System', description: 'Shared UI component library', status: 'active', createdAt: '2026-05-01', bugCount: 15, memberCount: 2 },
];

export default function Projects() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="text-[var(--text-secondary)]">Manage your development projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border-primary)] p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="interactive" className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-blue-400" />
                    </div>
                    <Badge value={project.status} variant="status" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{project.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Bug className="h-3.5 w-3.5" /> {project.bugCount} bugs
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {project.memberCount} members
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
