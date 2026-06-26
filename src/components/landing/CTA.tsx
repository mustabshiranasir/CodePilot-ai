import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/10 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent p-12 md:p-16"
        >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Ready to automate your code analysis?
            </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already shipping better software with CodePilot AI.
            Start your free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
          <p className="mt-6 text-sm text-[var(--text-tertiary)]">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
