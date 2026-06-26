import { motion } from 'framer-motion';
import { Plus, Mail, MoreHorizontal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const teamMembers = [
  { id: '1', name: 'Alex Chen', role: 'Lead Developer', email: 'alex@devflow.dev', status: 'active', projects: 4, avatar: 'AC' },
  { id: '2', name: 'Sarah Kim', role: 'Frontend Developer', email: 'sarah@devflow.dev', status: 'active', projects: 3, avatar: 'SK' },
  { id: '3', name: 'Marcus Johnson', role: 'Backend Developer', email: 'marcus@devflow.dev', status: 'active', projects: 3, avatar: 'MJ' },
  { id: '4', name: 'Emily Rodriguez', role: 'UI/UX Designer', email: 'emily@devflow.dev', status: 'active', projects: 2, avatar: 'ER' },
  { id: '5', name: 'David Wilson', role: 'DevOps Engineer', email: 'david@devflow.dev', status: 'active', projects: 2, avatar: 'DW' },
  { id: '6', name: 'Lisa Park', role: 'QA Engineer', email: 'lisa@devflow.dev', status: 'away', projects: 2, avatar: 'LP' },
];

export default function Team() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Team</h1>
          <p className="text-[var(--text-secondary)]">Manage your team members and their roles</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Invite Member
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Member</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Projects</th>
                <th className="text-right p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[var(--border-secondary)] hover:bg-[#21262D]/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{member.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">{member.role}</td>
                  <td className="p-4">
                    <Badge value={member.status} variant="status" />
                  </td>
                  <td className="p-4 text-sm text-[var(--text-tertiary)] font-mono">{member.projects} projects</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
