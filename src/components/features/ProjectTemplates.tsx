import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Users, 
  LayoutDashboard, 
  Bot, 
  Palette, 
  Dumbbell, 
  Search, 
  Filter, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNexusStore } from '../../core/store';
import { cn } from '../../lib/utils';

const iconMap: Record<string, any> = {
  ShoppingBag,
  Users,
  LayoutDashboard,
  Bot,
  Palette,
  Dumbbell
};

export const ProjectTemplates: React.FC = () => {
  const { 
    templates, 
    fetchTemplates, 
    templateFilter, 
    setTemplateFilter, 
    setSelectedTemplate,
    setPrompt,
    setShowTemplateSearch
  } = useNexusStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const categories = ['All', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: any) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
    setShowTemplateSearch(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-nexus-accent/20 border border-nexus-accent/30">
              <Sparkles className="text-nexus-accent" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Project Blueprints</h2>
              <p className="text-sm text-white/40">Accelerate your synthesis with pre-configured architectures.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTemplateSearch(false)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} className="text-white/40" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Search blueprints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-nexus-accent/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                  activeCategory === cat 
                    ? "bg-nexus-accent text-nexus-accent-contrast border-nexus-accent" 
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => {
              const Icon = iconMap[template.icon] || Sparkles;
              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSelect(template)}
                  className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/[0.08] hover:border-nexus-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-nexus-accent/30 transition-colors", template.color)}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      {template.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-nexus-accent transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-white/40 mb-6 flex-1">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                      Ready for Synthesis
                    </span>
                    <div className="flex items-center gap-1 text-nexus-accent font-bold text-xs group-hover:translate-x-1 transition-transform">
                      Select <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Filter size={32} className="text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white">No blueprints found</h3>
            <p className="text-sm text-white/40">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
