/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Agent Card — 5-State System (Spec 5.3)
 * One component, five visually distinct states (idle / queued / thinking /
 * working / blocked / done) so the sidebar can be scanned without reading labels.
 * Color is never the only signal: every state pairs color with an icon or shape
 * (dot vs. ring vs. checkmark vs. shake) — AA accessible (Spec 8).
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { Cpu, Check, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Agent, AgentStatus } from '../../core/store';

interface StateConfig {
  label: string;
  /** left indicator + dot color */
  dot: string;
  /** card surface + border */
  surface: string;
  /** status label text color */
  text: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const STATES: Record<AgentStatus, StateConfig> = {
  idle: {
    label: 'Waiting for task',
    dot: 'bg-text-disabled',
    surface: 'surface-panel border border-default',
    text: 'text-text-muted',
    Icon: Cpu,
  },
  queued: {
    label: 'Queued',
    dot: 'bg-state-warning queued-dot',
    surface: 'surface-panel border border-default',
    text: 'text-state-warning',
    Icon: Clock,
  },
  thinking: {
    label: 'Reasoning',
    dot: 'bg-accent-ai',
    surface: 'surface-floating border border-accent-ai/40',
    text: 'text-accent-ai',
    Icon: Cpu,
  },
  working: {
    label: 'Working',
    dot: 'bg-accent-interactive',
    surface: 'surface-floating border border-accent-interactive',
    text: 'text-accent-interactive',
    Icon: Loader2,
  },
  completed: {
    label: 'Done',
    dot: 'bg-state-live',
    surface: 'surface-panel border border-default',
    text: 'text-state-live',
    Icon: Check,
  },
  error: {
    label: 'Blocked',
    dot: 'bg-state-error',
    surface: 'surface-panel border border-state-error',
    text: 'text-state-error',
    Icon: AlertTriangle,
  },
};

export const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const controls = useAnimationControls();
  const prevStatus = useRef<AgentStatus>(agent.status);
  const cfg = STATES[agent.status];

  // "Done" card recedes to 80% after 4s (Spec 5.3).
  useEffect(() => {
    if (agent.status === 'completed') {
      const t = setTimeout(() => setDimmed(true), 4000);
      return () => clearTimeout(t);
    }
    setDimmed(false);
  }, [agent.status]);

  // Single shake when transitioning INTO blocked (Spec 6.4 — errors snap, feel immediate).
  useEffect(() => {
    if (agent.status === 'error' && prevStatus.current !== 'error') {
      controls.start({
        x: [0, -4, 4, -3, 3, 0],
        transition: { duration: 0.35, ease: 'easeOut' },
      });
    }
    prevStatus.current = agent.status;
  }, [agent.status, controls]);

  return (
    <motion.div
      animate={controls}
      layout
      onClick={() => setIsInspecting(!isInspecting)}
      className={cn(
        'relative flex items-start gap-3 p-3 rounded-[10px] cursor-help overflow-hidden transition-opacity',
        cfg.surface,
        dimmed && 'opacity-80',
      )}
      style={{ transition: 'opacity 600ms var(--ease-out)' }}
      title="Click to inspect agent capabilities and logs"
    >
      {/* Avatar + state indicator (5.3 anatomy: 64px avatar / icon left) */}
      <div className="relative shrink-0">
        {/* Thinking: rotating purple→magenta gradient ring (Spec 5.3 / 6.4) */}
        {agent.status === 'thinking' && (
          <div
            className="thinking-ring absolute -inset-[3px] rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, var(--accent-ai-primary), var(--accent-ai-secondary), var(--accent-ai-primary))',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: 2,
            }}
          />
        )}
        <div
          className={cn(
            'relative w-11 h-11 rounded-lg flex items-center justify-center border',
            agent.status === 'thinking'
              ? 'bg-raised border-accent-ai/40'
              : agent.status === 'working'
                ? 'bg-raised border-accent-interactive/50'
                : agent.status === 'error'
                  ? 'bg-raised border-state-error/50'
                  : agent.status === 'completed'
                    ? 'bg-raised border-state-live/40'
                    : 'bg-raised border-default',
          )}
        >
          <cfg.Icon
            size={18}
            className={cn(
              agent.status === 'idle' && 'text-text-disabled',
              agent.status === 'queued' && 'text-state-warning',
              agent.status === 'thinking' && 'text-accent-ai',
              agent.status === 'working' && 'text-accent-interactive animate-spin',
              agent.status === 'completed' && 'text-state-live',
              agent.status === 'error' && 'text-state-error',
            )}
          />
        </div>
      </div>

      {/* Name + role + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight truncate text-text-primary">
              {agent.name}
            </div>
            <div className="text-[11px] leading-tight truncate text-text-muted mt-0.5">
              {agent.role}
            </div>
          </div>
          <span
            className={cn(
              'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-base/60 text-[9px] font-bold uppercase tracking-wider',
              cfg.text,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </span>
        </div>

        {/* Working: mini progress bar (indeterminate shimmer) */}
        {agent.status === 'working' && (
          <div className="mt-2 h-1 rounded-full bg-base overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-accent-interactive animate-[indeterminate_1.2s_var(--ease-inout)_infinite]" />
          </div>
        )}

        {/* Optional single-line detail */}
        {(agent.status === 'working' || agent.status === 'error') && agent.lastAction && (
          <div
            className={cn(
              'mt-1.5 text-[10px] font-mono truncate',
              agent.status === 'error' ? 'text-state-error/90' : 'text-text-muted',
            )}
          >
            {agent.lastAction}
          </div>
        )}
      </div>

      {/* Done: green check draws in via stroke-dasharray */}
      {agent.status === 'completed' && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="absolute top-2 right-2 text-state-live"
        >
          <Check size={14} strokeWidth={3} />
        </motion.div>
      )}

      {/* Inspect panel */}
      <AnimatePresenceInspect open={isInspecting} agent={agent} />
    </motion.div>
  );
};

const AnimatePresenceInspect: React.FC<{ open: boolean; agent: Agent }> = ({ open, agent }) => {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  if (!mounted) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full overflow-hidden"
    >
      <div className="pt-2 mt-2 border-t border-default/70 space-y-2">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-widest text-text-muted font-bold">Capabilities</span>
          <div className="flex flex-wrap gap-1">
            {['Architecting', 'Code Synthesis', 'Security Scan'].map((cap) => (
              <span key={cap} className="px-1.5 py-0.5 rounded-sm bg-base text-[8px] text-text-muted border border-default">
                {cap}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-widest text-text-muted font-bold">Live Logs</span>
          <div className="text-[8px] font-mono leading-tight text-accent-interactive/70">
            {agent.status === 'working' ? '> Initializing neural mesh...' : '> Task execution finalized.'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;
