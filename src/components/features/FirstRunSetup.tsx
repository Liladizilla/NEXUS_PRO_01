import React, { useState } from 'react';
import { Box, Check, ChevronLeft, ChevronRight, Code2, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './first-run-setup.css';

export type WorkspaceMode = 'spatial' | 'classic';
type SetupProps = { onComplete: (mode: WorkspaceMode) => void };

export function FirstRunSetup({ onComplete }: SetupProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<WorkspaceMode>('spatial');
  const [role, setRole] = useState('developer');
  const [focus, setFocus] = useState('speed');
  const [motionEnabled, setMotionEnabled] = useState(true);
  const finish = () => {
    try { localStorage.setItem('odyseus-preferences-v1', JSON.stringify({ mode, role, focus, motionEnabled, completedAt: new Date().toISOString() })); } catch { /* private browsing */ }
    onComplete(mode);
  };
  const questions = [
    { title: 'How do you want to work?', subtitle: 'You can change this later in Settings.' },
    { title: 'What best describes you?', subtitle: 'We will tune the workspace to how you build.' },
    { title: 'What matters most?', subtitle: 'Choose the defaults that help you move faster.' }
  ];
  const choices = step === 1
    ? [{ id:'developer', title:'Software developer', detail:'Code, architecture and debugging' }, { id:'founder', title:'Founder or product builder', detail:'Turn ideas into working products' }, { id:'designer', title:'Designer', detail:'Shape interfaces and experiences' }, { id:'learner', title:'Learning as I go', detail:'Guidance and clear explanations' }]
    : [{ id:'speed', title:'Move quickly', detail:'Keep the path from idea to build short' }, { id:'control', title:'Fine-grained control', detail:'See files, agents and build details' }, { id:'quality', title:'Quality and reliability', detail:'Prioritize testing and maintainability' }, { id:'explore', title:'Explore ideas visually', detail:'See the system as a living workspace' }];
  const isSelected = (id: string) => (step === 1 ? role : focus) === id;
  return <div className="first-run-backdrop" role="dialog" aria-modal="true" aria-labelledby="first-run-title">
    <motion.section className="first-run-panel" initial={{ opacity:0, y:18, scale:.985 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:.24 }}>
      <div className="first-run-brand"><span><Compass size={18}/></span><b>ODYSEUS</b><small>WORKSPACE SETUP</small></div>
      <div className="first-run-progress" aria-label={'Step ' + (step+1) + ' of 3'}>{[0,1,2].map(i=><i key={i} className={i<=step?'is-active':''}/>)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.16}}>
          <p className="first-run-step">STEP 0{step+1} / 03</p>
          <h1 id="first-run-title">{questions[step].title}</h1><p className="first-run-subtitle">{questions[step].subtitle}</p>
          {step===0 ? <div className="first-run-mode-grid">
            <button type="button" className={'first-run-mode '+(mode==='spatial'?'is-selected':'')} onClick={()=>setMode('spatial')} aria-pressed={mode==='spatial'}>
              <span className="first-run-mode-art spatial-art"><i/><i/><i/><i/><b><Box size={18}/></b></span><strong>3D agent world</strong><small>A spatial studio where agents inhabit a living workspace.</small>{mode==='spatial'&&<em><Check size={14}/> Selected</em>}
            </button>
            <button type="button" className={'first-run-mode '+(mode==='classic'?'is-selected':'')} onClick={()=>setMode('classic')} aria-pressed={mode==='classic'}>
              <span className="first-run-mode-art classic-art"><i/><i/><i/><b><Code2 size={18}/></b></span><strong>Classic 2D workspace</strong><small>A focused, familiar builder with panels and editor tabs.</small>{mode==='classic'&&<em><Check size={14}/> Selected</em>}
            </button>
          </div> : <div className="first-run-choice-list">{choices.map(choice=><button key={choice.id} type="button" className={'first-run-choice '+(isSelected(choice.id)?'is-selected':'')} onClick={()=>step===1?setRole(choice.id):setFocus(choice.id)} aria-pressed={isSelected(choice.id)}><span className="first-run-choice-radio"/><span><strong>{choice.title}</strong><small>{choice.detail}</small></span>{isSelected(choice.id)&&<Check size={16}/>}</button>)}</div>}
          {step===2&&<button type="button" className="first-run-motion" onClick={()=>setMotionEnabled(v=>!v)} aria-pressed={motionEnabled}><span><Sparkles size={16}/></span><span><strong>Animated agent movement</strong><small>{motionEnabled?'Agents can move around the world':'Use reduced visual motion'}</small></span><span className={'first-run-toggle '+(motionEnabled?'is-on':'')}><i/></span></button>}
        </motion.div>
      </AnimatePresence>
      <div className="first-run-footer">{step>0?<button type="button" className="first-run-back" onClick={()=>setStep(s=>s-1)}><ChevronLeft size={16}/> Back</button>:<span className="first-run-footnote">3 quick choices. You can change these later.</span>}<button type="button" className="first-run-next" onClick={()=>step<2?setStep(s=>s+1):finish()}>{step<2?'Continue':'Enter workspace'} <ChevronRight size={16}/></button></div>
    </motion.section>
  </div>;
}
