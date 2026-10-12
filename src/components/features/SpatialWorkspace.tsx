import React, { useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Bot, Building2, Camera, CheckCircle2, ChevronDown, ChevronUp, Circle, Code2, Compass, Maximize2, Minus, Plus, RotateCcw, Terminal, X } from 'lucide-react';
import { useNexusStore, type Agent } from '../../core/store';
import './spatial-workspace.css';

type AgentState = Agent['status'];
const statusColor: Record<AgentState, string> = {
  idle: '#77766f', queued: '#e5b64a', thinking: '#f28c38', working: '#f28c38', completed: '#5bb974', error: '#e5675b'
};
const statusLabel: Record<AgentState, string> = {
  idle: 'Ready', queued: 'Queued', thinking: 'Planning', working: 'Working', completed: 'Complete', error: 'Needs attention'
};
const sites = [
  { id: 'architect', name: 'Architecture Tower', role: 'System planning', x: 28, y: 31, h: 118, w: 76 },
  { id: 'frontend', name: 'Interface Foundry', role: 'Frontend', x: 58, y: 27, h: 82, w: 66 },
  { id: 'backend', name: 'Service Exchange', role: 'Backend services', x: 76, y: 48, h: 103, w: 70 },
  { id: 'debug', name: 'Quality Lab', role: 'Testing and repair', x: 40, y: 62, h: 70, w: 64 },
  { id: 'devops', name: 'Launch Port', role: 'Build and release', x: 62, y: 72, h: 94, w: 68 }
];

function AgentAvatar({ agent, selected, onSelect }: { agent: Agent; selected: boolean; onSelect: () => void }) {
  const color = statusColor[agent.status];
  return <button type="button" className={`sp-agent ${selected ? 'is-selected' : ''} status-${agent.status}`} style={{ left: `${sites.find(s => s.id === agent.id)?.x ?? 50}%`, top: `${(sites.find(s => s.id === agent.id)?.y ?? 50) - 7}%`, '--agent-color': color } as React.CSSProperties} onClick={onSelect} aria-label={`${agent.name}, ${statusLabel[agent.status]}. Select agent`}>
    <span className="sp-avatar"><Bot size={21} /></span><span className="sp-agent-tag"><b>{agent.name}</b><small>{statusLabel[agent.status]}</small></span>
  </button>;
}

