import React, { useMemo } from 'react';
import { ArrowUpRight, Code2, FileCode2, Layers3, Paperclip, Send, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

type DashboardFile = { path: string; content: string };
type DashboardProps = {
  projectName: string; prompt: string; setPrompt: (value: string) => void; onBuild: () => void;
  onOpenBuilder: () => void; onOpenCode: () => void; onOpenPreview: () => void; onOpenHistory: () => void;
  onOpenAssets?: () => void; files: DashboardFile[]; agents: {id:string;name:string;role:string;status:string}[];
  logs: string[]; usageCount: number; usageLimit: number; isGenerating: boolean;
};

const starterPrompts = [
  'Invoicing app for freelancers with PDF export and Stripe payments',
  'Personal portfolio with a project gallery, blog and contact form',
  'Team task board with drag and drop, comments and email notifications',
  'Restaurant ordering page with menu, cart and order tracking',
  'Analytics dashboard with login, charts and CSV upload'
];
const templates = [
  { id:'saas', name:'SaaS dashboard', description:'Metrics, accounts and billing', prompt:'Build a SaaS dashboard with authentication, key metrics, account settings and billing.', kind:'dashboard' },
  { id:'portfolio', name:'Portfolio', description:'Projects, writing and contact', prompt:'Build a personal portfolio with a project gallery, blog and contact form.', kind:'portfolio' },
  { id:'commerce', name:'Online store', description:'Products, cart and checkout', prompt:'Build an online store with product listings, cart, checkout and order tracking.', kind:'store' },
  { id:'tasks', name:'Team workspace', description:'Tasks, owners and activity', prompt:'Build a team task workspace with a kanban board, comments and notifications.', kind:'tasks' },
  { id:'analytics', name:'Analytics', description:'Charts, filters and exports', prompt:'Build an analytics dashboard with login, interactive charts, filters and CSV export.', kind:'analytics' }
];

const PreviewThumbnail = ({kind}:{kind:string}) => (
  <div className="template-preview" aria-hidden="true">
    <div className="template-preview-sidebar"><i/><i/><i/><i/></div>
    <div className="template-preview-main">
      <div className="template-preview-top"><b/><span/><span/></div>
      {kind === 'portfolio' ? <div className="template-preview-portfolio"><b/><span/><span/><div><i/><i/><i/></div></div>
      : kind === 'store' ? <div className="template-preview-products"><i/><i/><i/></div>
      : kind === 'tasks' ? <div className="template-preview-kanban"><i/><i/><i/></div>
      : <><div className="template-preview-stats"><i/><i/><i/></div><div className={'template-preview-chart ' + (kind === 'analytics' ? 'is-analytics' : '')}><i/><i/><i/><i/><i/><i/></div></>}
    </div>
  </div>
);

export const DashboardHome: React.FC<DashboardProps> = ({
  projectName, prompt, setPrompt, onBuild, onOpenBuilder, onOpenCode, onOpenPreview,
  onOpenHistory, onOpenAssets, files, usageCount, usageLimit, isGenerating
}) => {
  const reduceMotion = useReducedMotion();
  const hasProject = files.length > 0;
  const recentFiles = useMemo(() => files.slice(0, 4), [files]);
  const canBuild = prompt.trim().length >= 10 && !isGenerating;
  const choosePrompt = (value:string) => { setPrompt(value); onOpenBuilder(); };

  return (
    <main className="odyseus-home flex-1 min-h-0 overflow-y-auto" aria-label="Build workspace">
      <div className="odyseus-home-inner">
        <header className="odyseus-home-header">
          <div>
            <p className="odyseus-context">{hasProject ? (projectName || 'Current project') : 'Odyseus'}</p>
            <h1>{hasProject ? 'Continue building.' : 'What do you want to build?'}</h1>
            <p className="odyseus-subtitle">{hasProject ? 'Pick up where you left off, or describe the next change.' : 'Describe it in plain language. Odyseus plans it, writes it and shows you a working preview.'}</p>
          </div>
          {hasProject && <button type="button" className="odyseus-secondary-action" onClick={onOpenHistory}>Recent activity <ArrowUpRight size={16}/></button>}
        </header>

        {hasProject && <section className="odyseus-continue" aria-labelledby="continue-title">
          <div className="odyseus-project-thumbnail"><PreviewThumbnail kind="dashboard"/></div>
          <div className="odyseus-continue-copy">
            <p className="odyseus-section-kicker">Continue where you left off</p>
            <h2 id="continue-title">{projectName || 'Untitled project'}</h2>
            <p>{files.length} {files.length === 1 ? 'file' : 'files'} in this workspace</p>
            <div className="odyseus-inline-actions"><button type="button" className="odyseus-primary-action" onClick={onOpenBuilder}>Open project</button><button type="button" className="odyseus-secondary-action" onClick={onOpenPreview}>Preview</button></div>
          </div>
          <div className="odyseus-recent-files"><p className="odyseus-section-kicker">Recent files</p>
            {recentFiles.map(file => <button type="button" key={file.path} onClick={onOpenCode}><FileCode2 size={15}/><span>{file.path}</span></button>)}
          </div>
        </section>}

        <section className="odyseus-composer-section" aria-labelledby="composer-title">
          <div className="odyseus-composer">
            <label className="sr-only" htmlFor="odyseus-build-prompt">Describe the app you want to build</label>
            <textarea id="odyseus-build-prompt" value={prompt} onChange={event => setPrompt(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && canBuild) { event.preventDefault(); onBuild(); } }}
              placeholder={hasProject ? 'Describe a new build or a change to this project…' : 'A booking app for a dental clinic with a calendar, email reminders and card payments'}
              aria-describedby="odyseus-composer-help"/>
            <div className="odyseus-composer-footer">
              <div className="odyseus-composer-tools">
                <button type="button" aria-label="Attach a file or image" title="Attach a file or image" onClick={onOpenAssets}><Paperclip size={18}/><span>Attach</span></button>
                <label className="odyseus-stack-picker"><Layers3 size={16}/><span className="sr-only">Framework</span><select aria-label="Framework" defaultValue="React"><option>React</option><option>Next.js</option><option>Astro</option></select><ChevronDown size={14}/></label>
              </div>
              <button type="button" className="odyseus-primary-action odyseus-build-action" disabled={!canBuild} onClick={onBuild}>
                {isGenerating ? <span className="odyseus-spinner" aria-hidden="true"/> : <Send size={17}/>}
                {isGenerating ? 'Building…' : 'Build'}
              </button>
            </div>
          </div>
          <div className="odyseus-composer-meta">
            <span id="odyseus-composer-help">{prompt.trim().length < 10 ? 'Add at least 10 characters to start a build.' : 'Enter to build · Shift + Enter for a new line'}</span>
            <span>{Math.max(0, usageLimit - usageCount)} builds left this month <button type="button" onClick={onOpenHistory}>Usage details</button></span>
          </div>
        </section>

        {!hasProject && <section className="odyseus-starters" aria-labelledby="starter-title">
          <div className="odyseus-section-heading"><h2 id="starter-title">Start with an idea</h2><p>Choose a prompt to make it yours.</p></div>
          <div className="odyseus-starter-list">{starterPrompts.map((item,index) => <button type="button" className="odyseus-starter-row" key={item} onClick={() => choosePrompt(item)}><span className="odyseus-starter-index">{String(index+1).padStart(2,'0')}</span><span>{item}</span><ArrowUpRight size={17}/></button>)}</div>
        </section>}

        <section className="odyseus-templates" aria-labelledby="template-title">
          <div className="odyseus-section-heading"><div><h2 id="template-title">Templates</h2><p>A starting point, not a locked-in design.</p></div><button type="button" onClick={onOpenBuilder}>Browse all <ArrowUpRight size={16}/></button></div>
          <div className="odyseus-template-row">{templates.map((template,index) => <motion.button key={template.id} type="button" className="odyseus-template-card" onClick={() => choosePrompt(template.prompt)}
            initial={reduceMotion ? false : {opacity:0,y:5}} animate={{opacity:1,y:0}} transition={reduceMotion ? {duration:0} : {duration:.15,delay:Math.min(index*.025,.1)}}>
            <PreviewThumbnail kind={template.kind}/><span className="odyseus-template-name">{template.name}</span><span className="odyseus-template-description">{template.description}</span>
          </motion.button>)}</div>
        </section>

        {hasProject && <section className="odyseus-recent-projects" aria-labelledby="recent-title">
          <div className="odyseus-section-heading"><h2 id="recent-title">Recent files</h2><button type="button" onClick={onOpenCode}>Open code <Code2 size={15}/></button></div>
          <div className="odyseus-recent-list">{recentFiles.map(file => <button key={file.path} type="button" onClick={onOpenCode}><FileCode2 size={16}/><span>{file.path}</span><span>{file.content.length.toLocaleString()} chars</span></button>)}</div>
        </section>}
        <footer className="odyseus-home-footer"><span>Odyseus workspace</span><span>Review generated code before shipping.</span></footer>
      </div>
    </main>
  );
};
