import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Pricing } from '../components/landing/Pricing';
import { CTA } from '../components/landing/CTA';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-mono">CodePilot AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] transition-colors">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5 text-[var(--text-primary)]" /> : <Menu className="h-5 w-5 text-[var(--text-primary)]" />}
          </button>
        </div>

        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4"
          >
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-[var(--text-secondary)] py-2">Features</a>
              <a href="#pricing" className="text-sm text-[var(--text-secondary)] py-2">Pricing</a>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => navigate('/login')}>Sign In</Button>
                <Button className="flex-1" onClick={() => navigate('/signup')}>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      <Hero />
      <div id="features"><Features /></div>
      <div id="pricing"><Pricing /></div>
      <CTA />

      <footer className="border-t border-[var(--border-primary)] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[var(--text-primary)] font-mono">CodePilot AI</span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">&copy; 2026 CodePilot AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Privacy</a>
              <a href="#" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Terms</a>
              <a href="#" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
