import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, MoreHorizontal, Pencil, Trash2, Shield, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useData } from '../contexts/DataContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'away' | 'offline';
  projects: number;
  avatar: string;
}

const teamMembers: TeamMember[] = [
  { id: '1', name: 'Alex Chen', role: 'Lead Developer', email: 'alex@devflow.dev', status: 'active', projects: 4, avatar: 'AC' },
  { id: '2', name: 'Sarah Kim', role: 'Frontend Developer', email: 'sarah@devflow.dev', status: 'active', projects: 3, avatar: 'SK' },
  { id: '3', name: 'Marcus Johnson', role: 'Backend Developer', email: 'marcus@devflow.dev', status: 'active', projects: 3, avatar: 'MJ' },
  { id: '4', name: 'Emily Rodriguez', role: 'UI/UX Designer', email: 'emily@devflow.dev', status: 'active', projects: 2, avatar: 'ER' },
  { id: '5', name: 'David Wilson', role: 'DevOps Engineer', email: 'david@devflow.dev', status: 'active', projects: 2, avatar: 'DW' },
  { id: '6', name: 'Lisa Park', role: 'QA Engineer', email: 'lisa@devflow.dev', status: 'away', projects: 2, avatar: 'LP' },
];

export default function Team() {
  const { addToast } = useToast();
  const { bugs } = useData();
  const [members] = useState(teamMembers);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleInvite = () => addToast('success', 'Invitation sent successfully');

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMemberBugCount = (name: string) => bugs.filter(b => b.assignee === name).length;
  const getMemberResolved = (name: string) => bugs.filter(b => b.assignee === name && (b.status === 'resolved' || b.status === 'closed')).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Team</h1>
          <p className="text-[var(--text-secondary)]">Manage your team members and their roles</p>
        </div>
        <Button onClick={handleInvite}><Plus className="h-4 w-4" /> Invite Member</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Team Members', value: members.length, icon: User, color: 'text-blue-400' },
          { label: 'Active Now', value: members.filter(m => m.status === 'active').length, icon: User, color: 'text-green-400' },
          { label: 'Total Assigned Bugs', value: members.reduce((sum, m) => sum + getMemberBugCount(m.name), 0), icon: Mail, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">{stat.value}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-30`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Member</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Bugs</th>
                <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Projects</th>
                <th className="text-right p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => {
                const bugCount = getMemberBugCount(member.name);
                const resolved = getMemberResolved(member.name);
                return (
                  <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                    className="border-b border-[var(--border-secondary)] hover:bg-[#21262D]/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{member.avatar}</div>
                          <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ${getStatusDot(member.status)} border-2 border-[var(--bg-secondary)]`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{member.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{member.role}</td>
                    <td className="p-4"><Badge value={member.status} variant="status" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-secondary)] font-mono">{bugCount} assigned</span>
                        <span className="text-xs text-[var(--text-tertiary)]">({resolved} resolved)</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)] font-mono">{member.projects} projects</td>
                    <td className="p-4 text-right relative">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
                        <div className="relative">
                          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {menuOpen === member.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-8 w-40 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-xl z-20 py-1">
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]"><Pencil className="h-3.5 w-3.5" /> Edit Role</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]"><Shield className="h-3.5 w-3.5" /> Change Role</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
