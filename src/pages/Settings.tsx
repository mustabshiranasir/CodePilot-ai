import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, Shield, Palette, Key, Smartphone, Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'api', icon: Key, label: 'API Keys' },
  { id: 'devices', icon: Smartphone, label: 'Devices' },
];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', role: 'Lead Developer', location: 'San Francisco, CA' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleSave = (section: string) => {
    addToast('success', `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
  };

  const notificationPrefs = [
    { label: 'Bug assigned to you', key: 'assigned', enabled: true },
    { label: 'Status changes on your bugs', key: 'status', enabled: true },
    { label: 'Comments on your bugs', key: 'comments', enabled: true },
    { label: 'Mentions in comments', key: 'mentions', enabled: true },
    { label: 'Weekly digest', key: 'digest', enabled: false },
    { label: 'Product updates', key: 'updates', enabled: false },
  ];

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
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">AC</div>
                    <div><Button variant="secondary" size="sm">Change Avatar</Button></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <Input label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                    <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="pt-4"><Button onClick={() => handleSave('profile')}><Save className="h-4 w-4" /> Save Changes</Button></div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card>
                <CardHeader><h3 className="text-lg font-semibold text-[var(--text-primary)]">Notification Preferences</h3><p className="text-sm text-[var(--text-secondary)] mt-1">Choose what notifications you receive</p></CardHeader>
                <CardContent className="space-y-1">
                  {notificationPrefs.map(pref => (
                    <div key={pref.key} className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)] last:border-0">
                      <span className="text-sm text-[var(--text-primary)]">{pref.label}</span>
                      <button className={`relative h-6 w-11 rounded-full transition-colors ${pref.enabled ? 'bg-blue-600' : 'bg-[#21262D]'}`}>
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${pref.enabled ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4"><Button onClick={() => handleSave('notifications')}><Save className="h-4 w-4" /> Save Preferences</Button></div>
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
                        <button key={s} className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:border-blue-500/30 hover:text-[var(--text-primary)] transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-primary)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Compact Mode</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Reduce spacing for a denser layout</p>
                    </div>
                    <button className="relative h-6 w-11 rounded-full bg-[#21262D]"><span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" /></button>
                  </div>
                  <div className="pt-2"><Button onClick={() => handleSave('appearance')}><Save className="h-4 w-4" /> Save Preferences</Button></div>
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
