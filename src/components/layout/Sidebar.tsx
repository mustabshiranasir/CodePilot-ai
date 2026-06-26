import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  Cpu,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Repositories' },
  { to: '/dashboard/bugs', icon: Bug, label: 'Issues' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/team', icon: Users, label: 'Team' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      className="h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-mono">CodePilot</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              isActive
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-[var(--border-primary)]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#21262D]">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-[var(--text-secondary)] font-mono">System Operational</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
