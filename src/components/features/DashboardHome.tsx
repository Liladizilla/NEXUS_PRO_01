import React from 'react';
import {
  Activity, ArrowUpRight, Bot, Boxes, CheckCircle2, Clock3, Code2,
  FileCode2, FolderKanban, LayoutDashboard, Plus, Rocket, Send, Sparkles,
  TerminalSquare, WandSparkles, Zap
} from 'lucide-react';

type DashboardAgent = { id: string; name: string; role: string; status: string };
type DashboardFile = { path: string; content: string };
type DashboardProps = {
  projectName: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onBuild: () => void;
  onOpenBuilder: () => void;
  onOpenCode: () => void;
  onOpenPreview: () => void;
  onOpenHistory: () => void;
  files: DashboardFile[];
  agents: DashboardAgent[];
  logs: string[];
  usageCount: number;
  usageLimit: number;
  isGenerating: boolean;
};

const statusTone: Record<string, string> = {
  working: 'text-[var(--state-warning)] bg-[rgba(var(--state-warning-rgb),.12)]',
  thinking: 'text-[var(--accent-ai-primary)] bg-[rgba(var(--accent-ai-primary-rgb),.12)]',
  completed: 'text-[var(--state-live)] bg-[rgba(var(--state-live-rgb),.12)]',
  error: 'text-[var(--state-error)] bg-[rgba(var(--state-error-rgb),.12)]',
  queued: 'text-[var(--text-muted)] bg-[var(--bg-raised)]',
  idle: 'text-[var(--text-muted)] bg-[var(--bg-raised)]'
};

