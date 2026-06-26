import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, Shield, Palette, Key, Smartphone, Moon, Sun, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { settingsService } from '../lib/services/settings';
import type { UserSettings } from '../lib/services/settings';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'api', icon: Key, label: 'API Keys' },
  { id: 'devices', icon: Smartphone, label: 'Devices' },
];

export default function Settings() {
  const { theme, toggleTheme, setFontSize: applyFontSize, setCompactMode: applyCompactMode } = useTheme();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    name: user?.name || '',
    email: user?.email || '',
    role: 'Developer',
    location: '',
    themePreference: 'dark',
    fontSize: 'Medium',
    compactMode: false,
    notificationPrefs: {},
  });

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    settingsService.get(user.id)
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        if (data.themePreference && data.themePreference !== theme) {
          toggleTheme();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const toggleNotif = (key: string) => {
    setSettings(prev => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, [key]: !prev.notificationPrefs?.[key] },
    }));
  };

  const notifList = [
    { label: 'Issue assigned to you', key: 'assigned' },
    { label: 'Status changes on your issues', key: 'status' },
    { label: 'Comments on your issues', key: 'comments' },
    { label: 'Mentions in comments', key: 'mentions' },
    { label: 'Weekly digest', key: 'digest' },
    { label: 'Product updates', key: 'updates' },
  ];

  const handleSave = async (section: string) => {
    if (!user?.id) { addToast('error', 'You must be logged in'); return; }
    setSaving(section);
    try {
      if (section === 'profile') {
        await settingsService.update(user.id, {
          name: settings.name,
          email: settings.email,
          role: settings.role,
          location: settings.location,
        });
      } else if (section === 'notifications') {
        await settingsService.update(user.id, { notificationPrefs: settings.notificationPrefs });
      } else if (section === 'appearance') {
        await settingsService.update(user.id, {
          themePreference: theme as 'dark' | 'light',
          fontSize: settings.fontSize,
          compactMode: settings.compactMode,
        });
      }
      addToast('success', `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-96 lg:col-span-3 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-2 h-fit">
          {settingsSections.map(section => (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === section.id ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'}`}>
              <section.icon className="h-4 w-4" /> {section.label}
            </button>
          ))}
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeSection === 'profile' && (
              <Card>
                <CardHeader><h3 className="text-lg font-semibold text-[var(--text-primary)]">Profile Settings</h3><p className="text-sm text-[var(--text-secondary)] mt-1">Update your personal information and public profile</p></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {(settings.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div><Button variant="secondary" size="sm">Change Avatar</Button></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={settings.name || ''} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} />
                    <Input label="Email" type="email" value={settings.email || ''} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} />
                    <Input label="Role" value={settings.role || ''} onChange={e => setSettings(s => ({ ...s, role: e.target.value }))} />
                    <Input label="Location" value={settings.location || ''} onChange={e => setSettings(s => ({ ...s, location: e.target.value }))} />
                  </div>
                  <div className="pt-4">
                    <Button onClick={() => handleSave('profile')} disabled={saving === 'profile'}>
                      {saving === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving === 'profile' ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card>
                <CardHeader><h3 className="text-lg font-semibold text-[var(--text-primary)]">Notification Preferences</h3><p className="text-sm text-[var(--text-secondary)] mt-1">Choose what notifications you receive</p></CardHeader>
                <CardContent className="space-y-1">
                  {notifList.map(pref => (
                    <div key={pref.key} className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)] last:border-0">
                      <span className="text-sm text-[var(--text-primary)]">{pref.label}</span>
                      <button onClick={() => toggleNotif(pref.key)} className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${settings.notificationPrefs?.[pref.key] ? 'bg-blue-600' : 'bg-[#21262D]'}`}>
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.notificationPrefs?.[pref.key] ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button onClick={() => handleSave('notifications')} disabled={saving === 'notifications'}>
                      {saving === 'notifications' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving === 'notifications' ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card>
                <CardHeader><h3 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h3><p className="text-sm text-[var(--text-secondary)] mt-1">Customize your coding environment theme</p></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Theme</label>
                    <div className="flex gap-3">
                      {['dark', 'light'].map(t => (
                        <button key={t} onClick={() => { if (t !== theme) toggleTheme(); }}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === t ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--border-primary)] hover:border-blue-500/30'}`}>
                          <div className="flex justify-center mb-3">{t === 'dark' ? <Moon className="h-6 w-6 text-blue-400" /> : <Sun className="h-6 w-6 text-yellow-400" />}</div>
                          <p className="text-sm font-medium text-[var(--text-primary)] capitalize">{t}</p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t === 'dark' ? 'Easy on the eyes' : 'Classic bright'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Font Size</label>
                    <div className="flex gap-2">
                      {['Small', 'Medium', 'Large'].map(s => (
                        <button key={s} onClick={() => { setSettings(p => ({ ...p, fontSize: s })); applyFontSize(s); }}
                          className={`px-4 py-2 rounded-lg border text-sm transition-colors ${settings.fontSize === s ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-blue-500/30 hover:text-[var(--text-primary)]'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-primary)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Compact Mode</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Reduce spacing for a denser layout</p>
                    </div>
                    <button onClick={() => { const next = !settings.compactMode; setSettings(p => ({ ...p, compactMode: next })); applyCompactMode(next); }} className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${settings.compactMode ? 'bg-blue-600' : 'bg-[#21262D]'}`}>
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.compactMode ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  <div className="pt-2">
                    <Button onClick={() => handleSave('appearance')} disabled={saving === 'appearance'}>
                      {saving === 'appearance' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving === 'appearance' ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card>
                <CardHeader><h3 className="text-lg font-semibold text-[var(--text-primary)]">Security</h3><p className="text-sm text-[var(--text-secondary)] mt-1">Manage your password and security settings</p></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Current Password" type="password" placeholder="Enter current password" />
                    <Input label="New Password" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)]">
                    <div><p className="text-sm text-[var(--text-primary)]">Two-Factor Authentication</p><p className="text-xs text-[var(--text-tertiary)]">Add an extra layer of security</p></div>
                    <Button variant="secondary" size="sm">Enable</Button>
                  </div>
                  <div className="pt-4"><Button onClick={() => handleSave('security')}><Save className="h-4 w-4" /> Update</Button></div>
                </CardContent>
              </Card>
            )}

            {(activeSection === 'api' || activeSection === 'devices') && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{activeSection === 'api' ? 'API Keys' : 'Devices'}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{activeSection === 'api' ? 'Manage your API keys for integrations' : 'Manage connected devices and sessions'}</p>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <Key className="h-10 w-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">No {activeSection === 'api' ? 'API keys' : 'connected devices'} yet.</p>
                  <Button variant="secondary" size="sm" className="mt-4">{activeSection === 'api' ? 'Generate Key' : 'Current Session'}</Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
