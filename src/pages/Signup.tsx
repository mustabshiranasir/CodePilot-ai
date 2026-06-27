import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield, Key, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

const roles = ['Developer', 'Lead Developer', 'Admin'];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Developer', teamPasscode: '', teamName: '' });
  const [joinMode, setJoinMode] = useState<'new' | 'join'>('new');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.email, form.password, form.name, form.role, joinMode === 'join' ? form.teamPasscode : '', form.teamName);
      addToast('success', 'Account created! Welcome to CodePilot.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create account. Please try again.';
      addToast(msg.includes('confirmation') ? 'info' : 'error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-mono">CodePilot AI</span>
          </Link>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create your account</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User className="h-4 w-4" />}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                icon={<Lock className="h-4 w-4" />}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {form.role === 'Admin' ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setJoinMode('new')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${joinMode === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#21262D] text-[var(--text-tertiary)] border border-transparent hover:border-[var(--border-primary)]'}`}>
                  <Users className="h-3.5 w-3.5 inline mr-1.5" /> New Team
                </button>
                <button type="button" onClick={() => setJoinMode('join')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${joinMode === 'join' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#21262D] text-[var(--text-tertiary)] border border-transparent hover:border-[var(--border-primary)]'}`}>
                  <Key className="h-3.5 w-3.5 inline mr-1.5" /> Join Team
                </button>
              </div>
            ) : (
              <div className="bg-[#21262D] rounded-lg p-3 border border-[var(--border-primary)]">
                <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  Enter a team passcode to join an existing team. Only admins can create new teams.
                </p>
              </div>
            )}

            {joinMode === 'join' || form.role !== 'Admin' ? (
              <Input
                label="Team Passcode"
                type="text"
                placeholder="e.g. A1B2C3D4"
                icon={<Key className="h-4 w-4" />}
                value={form.teamPasscode}
                onChange={e => setForm({ ...form, teamPasscode: e.target.value.toUpperCase() })}
                required={form.role !== 'Admin'}
              />
            ) : (
              <Input
                label="Team Name"
                type="text"
                placeholder="e.g. My Team"
                icon={<Users className="h-4 w-4" />}
                value={form.teamName}
                onChange={e => setForm({ ...form, teamName: e.target.value })}
              />
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-xs text-[var(--text-tertiary)] text-center">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-transparent items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6">
            <Code2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Start shipping faster</h2>
          <div className="space-y-4 text-left max-w-sm mx-auto">
            {[
              'AI-powered bug detection and classification',
              'Seamless team collaboration in real-time',
              'Smart prioritization and automated workflows',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
