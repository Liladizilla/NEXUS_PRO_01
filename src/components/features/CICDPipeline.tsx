import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Loader2, Rocket, ShieldCheck, Terminal } from 'lucide-react';

interface CICDPipelineProps {
  status: string;
  progress: number;
}

const steps = [
  { id: 'processing', label: 'Request & planning', icon: Terminal },
  { id: 'synthesizing', label: 'AI file generation', icon: Loader2 },
  { id: 'building', label: 'Structural validation', icon: ShieldCheck },
  { id: 'completed', label: 'Return generated project', icon: CheckCircle2 },
];

export const CICDPipeline: React.FC<CICDPipelineProps> = ({ status, progress }) => {
  const getStepStatus = (stepId: string) => {
    const statusOrder = ['queued', 'processing', 'synthesizing', 'building', 'completed'];
    const currentIdx = statusOrder.indexOf(status);
    const stepIdx = statusOrder.indexOf(stepId);

    if (status === 'completed' || currentIdx > stepIdx) return 'completed';
    if (status === stepId) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-5 p-5 bg-[#020305] border border-white/10 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-widest">Build progress</h3>
        <span className="text-xs font-mono text-[#36C1DE]">{progress}%</span>
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
                stepStatus === 'active' ? 'bg-[#0B2E54] border-[#36C1DE] text-[#36C1DE]' :
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
                  stepStatus === 'active' ? 'text-[#36C1DE]' :
                  'text-white/30'
                }`}>
                  {step.label}
                </div>
                {stepStatus === 'active' && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-0.5 bg-[#0B2E54] mt-1 overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-1/3 bg-[#36C1DE]"
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
          className="mt-5 p-4 bg-[#0B2E54]/40 border border-[#36C1DE]/30 rounded-lg flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-md bg-[#36C1DE] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#020305]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#EAF5F8]">Generation complete</div>
            <div className="text-xs text-[#A5B6C0]">Generated files passed structural checks. No compilation, automated tests, or production deployment ran.</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
