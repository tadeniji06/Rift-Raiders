import { useState } from 'react';
import {
  Activity, Shield, Zap, Target, ArrowRight, Check,
  Sword, Archive, MapPin, AlertTriangle, Star
} from 'lucide-react';

interface Props {
  onComplete: (name: string, classType: 'vanguard' | 'rogue') => void;
}

const CLASS_DATA = {
  vanguard: {
    label: 'VANGUARD',
    subtitle: 'Tank · Frontline · Brawler',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.08)',
    borderColor: '#22c55e',
    stats: { hp: 100, speed: 60, damage: 70, dodge: 50 },
    ability: 'Power Strike – Hits all enemies in a 45° cone.',
    passive: 'Iron Will – Takes 10% less damage while stationary.',
    description: 'The backbone of every squad. Walk into the fire, hold the line, and get out alive. Your 100 HP and heavy armour mean you can absorb punishment and keep pushing.',
    playstyle: 'Ideal for new players. Slower but forgiving.',
  },
  rogue: {
    label: 'ROGUE',
    subtitle: 'Assassin · Speed · Stealth',
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.08)',
    borderColor: '#a855f7',
    stats: { hp: 75, speed: 95, damage: 85, dodge: 90 },
    ability: 'Shadow Dash – Become nearly invisible during dodge (SHIFT).',
    passive: 'Glass Cannon – +20% damage but 25% less max HP.',
    description: 'Strike from the shadows, vanish before retaliation. Your speed is your survival. Rogue dash covers 50% more ground, making you near untouchable when mastered.',
    playstyle: 'High skill-ceiling. Lethal in the right hands.',
  },
};

const STEPS = [
  { id: 'welcome',  label: 'Welcome' },
  { id: 'loop',     label: 'The Loop' },
  { id: 'class',    label: 'Pick Class' },
  { id: 'name',     label: 'Your Name' },
];

function StatBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: 'var(--border-color)', borderRadius: 999 }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [selectedClass, setSelectedClass] = useState<'vanguard' | 'rogue'>('vanguard');
  const [callsign, setCallsign] = useState('');
  const [creating, setCreating] = useState(false);

  const cls = CLASS_DATA[selectedClass];

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    if (!callsign.trim()) return;
    setCreating(true);
    onComplete(callsign.trim(), selectedClass);
  };

  const progressPct = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-rift-bg text-rift-textWarm font-rajdhani selection:bg-rift-primary selection:text-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rift-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-12 relative z-10">
        <div className="flex justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i <= step ? 'bg-rift-primary text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-rift-surface border border-rift-primary/20 text-rift-textMuted'}`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= step ? 'text-rift-primary font-bold tracking-widest' : 'text-rift-textMuted font-medium tracking-wide'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-rift-surface border border-rift-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-rift-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-rift-surface/80 backdrop-blur-md border border-rift-primary/20 rounded-2xl p-8 md:p-12 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4" key={step}>

        {/* ── STEP 0: WELCOME ── */}
        {step === 0 && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-rift-primary/20 to-transparent border border-rift-primary/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <Activity size={40} className="text-rift-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg mb-4">RIFT RAIDERS</h1>
            <p className="text-rift-textMuted text-lg mb-8 leading-relaxed max-w-lg mx-auto">
              A highly tactical <strong>PvPvE extraction RPG</strong>.<br />
              Loot. Fight. Extract. Or lose everything.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              {[
                { icon: <Target size={18} />, label: 'PvP Combat' },
                { icon: <Shield size={18} />, label: 'AI Enemies' },
                { icon: <Archive size={18} />, label: 'Loot System' },
                { icon: <Zap size={18} />, label: 'Multiplayer' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-rift-primary/20 rounded-full text-rift-primary font-bold text-sm tracking-wide">
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
            <button onClick={next} className="bg-rift-primary hover:bg-green-400 text-black px-10 py-4 rounded-xl font-bold text-lg tracking-widest flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              ENTER THE RIFT <ArrowRight size={20} />
            </button>
            <div className="flex items-center justify-center gap-2 mt-8 p-4 bg-rarity-legendary/10 border border-rarity-legendary/30 rounded-xl text-rarity-legendary text-sm">
              <AlertTriangle size={18} /> <strong>DISCLAIMER:</strong> Play on a desktop browser for the best experience.
            </div>
          </div>
        )}

        {/* ── STEP 1: THE LOOP ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-rift-primary tracking-widest mb-2">HOW TO SURVIVE</h2>
            <p className="text-rift-textMuted mb-8 text-lg">Every expedition follows the same loop — but the tension is always different.</p>
            
            <div className="space-y-4 mb-10">
              {[
                { num: '01', icon: <Target size={16} />,        title: 'DEPLOY',          desc: 'Drop into a live arena with real players and AI enemies.',                        color: 'text-rift-primary' },
                { num: '02', icon: <Sword size={16} />,         title: 'EXPLORE & FIGHT', desc: 'Kill Goblins for loot. Defeat the Rift Warden for legendary drops.',             color: 'text-rarity-rare' },
                { num: '03', icon: <AlertTriangle size={16} />, title: 'DECIDE',          desc: 'More loot = more risk. Other players can kill you and steal everything.',       color: 'text-rarity-legendary' },
                { num: '04', icon: <MapPin size={16} />,        title: 'EXTRACT OR DIE',  desc: 'Reach the blue beacon zone. Hold it for 4 seconds to escape with your loot.', color: 'text-rift-primary' },
                { num: '05', icon: <Star size={16} />,          title: 'PROGRESS',        desc: 'Extracted loot goes to your permanent stash. Earn XP, level up.',              color: 'text-rarity-epic' },
              ].map(step => (
                <div key={step.num} className="flex gap-4 items-start p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div className={`text-2xl font-black font-mono mt-1 ${step.color}`}>{step.num}</div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2 mb-1 tracking-wide">
                      <span className={step.color}>{step.icon}</span> {step.title}
                    </div>
                    <div className="text-sm text-rift-textMuted leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold tracking-widest transition-colors" onClick={back}>BACK</button>
              <button onClick={next} className="flex-1 bg-rift-primary hover:bg-green-400 text-black px-8 py-4 rounded-xl font-bold text-lg tracking-widest flex items-center justify-center gap-3 transition-all">
                CHOOSE CLASS <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: CLASS SELECT ── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-rift-primary tracking-widest mb-2">SELECT YOUR CLASS</h2>
            <p className="text-rift-textMuted mb-8 text-lg">This choice is permanent. Choose wisely, Operator.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {(['vanguard', 'rogue'] as const).map(c => {
                const d = CLASS_DATA[c];
                const active = selectedClass === c;
                return (
                  <button key={c} onClick={() => setSelectedClass(c)} className={`text-left p-5 rounded-xl border-2 transition-all flex flex-col gap-2 ${active ? 'bg-black/60 shadow-lg' : 'bg-black/20 border-white/10 hover:border-white/20'}`} style={{ borderColor: active ? d.color : undefined }}>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-black text-xl tracking-wider" style={{ color: d.color }}>{d.label}</span>
                      {active && <Check size={20} color={d.color} />}
                    </div>
                    <span className="text-xs font-mono text-rift-textMuted uppercase">{d.subtitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Class detail card */}
            <div className="p-6 bg-black/40 rounded-xl border border-white/10 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl" style={{ background: cls.color }}></div>
              <p className="text-rift-textWarm text-sm leading-relaxed mb-6 relative z-10">{cls.description}</p>
              
              {/* Stat bars */}
              <div className="space-y-3 mb-6 relative z-10">
                {([
                  ['HP',     cls.stats.hp],
                  ['SPEED',  cls.stats.speed],
                  ['DAMAGE', cls.stats.damage],
                  ['DODGE',  cls.stats.dodge],
                ] as [string, number][]).map(([label, val]) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-rift-textMuted w-14 font-mono tracking-widest">{label}</span>
                    <StatBar value={val} color={cls.color} />
                    <span className="text-xs font-bold w-8 text-right" style={{ color: cls.color }}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 relative z-10 pt-4 border-t border-white/10">
                <div className="text-sm flex items-start gap-2">
                  <Zap size={16} className="mt-0.5 shrink-0" style={{ color: cls.color }} />
                  <div><strong className="tracking-widest uppercase text-[10px] block mb-0.5 text-rift-textMuted">Ability</strong> <span className="text-white font-medium">{cls.ability}</span></div>
                </div>
                <div className="text-sm flex items-start gap-2">
                  <Shield size={16} className="mt-0.5 shrink-0 text-rift-textMuted" />
                  <div><strong className="tracking-widest uppercase text-[10px] block mb-0.5 text-rift-textMuted">Passive</strong> <span className="text-rift-textMuted">{cls.passive}</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold tracking-widest transition-colors" onClick={back}>BACK</button>
              <button onClick={next} className="flex-1 text-black px-8 py-4 rounded-xl font-bold text-lg tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02]" style={{ background: cls.color, boxShadow: `0 0 20px ${cls.color}40` }}>
                CONFIRM {cls.label} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: NAME ── */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-rift-primary tracking-widest mb-2">IDENTIFY YOURSELF</h2>
            <p className="text-rift-textMuted mb-8 text-lg">Your callsign will be visible to all operators in the Rift. Make it count.</p>
            
            <div className="mb-8 relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Target size={24} className="text-rift-primary/50" />
              </div>
              <input 
                type="text" 
                placeholder="Enter Callsign..." 
                value={callsign} 
                onChange={e => setCallsign(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && callsign.trim() && finish()}
                maxLength={12}
                autoFocus
                className="w-full bg-black/60 border-2 border-rift-primary/30 rounded-xl px-14 py-6 text-3xl font-black tracking-widest text-white uppercase outline-none focus:border-rift-primary transition-colors shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute right-5 bottom-[-28px] text-xs font-mono text-rift-textMuted">
                {callsign.length}/12 CHARACTERS
              </div>
            </div>

            <div className="p-5 bg-rift-primary/10 border border-rift-primary/20 rounded-xl flex items-start gap-4 mb-10">
              <Shield size={24} className="text-rift-primary shrink-0 mt-0.5" />
              <p className="text-sm text-rift-textWarm/80 leading-relaxed font-medium">
                By deploying, you accept that death in the Rift means losing all unextracted loot. Trust no one.
              </p>
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold tracking-widest transition-colors" onClick={back} disabled={creating}>BACK</button>
              <button 
                onClick={finish} 
                disabled={!callsign.trim() || creating}
                className={`flex-1 bg-rift-primary text-black px-8 py-4 rounded-xl font-bold text-lg tracking-widest flex items-center justify-center gap-3 transition-all ${!callsign.trim() || creating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)]'}`}
              >
                {creating ? 'INITIALIZING...' : 'INITIALIZE DEPLOYMENT'} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <p className="mt-8 text-rift-textMuted text-sm font-mono tracking-widest opacity-50 relative z-10">
        RIFT RAIDERS · VERSION 0.1.0 · ALL ACTIONS ARE LOGGED
      </p>
    </div>
  );
}