export const DashboardHome: React.FC<DashboardProps> = ({
  projectName, prompt, setPrompt, onBuild, onOpenBuilder, onOpenCode,
  onOpenPreview, onOpenHistory, files, agents, logs, usageCount, usageLimit, isGenerating
}) => {
  const activeAgents = agents.filter(agent => ['working', 'thinking', 'queued'].includes(agent.status)).length;
  const recentLogs = logs.slice(-4).reverse();

  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg-void)]">
      <div className="mx-auto max-w-[1440px] p-5 sm:p-7 xl:p-9 space-y-7">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[var(--text-muted)]">
              <LayoutDashboard size={14} className="text-[var(--accent-interactive)]" />
              Workspace overview
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">Your command center</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Plan, build, inspect, and ship from one workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onOpenHistory} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-panel)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)]">
              <Clock3 size={16} /> Recent activity
            </button>
            <button onClick={onOpenBuilder} className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-interactive)] px-4 py-2.5 text-sm font-bold text-[var(--nexus-accent-contrast)] hover:brightness-105">
              <Plus size={16} /> New build
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Workspace metrics">
          {[
            { label: 'Current project', value: projectName || 'Untitled project', note: files.length ? `${files.length} generated files` : 'Ready for your first build', icon: Boxes },
            { label: 'Generated files', value: String(files.length), note: files.length ? 'In the current workspace' : 'Files appear after a build', icon: FileCode2 },
            { label: 'AI agents active', value: String(activeAgents), note: activeAgents ? 'Working on your request' : `${agents.length} agents standing by`, icon: Bot },
            { label: 'Builds used', value: `${usageCount} / ${usageLimit}`, note: 'Current plan usage', icon: Activity }
          ].map(({label, value, note, icon: Icon}) => (
            <article key={label} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[0_2px_0_rgba(0,0,0,.14)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">{label}</span>
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--accent-interactive)]"><Icon size={17}/></span>
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-primary)] truncate" title={value}>{value}</div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{note}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.85fr)] gap-5">
          <article className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-panel)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-default)] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><WandSparkles size={17} className="text-[var(--accent-interactive)]"/> Start with an idea</div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Describe the product. Odyseus will plan and generate the app.</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-raised)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"><Sparkles size={12}/> AI builder</span>
            </div>
            <div className="p-5">
              <textarea
                value={prompt}
                onChange={event => setPrompt(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onBuild(); } }}
                placeholder="Example: Build a project dashboard with authentication, billing, and a responsive analytics page…"
                className="min-h-[132px] w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-void)] p-4 text-sm leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-interactive)] focus:ring-2 focus:ring-[rgba(var(--accent-interactive-rgb),.15)]"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {['SaaS dashboard', 'Portfolio site', 'Mobile-first app'].map(suggestion => (
                    <button key={suggestion} onClick={() => setPrompt(current => current ? `${current}\n${suggestion}` : `Build a ${suggestion.toLowerCase()}.`)} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]">{suggestion}</button>
                  ))}
                </div>
                <button disabled={isGenerating || !prompt.trim()} onClick={onBuild} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-interactive)] px-4 py-2.5 text-sm font-bold text-[var(--nexus-accent-contrast)] disabled:cursor-not-allowed disabled:opacity-50">
                  {isGenerating ? <Activity size={16} className="animate-pulse"/> : <Send size={16}/>}
                  {isGenerating ? 'Building…' : 'Build application'}
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-panel)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
              <div><h2 className="text-sm font-semibold text-[var(--text-primary)]">Agent workspace</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Orchestration status</p></div>
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--state-live)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--state-live)]"/> Connected</span>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {agents.slice(0, 5).map(agent => (
                <div key={agent.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--accent-ai-primary)]"><Bot size={17}/></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[var(--text-primary)]">{agent.name}</p><p className="truncate text-xs text-[var(--text-muted)]">{agent.role}</p></div>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-semibold capitalize ${statusTone[agent.status] || statusTone.idle}`}>{agent.status}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] gap-5">
          <article className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-panel)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
              <div><h2 className="text-sm font-semibold text-[var(--text-primary)]">Current project</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Pick up where you left off</p></div>
              <button onClick={onOpenCode} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-interactive)] hover:underline">Open files <ArrowUpRight size={14}/></button>
            </div>
            {files.length ? (
              <div className="divide-y divide-[var(--border-default)]">
                {files.slice(0, 5).map(file => <button key={file.path} onClick={onOpenCode} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[var(--bg-raised)]"><FileCode2 size={16} className="shrink-0 text-[var(--accent-interactive)]"/><span className="min-w-0 flex-1 truncate text-sm text-[var(--text-primary)]">{file.path}</span><span className="text-xs text-[var(--text-muted)]">{file.content.length.toLocaleString()} chars</span></button>)}
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-9 text-center"><div className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--text-muted)]"><FolderKanban size={20}/></div><p className="mt-3 text-sm font-medium text-[var(--text-primary)]">Your first project starts here</p><p className="mt-1 max-w-sm text-xs leading-5 text-[var(--text-muted)]">Create an app from a prompt. Generated files and project actions will appear in this panel.</p><button onClick={onOpenBuilder} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"><Plus size={14}/> Start a project</button></div>
            )}
          </article>

          <article className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-panel)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4"><div><h2 className="text-sm font-semibold text-[var(--text-primary)]">Activity feed</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Latest workspace events</p></div><TerminalSquare size={17} className="text-[var(--text-muted)]"/></div>
            <div className="space-y-4 p-5">
              {recentLogs.length ? recentLogs.map((entry, index) => <div key={`${entry}-${index}`} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-interactive)]"/><p className="min-w-0 break-words text-xs leading-5 text-[var(--text-muted)]">{entry.replace(/^\[[^\]]+\]\s*/, '')}</p></div>) : <p className="text-xs text-[var(--text-muted)]">No activity yet. Your build events will show here.</p>}
              <button onClick={onOpenHistory} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-interactive)] hover:underline">View all activity <ArrowUpRight size={14}/></button>
            </div>
          </article>
        </section>

        <footer className="flex flex-col gap-2 border-t border-[var(--border-default)] pt-4 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2"><Zap size={13} className="text-[var(--accent-interactive)]"/> Odyseus Studio <span className="opacity-50">/</span> Build workspace</span>
          <span>Build with intent. Review before you ship.</span>
        </footer>
      </div>
    </main>
  );
};
