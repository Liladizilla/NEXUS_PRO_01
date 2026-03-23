import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Loader2, Rocket, ShieldCheck, Terminal } from 'lucide-react';

interface CICDPipelineProps {
  status: string;
  progress: number;
}

const steps = [
  { id: 'processing', label: 'AI Generation', icon: Terminal },
  { id: 'building', label: 'Build Artifacts', icon: Loader2 },
  { id: 'testing', label: 'Security Scan & Tests', icon: ShieldCheck },
  { id: 'deploying', label: 'Staging Deployment', icon: Rocket },
];

export const CICDPipeline: React.FC<CICDPipelineProps> = ({ status, progress }) => {
  const getStepStatus = (stepId: string) => {
    const statusOrder = ['queued', 'processing', 'building', 'testing', 'deploying', 'completed'];
    const currentIdx = statusOrder.indexOf(status);
    const stepIdx = statusOrder.indexOf(stepId);

    if (status === 'completed' || currentIdx > stepIdx) return 'completed';
    if (status === stepId) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6 p-6 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-widest">CI/CD Pipeline</h3>
        <span className="text-xs font-mono text-emerald-400">{progress}%</span>
      </div>

      <div className="relative space-y-4">
        {/* Progress Line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />
        
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center gap-4 pl-10"
            >
              <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-500 ${
                stepStatus === 'completed' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                stepStatus === 'active' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500 animate-pulse' :
                'bg-white/5 border-white/10 text-white/30'
              }`}>
                {stepStatus === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : stepStatus === 'active' ? (
                  <Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  stepStatus === 'completed' ? 'text-white' :
                  stepStatus === 'active' ? 'text-indigo-400' :
                  'text-white/30'
                }`}>
                  {step.label}
                </div>
                {stepStatus === 'active' && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-0.5 bg-indigo-500/30 mt-1 rounded-full overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-1/3 bg-indigo-500"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-400">Deployment Successful</div>
            <div className="text-xs text-emerald-400/60">Staging environment is live and ready for testing.</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
