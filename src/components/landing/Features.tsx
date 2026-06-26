import { motion } from 'framer-motion';
import { Bug, Zap, Users, Shield, GitBranch, Bell } from 'lucide-react';

const features = [
  {
    icon: Bug,
    title: 'AI Bug Detection',
    description: 'Automatically detect and classify bugs using machine learning algorithms that learn from your codebase.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Automate repetitive tasks with custom workflows. Auto-assign, prioritize, and route bugs to the right team.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time collaboration with built-in comments, mentions, and code snippets. Keep everyone in sync.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Shield,
    title: 'Smart Prioritization',
    description: 'Prioritize bugs based on impact, frequency, and severity scores calculated by AI analysis.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: GitBranch,
    title: 'Git Integration',
    description: 'Seamlessly integrate with GitHub, GitLab, and Bitbucket. Link commits and PRs directly to issues.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Get instant notifications for critical bugs, status changes, and important updates across your projects.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
];

export function Features() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Everything you need to ship with confidence
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Powerful features designed to streamline your bug tracking workflow and help your team move faster.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 rounded-xl border border-[var(--border-primary)] hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className={`h-12 w-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
