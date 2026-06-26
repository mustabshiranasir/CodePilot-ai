import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, LogOut, User as UserIcon, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { formatTimeAgo } from '../../lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markNotificationRead, clearNotifications } = useData();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 fixed top-0 right-0 left-72 z-30 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search issues, repositories, or people..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[#21262D] rounded border border-[var(--border-primary)]">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-12 w-80 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl z-50">
                  <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 text-xs font-mono text-blue-400">({unreadCount} new)</span>
                      )}
                    </h3>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCheck className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--text-tertiary)]">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => { markNotificationRead(n.id); if (n.issueId) navigate(`/dashboard/bugs/${n.issueId}`); setShowNotifications(false); }}
                          className={`p-4 border-b border-[var(--border-secondary)] cursor-pointer transition-colors ${!n.read ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-[#21262D]'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                            <div>
                              <p className={`text-sm ${!n.read ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>{n.message}</p>
                              <p className="text-xs text-[var(--text-tertiary)] mt-1">{formatTimeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#21262D] transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{user?.email}</p>
              </div>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl z-50">
                  <div className="p-3 border-b border-[var(--border-primary)]">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { navigate('/dashboard/settings'); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D] rounded-lg transition-colors">
                      <UserIcon className="h-4 w-4" /> Settings
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