export function SpatialWorkspace() {
  const { agents, logs, files, projectName, isGenerating, setActiveTab, addLog } = useNexusStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 54, y: -26 });
  const [zoom, setZoom] = useState(0.9);
  const [showConsole, setShowConsole] = useState(false);
  const [showMobileAgents, setShowMobileAgents] = useState(false);
  const [lowMotion, setLowMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const selectedAgent = agents.find(agent => agent.id === selectedId);
  const activeAgents = agents.filter(agent => ['queued', 'thinking', 'working'].includes(agent.status));
  const recentLogs = useMemo(() => logs.slice(-5).reverse(), [logs]);
  const setCamera = (x: number, y: number) => setRotation({ x: Math.max(25, Math.min(78, x)), y: ((y + 180) % 360) - 180 });
  const dragRef = React.useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = { x: e.clientX, y: e.clientY, rx: rotation.x, ry: rotation.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setCamera(dragRef.current.rx - (e.clientY - dragRef.current.y) * 0.25, dragRef.current.ry + (e.clientX - dragRef.current.x) * 0.35);
  };
  const resetCamera = () => { setRotation({ x: 54, y: -26 }); setZoom(0.9); };
  const buildingAction = (id: string) => {
    setSelectedId(id);
    addLog(`Spatial workspace: selected ${sites.find(s => s.id === id)?.name ?? id}.`);
  };

  return <section className="sp-workspace" aria-label="Spatial agent workspace">
    <header className="sp-topbar">
      <div className="sp-brand"><span className="sp-brand-mark"><Compass size={19}/></span><div><strong>Odyseus spatial</strong><small>{projectName}</small></div></div>
      <div className="sp-top-status"><span className={`sp-status-dot ${isGenerating ? 'is-live' : ''}`} />{isGenerating ? 'Build in progress' : 'Workspace ready'}<span className="sp-divider"/> <span>{agents.length} agents</span></div>
      <button className="sp-quiet-btn sp-agents-toggle" onClick={() => setShowMobileAgents(v => !v)} aria-expanded={showMobileAgents} aria-controls="sp-agent-rail"><Bot size={16}/> Agents</button><button className="sp-quiet-btn" onClick={() => setShowConsole(v => !v)} aria-expanded={showConsole}><Terminal size={16}/> Console</button>
    </header>
    <div className="sp-toolbar" aria-label="Camera controls">
      <div className="sp-tool-group"><span className="sp-toolbar-label">Camera</span><button onClick={() => setCamera(rotation.x - 8, rotation.y)} aria-label="Tilt camera up"><ChevronUp size={16}/></button><button onClick={() => setCamera(rotation.x + 8, rotation.y)} aria-label="Tilt camera down"><ChevronDown size={16}/></button><button onClick={() => setCamera(rotation.x, rotation.y - 12)} aria-label="Rotate camera left"><ArrowDownRight size={16}/></button><button onClick={() => setCamera(rotation.x, rotation.y + 12)} aria-label="Rotate camera right"><ArrowUpRight size={16}/></button><button onClick={resetCamera} aria-label="Reset camera"><RotateCcw size={15}/></button></div>
      <div className="sp-tool-group"><button onClick={() => setZoom(z => Math.max(.55, z - .1))} aria-label="Zoom out"><Minus size={15}/></button><span className="sp-zoom">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(z => Math.min(1.3, z + .1))} aria-label="Zoom in"><Plus size={15}/></button></div>
      <span className="sp-drag-hint"><span className="sp-mouse-glyph">↔</span> Drag to orbit · Select a building or agent</span>
    </div>
    <div className="sp-body">
      <div className="sp-city-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} role="application" aria-label="Interactive 3D city. Drag to rotate the camera. Select a building or agent for details.">
        <div className="sp-city-grid" aria-hidden="true"/>
        <div className="sp-world" style={{ transform: `translate(-50%, -50%) scale(${zoom}) rotateX(${rotation.x}deg) rotateZ(${rotation.y}deg)`, transition: dragRef.current || lowMotion ? 'none' : 'transform 180ms ease-out' }}>
          <div className="sp-city-ground"/>
          {Array.from({ length: 8 }, (_, i) => <div key={`road-h-${i}`} className="sp-road sp-road-h" style={{ top: `${13 + i * 10}%` }}/>)}
          {Array.from({ length: 8 }, (_, i) => <div key={`road-v-${i}`} className="sp-road sp-road-v" style={{ left: `${9 + i * 11}%` }}/>)}
          {sites.map((site, index) => <button key={site.id} className={`sp-building ${selectedId === site.id ? 'is-selected' : ''}`} style={{ left: `${site.x}%`, top: `${site.y}%`, height: site.h, width: site.w, '--building-index': index } as React.CSSProperties} onClick={(e) => { e.stopPropagation(); buildingAction(site.id); }} aria-label={`Select ${site.name}, ${site.role}`}>
            <span className="sp-building-roof"><Building2 size={19}/></span><span className="sp-building-front"/><span className="sp-building-side"/><span className="sp-building-name">{site.name}</span>
          </button>)}
          {agents.map(agent => <AgentAvatar key={agent.id} agent={agent} selected={selectedId === agent.id} onSelect={() => setSelectedId(agent.id)}/>)}
          {activeAgents.length > 1 && <svg className="sp-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{activeAgents.slice(1).map((agent, i) => { const a = sites.find(s => s.id === activeAgents[0].id); const b = sites.find(s => s.id === agent.id); return a && b ? <line key={agent.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> : null; })}</svg>}
        </div>
        <div className="sp-stage-caption"><span><Activity size={14}/>{activeAgents.length ? `${activeAgents.length} agents active` : 'No active build steps'}</span><span>Obsidian city · Adaptive detail</span></div>
        {selectedAgent && <aside className="sp-inspector" aria-live="polite"><button className="sp-inspector-close" onClick={() => setSelectedId(null)} aria-label="Close agent details"><X size={15}/></button><span className="sp-inspector-kicker">Selected agent</span><h3>{selectedAgent.name}</h3><p>{selectedAgent.role}</p><div className="sp-inspector-status"><span style={{ background: statusColor[selectedAgent.status] }}/>{statusLabel[selectedAgent.status]}</div><dl><div><dt>Model</dt><dd>{selectedAgent.model || 'Not configured'}</dd></div><div><dt>Last action</dt><dd>{selectedAgent.lastAction || 'No task reported'}</dd></div></dl><button className="sp-inspector-action" onClick={() => { setActiveTab('debug'); addLog(`Opened debug view for ${selectedAgent.name}.`); }}>Open debug logs <ArrowUpRight size={14}/></button></aside>}
      </div>
      <aside id="sp-agent-rail" className={`sp-right-rail ${showMobileAgents ? 'is-mobile-open' : ''}`} aria-label="Agent controls">
        <div className="sp-rail-head"><span>Agent network</span><span>{agents.length.toString().padStart(2, '0')}</span></div>
        {agents.map(agent => <button className={`sp-agent-row ${selectedId === agent.id ? 'is-selected' : ''}`} key={agent.id} onClick={() => setSelectedId(agent.id)}><span className="sp-agent-symbol" style={{ color: statusColor[agent.status] }}><Bot size={17}/></span><span className="sp-agent-row-copy"><b>{agent.name}</b><small>{agent.role}</small></span><span className="sp-agent-row-status"><i style={{ background: statusColor[agent.status] }}/>{statusLabel[agent.status]}</span></button>)}
        <div className="sp-rail-divider"/>
        <div className="sp-rail-head"><span>Project signals</span><span>LIVE</span></div>
        <div className="sp-signal"><Code2 size={16}/><span><b>{files.length}</b><small>Project files</small></span></div>
        <div className="sp-signal"><Activity size={16}/><span><b>{activeAgents.length}</b><small>Active agents</small></span></div>
        <div className="sp-signal"><CheckCircle2 size={16}/><span><b>{agents.filter(a => a.status === 'completed').length}</b><small>Completed agents</small></span></div>
        <button className="sp-logs-toggle" onClick={() => setShowConsole(v => !v)}><Terminal size={15}/>{showConsole ? 'Hide activity' : 'View activity'}<ChevronDown size={14}/></button>
        {showConsole && <div className="sp-console" aria-live="polite">{recentLogs.map((line, i) => <p key={`${i}-${line}`}>{line}</p>)}</div>}
        <div className="sp-performance"><span>Rendering mode</span><b><span className="sp-performance-dot"/>{lowMotion ? 'Reduced motion' : 'Adaptive 3D'}</b><button onClick={() => setLowMotion(v => !v)}>{lowMotion ? 'Enable motion' : 'Reduce motion'}</button></div>
      </aside>
    </div>
  </section>;
}
