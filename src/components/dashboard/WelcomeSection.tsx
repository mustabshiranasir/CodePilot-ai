import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function WelcomeSection() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
        </h1>
        <Sparkles className="h-6 w-6 text-yellow-400" />
      </div>
      <p className="text-[var(--text-secondary)]">
        Here's what's happening across your projects today.
      </p>
    </motion.div>
  );
}
