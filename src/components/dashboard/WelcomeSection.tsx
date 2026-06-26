import { motion } from 'framer-motion';
import { Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function WelcomeSection() {
  const { user } = useAuth();
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Terminal className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">~/dashboard</p>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                {greeting}, {user?.name?.split(' ')[0] || 'Developer'}
                <Sparkles className="h-5 w-5 text-yellow-400" />
              </h1>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] ml-11">
            Here's your AI-powered code analysis overview.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs text-[var(--text-tertiary)] font-mono">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
