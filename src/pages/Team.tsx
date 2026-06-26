import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MoreHorizontal, Pencil, Trash2, Shield, User, Loader2,
  Users, Clock, CheckCircle, XCircle, Send, AlertTriangle, Search,
  Copy, UserPlus, Info, BarChart3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { teamService } from '../lib/services/team';
import { invitationService } from '../lib/services/invitations';
import type { TeamMember, Invitation } from '../types';
import { cn } from '../lib/utils';

export default function Team() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { issues } = useData();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'members' | 'invitations'>('members');
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Developer' });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
  const [removingInvite, setRemovingInvite] = useState<Invitation | null>(null);
  const [inviteResult, setInviteResult] = useState<{ type: 'existing' | 'new' | 'error'; email: string; name: string } | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, inv] = await Promise.all([
        teamService.getAll(),
        invitationService.getAll().catch(() => [] as Invitation[]),
      ]);
      setMembers(m);
      setInvitations(inv);
    } catch (err: any) {
      addToast('error', 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getStatusDot = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMemberIssueCount = (name: string) => issues.filter(i => i.assignee === name).length;
  const getMemberResolved = (name: string) => issues.filter(i => i.assignee === name && (i.status === 'resolved' || i.status === 'closed')).length;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      addToast('error', 'Name and email are required');
      return;
    }
    setInviting(true);
    setInviteResult(null);
    try {
      const existing = await teamService.findByEmail(inviteForm.email);
      if (existing) {
        setInviteResult({ type: 'existing', email: inviteForm.email, name: existing.name });
        addToast('success', `${existing.name} is already a team member`);
      } else {
          if (!user?.id) throw new Error('You must be logged in');
        try {
          const inv = await invitationService.create({
            email: inviteForm.email,
            name: inviteForm.name,
            role: inviteForm.role,
            invitedBy: user.id,
          });
          // Send email invite via Supabase Edge Function
          invitationService.sendEmailInvite({
            email: inviteForm.email,
            name: inviteForm.name,
            role: inviteForm.role,
            invitedByName: user?.name || 'A team member',
            invitationId: inv.id,
          }).then(res => {
            if (res?.skipped) addToast('info', 'Email not sent: RESEND_API_KEY not configured. Set it in Supabase Edge Function secrets.');
            else addToast('success', `Invitation email sent to ${inviteForm.email}`);
          }).catch(() => {
            addToast('info', 'Invitation created but email delivery unavailable. Configure Resend + Supabase Edge Functions to send emails.');
          });
          const updatedInvites = await invitationService.getAll().catch(() => []);
          setInvitations(updatedInvites);
          setInviteResult({ type: 'new', email: inviteForm.email, name: inviteForm.name });
          addToast('success', `Invitation sent to ${inviteForm.email}`);
        } catch (invErr: any) {
          if (invErr?.code === 'PGRST116' || invErr?.status === 404 || invErr?.message?.includes('relation') || invErr?.message?.includes('invitations')) {
            setInviteResult({ type: 'new', email: inviteForm.email, name: inviteForm.name });
            addToast('success', `Invitation recorded for ${inviteForm.email}. Run the database migration to enable invitation tracking.`);
          } else {
            throw invErr;
          }
        }
      }
    } catch (err: any) {
      setInviteResult({ type: 'error', email: inviteForm.email, name: inviteForm.name });
      addToast('error', err?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      await teamService.remove(removingMember.id);
      setMembers(prev => prev.filter(m => m.id !== removingMember.id));
      setRemovingMember(null);
      setMenuOpen(null);
      addToast('success', `${removingMember.name} removed from team`);
    } catch {
      addToast('error', 'Failed to remove member');
    }
  };

  const handleCancelInvite = async () => {
    if (!removingInvite) return;
    try {
      await invitationService.remove(removingInvite.id);
      setInvitations(prev => prev.filter(i => i.id !== removingInvite.id));
      setRemovingInvite(null);
      addToast('success', 'Invitation cancelled');
    } catch {
      addToast('error', 'Failed to cancel invitation');
    }
  };

  const handleRoleChange = async (member: TeamMember, newRole: string) => {
    try {
      await teamService.update(member.id, { role: newRole });
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m));
      setMenuOpen(null);
      addToast('success', `${member.name} role changed to ${newRole}`);
    } catch {
      addToast('error', 'Failed to update role');
    }
  };

  const saveRoleEdit = async () => {
    if (!editMember) return;
    try {
      await teamService.update(editMember.id, { role: editMember.role });
      setMembers(prev => prev.map(m => m.id === editMember.id ? { ...m, role: editMember.role } : m));
      setEditMember(null);
      addToast('success', 'Role updated');
    } catch {
      addToast('error', 'Failed to update role');
    }
  };

  const pendingInvites = invitations.filter(i => i.status === 'pending');
  const filteredMembers = members.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const roles = ['Developer', 'Lead Developer', 'Product Manager', 'Designer', 'Admin'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
            <div className="h-4 w-56 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-4 w-20 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%] mb-3" />
              <div className="h-8 w-16 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] animate-pulse bg-[length:200%_100%]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
                  <div className="h-3 w-24 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-400" />
            Team
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your team and invite collaborators</p>
        </div>
        <Button onClick={() => { setShowInvite(true); setInviteResult(null); setInviteForm({ name: '', email: '', role: 'Developer' }); }}>
          <UserPlus className="h-4 w-4" /> Invite Member
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Team Members', value: members.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Now', value: members.filter(m => m.status === 'active').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Pending Invites', value: pendingInvites.length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Assigned Issues', value: members.reduce((sum, m) => sum + getMemberIssueCount(m.name), 0), icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }}>
              <Card className="p-5 group hover:border-blue-500/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[var(--text-primary)] font-mono">{stat.value}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1.5">
                      <span className={`p-0.5 rounded ${stat.bg}`}><stat.icon className={`h-3 w-3 ${stat.color}`} /></span>
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {members.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-400" /> Developer Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {members.map((m, i) => {
                const assigned = getMemberIssueCount(m.name);
                const resolved = getMemberResolved(m.name);
                const rate = assigned > 0 ? Math.round((resolved / assigned) * 100) : 0;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-xl bg-[#21262D]/50 border border-[var(--border-secondary)]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate">{m.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{assigned}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">Assigned</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono text-green-400">{resolved}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">Resolved</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#eab308' : '#ef4444' }}>{rate}%</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">Rate</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-[#21262D] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: rate >= 70 ? '#22c55e' : rate >= 40 ? '#eab308' : '#ef4444' }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      <div className="flex items-center border-b border-[var(--border-secondary)]">
        <button onClick={() => setTab('members')} className={cn('px-4 py-3 text-sm font-medium border-b-2 transition-colors', tab === 'members' ? 'border-blue-500 text-blue-400' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]')}>
          <Users className="h-4 w-4 inline mr-1.5" />Team Members
        </button>
        <button onClick={() => setTab('invitations')} className={cn('px-4 py-3 text-sm font-medium border-b-2 transition-colors', tab === 'invitations' ? 'border-blue-500 text-blue-400' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]')}>
          <Send className="h-4 w-4 inline mr-1.5" />Pending Invitations {pendingInvites.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400">{pendingInvites.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'members' ? (
          <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            {filteredMembers.length > 0 && (
              <div className="relative max-w-xs mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <input type="text" placeholder="Search team members..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
              </div>
            )}

            {filteredMembers.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{search ? 'No results found' : 'No team members yet'}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mb-6">{search ? 'Try a different search term' : 'Invite your first team member to collaborate on projects'}</p>
                  {!search && <Button onClick={() => { setShowInvite(true); setInviteResult(null); }}><UserPlus className="h-4 w-4" /> Invite Member</Button>}
                </div>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredMembers.map((member, index) => {
                  const issueCount = getMemberIssueCount(member.name);
                  const resolved = getMemberResolved(member.name);
                  return (
                    <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                            {member.avatar || member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ${getStatusDot(member.status)} border-2 border-[var(--bg-secondary)]`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{member.name}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#21262D] text-[var(--text-tertiary)] border border-[var(--border-secondary)]">{member.role}</span>
                          </div>
                          <p className="text-xs text-[var(--text-tertiary)] truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 mt-3 sm:mt-0 pl-0 sm:pl-4 w-full sm:w-auto">
                        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                          <span className="font-mono text-[var(--text-secondary)]">{issueCount} issues</span>
                          <span className="hidden sm:inline text-green-400">{resolved} resolved</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {}} title="Send message">
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                          <div className="relative">
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}>
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                            {menuOpen === member.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                                <div className="absolute right-0 top-8 w-52 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl z-20 py-1 overflow-hidden">
                                  <button onClick={() => { setEditMember(member); setMenuOpen(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D] transition-colors"><Pencil className="h-3.5 w-3.5" /> Edit Role</button>
                                  <div className="border-t border-[var(--border-secondary)] my-1 mx-2" />
                                  {roles.filter(r => r !== member.role).slice(0, 4).map(r => (
                                    <button key={r} onClick={() => handleRoleChange(member, r)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D] transition-colors"><Shield className="h-3.5 w-3.5" /> Set as {r}</button>
                                  ))}
                                  <div className="border-t border-[var(--border-secondary)] my-1 mx-2" />
                                  <button onClick={() => { setRemovingMember(member); setMenuOpen(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="invitations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            {pendingInvites.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No pending invitations</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mb-6">All invitations have been accepted or there are none yet</p>
                  <Button onClick={() => { setShowInvite(true); setInviteResult(null); }}><UserPlus className="h-4 w-4" /> Invite Someone</Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingInvites.map((inv, i) => (
                  <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-yellow-500/20">
                        {inv.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{inv.name}</p>
                          <Badge value="Pending" variant="status" />
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)]">{inv.email} · Role: {inv.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0 pl-0 sm:pl-4 w-full sm:w-auto">
                      <span className="text-[10px] text-[var(--text-tertiary)] mr-2">Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(inv.email); addToast('success', 'Email copied'); }} title="Copy email">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setRemovingInvite(inv)}>
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        {inviteResult ? (
          <div className="space-y-4">
            {inviteResult.type === 'existing' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Already a Team Member</h3>
                <p className="text-sm text-[var(--text-tertiary)]"><strong className="text-[var(--text-primary)]">{inviteResult.name}</strong> ({inviteResult.email}) is already part of your team.</p>
              </div>
            ) : inviteResult.type === 'new' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Invitation Sent!</h3>
                <p className="text-sm text-[var(--text-tertiary)]">An invitation has been sent to <strong className="text-[var(--text-primary)]">{inviteResult.email}</strong>. They'll need to sign up to join your team.</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Invitation Failed</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Could not send invitation to <strong className="text-[var(--text-primary)]">{inviteResult.email}</strong>. Please try again.</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowInvite(false); setInviteResult(null); }}>Close</Button>
              <Button className="flex-1" onClick={() => { setInviteResult(null); setInviteForm({ name: '', email: '', role: 'Developer' }); }}>Invite Another</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 mb-2">
              <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                If the person already has an account, they'll be added immediately. Otherwise, an invitation will be sent to their email.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <Input value={inviteForm.name} onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <Input type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Role</label>
              <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowInvite(false)} disabled={inviting}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={inviting}>
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Role">
        {editMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {editMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{editMember.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{editMember.email}</p>
              </div>
            </div>
            <select value={editMember.role} onChange={e => setEditMember({ ...editMember, role: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setEditMember(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveRoleEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!removingMember} onClose={() => setRemovingMember(null)} onConfirm={handleRemoveMember}
        title="Remove Team Member" message={`Are you sure you want to remove ${removingMember?.name} from the team? This will also unassign them from any issues.`}
        confirmLabel="Remove Member" variant="danger" />

      <ConfirmDialog isOpen={!!removingInvite} onClose={() => setRemovingInvite(null)} onConfirm={handleCancelInvite}
        title="Cancel Invitation" message={`Cancel the invitation for ${removingInvite?.name} (${removingInvite?.email})? They won't be able to join using this invitation.`}
        confirmLabel="Cancel Invitation" variant="danger" />
    </div>
  );
}
