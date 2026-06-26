import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, Lightbulb, ListChecks, Target, ChevronDown, ChevronUp, Loader2, Cpu } from 'lucide-react';
import type { AIAnalysis } from '../../types';
import { getPriorityBg } from '../../lib/utils';

function generateAnalysis(description: string, priority: string): AIAnalysis {
  const words = description.toLowerCase();
  const hasMemory = words.includes('memory') || words.includes('leak');
  const hasTimeout = words.includes('timeout') || words.includes('drop') || words.includes('connection');
  const hasAuth = words.includes('token') || words.includes('auth') || words.includes('login');
  const hasUI = words.includes('ui') || words.includes('css') || words.includes('overflow') || words.includes('mobile');
  const hasPerformance = words.includes('performance') || words.includes('slow') || words.includes('exhaustion');

  const severity = priority === 'critical' || priority === 'high' ? priority : hasMemory || hasTimeout ? 'high' : hasAuth ? 'high' : 'medium';

  const summary = description.length > 120 ? description.substring(0, 120) + '...' : description;

  let possibleCause = '';
  if (hasMemory) possibleCause = 'Possible circular reference in event handler chain preventing garbage collection. Check the observer pattern implementation in the data processing module for unsubscribed listeners.';
  else if (hasTimeout) possibleCause = 'Idle connection timeout configuration may be set too aggressively. The default keepalive interval might not be configured for this service tier.';
  else if (hasAuth) possibleCause = 'Error handling in the authentication middleware may not be catching expired token exceptions before they reach the global handler.';
  else if (hasUI) possibleCause = 'CSS containment and viewport meta tags may be missing. The responsive layout calculations might not account for safe-area insets on mobile devices.';
  else if (hasPerformance) possibleCause = 'Connection pool settings may not be optimized for the current workload. The pool size should be adjusted based on the max concurrent connection count.';
  else possibleCause = 'Insufficient error boundaries around async operations. The component may be missing proper try/catch blocks in the data fetching layer.';

  const debuggingSteps = [
    `Check application logs at the time of the incident for stack traces and error codes`,
    `Reproduce the issue in the staging environment with debug logging enabled`,
    hasMemory ? `Take a heap snapshot and compare memory usage over a 2-hour period` : `Inspect network requests for failed or hanging connections`,
    `Review the most recent code changes in the affected module`,
    `Run the test suite for the affected component to check for regressions`,
    hasUI ? `Test on multiple device sizes and orientations` : `Verify the fix handles edge cases`,
  ];

  let suggestedSolution = '';
  if (hasMemory) suggestedSolution = 'Implement a proper cleanup mechanism in the useEffect return to remove event listeners and observers. Consider using a WeakRef pattern for long-lived subscriptions.';
  else if (hasTimeout) suggestedSolution = 'Implement WebSocket ping/pong heartbeat with a 30-second interval. Configure the server to send keepalive frames and the client to automatically reconnect on disconnect.';
  else if (hasAuth) suggestedSolution = 'Add a centralized error boundary in the auth middleware to catch token expiration errors and redirect to the login flow with the original URL preserved for redirect.';
  else if (hasUI) suggestedSolution = 'Apply proper CSS containment and update the viewport meta tag. Use CSS media queries to handle safe-area insets and test on physical iOS/Android devices.';
  else if (hasPerformance) suggestedSolution = 'Increase the connection pool size and add connection timeout settings. Implement a connection pool health check that automatically recycles stale connections.';
  else suggestedSolution = 'Add error boundaries around the component and implement proper error logging. Consider adding a retry mechanism with exponential backoff for failed operations.';

  return { summary, possibleCause, debuggingSteps, severity: severity as AIAnalysis['severity'], suggestedSolution };
}

interface AIAssistantProps {
  description: string;
  priority: string;
}

export function AIAssistant({ description, priority }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysis = useMemo(() => {
    setIsAnalyzing(true);
    const result = generateAnalysis(description, priority);
    setTimeout(() => setIsAnalyzing(false), 600);
    return result;
  }, [description, priority]);

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Cpu className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              AI Bug Assistant
              {isAnalyzing && <Loader2 className="h-3 w-3 animate-spin" />}
            </h3>
            <p className="text-xs text-blue-400/60">Automated code analysis</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-blue-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {isAnalyzing ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-blue-500/10 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-[#0D1117]/50 border border-blue-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
                      <Sparkles className="h-3.5 w-3.5" /> AI SUMMARY
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">{analysis.summary}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-orange-400 font-mono">
                      <AlertTriangle className="h-3.5 w-3.5" /> POSSIBLE CAUSE
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] pl-5">{analysis.possibleCause}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
                      <ListChecks className="h-3.5 w-3.5" /> DEBUGGING STEPS
                    </div>
                    <ol className="space-y-1.5 pl-5">
                      {analysis.debuggingSteps.map((step, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="text-[10px] font-mono text-purple-400 mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                      <Lightbulb className="h-3.5 w-3.5" /> SUGGESTED SOLUTION
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{analysis.suggestedSolution}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-[var(--text-tertiary)]">
                    <Target className="h-3 w-3" />
                    Estimated Severity:
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getPriorityBg(analysis.severity)}`}>
                      {analysis.severity}
                    </span>
                    <span className="ml-auto">Powered by DevFlow AI</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
