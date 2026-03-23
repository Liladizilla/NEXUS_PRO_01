import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Rocket, Shield, X } from 'lucide-react';
import { useNexusStore } from '../../core/store';
import { cn } from '../../lib/utils';

export const Paywall: React.FC = () => {
  const { showPaywall, setShowPaywall, usageCount, usageLimit } = useNexusStore();

  if (!showPaywall) return null;

  const handleUpgrade = (tier: 'pro' | 'enterprise') => {
    // Redirect to Stripe Checkout (Mock URLs)
    const stripeUrls = {
      pro: 'https://buy.stripe.com/test_pro_checkout',
      enterprise: 'https://buy.stripe.com/test_enterprise_checkout'
    };
    
    window.open(stripeUrls[tier], '_blank');
  };

  const tiers = [
    {
      id: 'free',
      name: 'Starter',
      price: '$0',
      description: 'Perfect for exploring Odyseus AI capabilities.',
      features: [
        '3 AI Builds per month',
        'Standard component library',
        'Railway deployment only',
        'Community support'
      ],
      buttonText: 'Current Plan',
      disabled: true,
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro Orchestrator',
      price: '$50',
      period: '/mo',
      description: 'For power users building production-ready apps.',
      features: [
        '100 AI Builds per month',
        'Daily Free API Keys (Reset 24h)',
        'Vercel & Netlify Deployment',
        'Advanced UI Widget Library',
        'Priority AI Mesh access',
        'Custom domain support'
      ],
      buttonText: 'Upgrade to Pro',
      disabled: false,
      highlight: true,
      icon: Zap
    },
    {
      id: 'enterprise',
      name: 'Odyseus Enterprise',
      price: '$150',
      period: '/mo',
      description: 'Full-scale autonomous development for teams.',
      features: [
        'Unlimited AI Builds',
        'Custom Docker Host Deployment',
        'White-label orchestration',
        'Dedicated GPU instances',
        'Custom AI model fine-tuning',
        '24/7 Concierge support',
        'SLA guarantees'
      ],
      buttonText: 'Go Enterprise',
      disabled: false,
      highlight: false,
      icon: Rocket
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-5xl bg-nexus-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-nexus-accent/10">
        {/* Close Button */}
        <button 
          onClick={() => setShowPaywall(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X size={20} className="text-white/40" />
        </button>

        <div className="p-8 md:p-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent text-[10px] font-bold uppercase tracking-wider">
              <Shield size={12} />
              Usage Limit Reached
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white">
              Unlock the Full Power of <span className="text-nexus-accent">Odyseus AI</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              You've used {usageCount}/{usageLimit} of your free builds. Upgrade your orchestration mesh to continue building without limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div 
                key={tier.id}
                className={cn(
                  "relative flex flex-col p-8 rounded-2xl border transition-all duration-500",
                  tier.highlight 
                    ? "bg-white/5 border-nexus-accent shadow-lg shadow-nexus-accent/5 scale-105 z-10" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                )}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-nexus-accent text-nexus-accent-contrast text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">{tier.name}</span>
                    {tier.icon && <tier.icon size={20} className={tier.highlight ? "text-nexus-accent" : "text-white/20"} />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    {tier.period && <span className="text-white/40 text-sm">{tier.period}</span>}
                  </div>
                  <p className="mt-2 text-xs text-white/30 leading-relaxed">{tier.description}</p>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 p-0.5 rounded-full",
                        tier.highlight ? "bg-nexus-accent/20 text-nexus-accent" : "bg-white/10 text-white/40"
                      )}>
                        <Check size={10} />
                      </div>
                      <span className="text-xs text-white/60">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => !tier.disabled && handleUpgrade(tier.id as any)}
                  disabled={tier.disabled}
                  className={cn(
                    "w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    tier.highlight
                      ? "bg-nexus-accent text-nexus-accent-contrast hover:bg-nexus-accent/90 shadow-lg shadow-nexus-accent/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                  )}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-widest">
              Secure payments powered by <span className="text-white/40 font-bold">Gumroad</span>. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
