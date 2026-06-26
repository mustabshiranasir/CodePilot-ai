import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Reset link sent! Check your email.');
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-mono">DevFlow</span>
          </Link>

          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Reset your password</h1>
              <p className="text-[var(--text-secondary)]">
                Enter your email and we'll send you a reset link.
              </p>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Check your email</h1>
              <p className="text-[var(--text-secondary)]">
                We've sent a password reset link to <strong className="text-[var(--text-primary)]">{email}</strong>
              </p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="name@company.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Send Reset Link <Send className="h-4 w-4" />
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
