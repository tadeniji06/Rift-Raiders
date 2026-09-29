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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 60% 0%, rgba(34,197,94,0.08) 0%, var(--bg-primary) 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= step ? 'var(--accent-primary)' : 'var(--border-color)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.3s',
              }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.75rem', color: i <= step ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 400 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 999 }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Card */}
      <div className="glass-panel fade-in" style={{ padding: '3rem', width: '100%', maxWidth: 640 }} key={step}>

        {/* ── STEP 0: WELCOME ── */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <Activity size={56} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.5))' }} />
            </div>
            <h1 className="glowing-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>RIFT RAIDERS</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              A top-down <strong>PvPvE extraction RPG</strong>.<br />
              Loot. Fight. Extract. Or die trying.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {[
                { icon: <Target size={20} />, label: 'PvP Combat' },
                { icon: <Shield size={20} />, label: 'AI Enemies' },
                { icon: <Archive size={20} />, label: 'Loot System' },
                { icon: <Zap size={20} />, label: 'Live Multiplayer' },
              ].map(f => (
                <div key={f.label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', background: 'var(--accent-soft)',
                  borderRadius: 999, border: '1px solid var(--border-strong)',
                  color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem'
                }}>
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
            <button onClick={next} style={{ fontSize: '1rem', padding: '0.85rem 2.5rem' }}>
              ENTER THE RIFT <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 1: THE LOOP ── */}
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>HOW TO SURVIVE</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
              Every expedition follows the same loop — but the tension is always different.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { num: '01', icon: <Target size={14} />,        title: 'DEPLOY',          desc: 'Drop into a live arena with real players and AI enemies.',                        color: '#22c55e' },
                { num: '02', icon: <Sword size={14} />,         title: 'EXPLORE & FIGHT', desc: 'Kill Goblins for loot. Defeat the Rift Warden for legendary drops.',             color: '#3b82f6' },
                { num: '03', icon: <AlertTriangle size={14} />, title: 'DECIDE',          desc: 'More loot = more risk. Other players can kill you and steal everything.',       color: '#f59e0b' },
                { num: '04', icon: <MapPin size={14} />,        title: 'EXTRACT OR DIE',  desc: 'Reach the blue beacon zone. Hold it for 5 seconds to escape with your loot.', color: '#22c55e' },
                { num: '05', icon: <Star size={14} />,          title: 'PROGRESS',        desc: 'Extracted loot goes to your permanent stash. Earn XP, level up.',              color: '#a855f7' },
              ].map(step => (
                <div key={step.num} style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  padding: '1rem 1.25rem', background: 'var(--bg-primary)',
                  borderRadius: 8, border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: step.color, fontFamily: 'JetBrains Mono, monospace', minWidth: 36 }}>{step.num}</div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: step.color }}>{step.icon}</span> {step.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="secondary" onClick={back}>BACK</button>
              <button onClick={next} style={{ flex: 1 }}>CHOOSE CLASS <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* ── STEP 2: CLASS SELECT ── */}
        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>SELECT YOUR CLASS</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This choice is permanent. Choose wisely, Operator.</p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {(['vanguard', 'rogue'] as const).map(c => {
                const d = CLASS_DATA[c];
                const active = selectedClass === c;
                return (
                  <button key={c} onClick={() => setSelectedClass(c)} className="secondary" style={{
                    flex: 1, padding: '1.25rem', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start',
                    background: active ? d.bgColor : 'transparent',
                    borderColor: active ? d.color : 'var(--border-color)',
                    borderWidth: active ? 2 : 1, outline: 'none',
                    color: 'var(--text-primary)'
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: d.color }}>{d.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.subtitle}</span>
                    {active && <Check size={16} color={d.color} style={{ alignSelf: 'flex-end' }} />}
                  </button>
                );
              })}
            </div>

            {/* Class detail card */}
            <div style={{ padding: '1.5rem', background: cls.bgColor, borderRadius: 10, border: `1px solid ${cls.borderColor}`, marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>{cls.description}</p>
              
              {/* Stat bars */}
              {([
                ['HP',     cls.stats.hp],
                ['SPEED',  cls.stats.speed],
                ['DAMAGE', cls.stats.damage],
                ['DODGE',  cls.stats.dodge],
              ] as [string, number][]).map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', width: 52, fontFamily: 'monospace' }}>{label}</span>
                  <StatBar value={val} color={cls.color} />
                  <span style={{ fontSize: '0.75rem', color: cls.color, width: 28, textAlign: 'right', fontWeight: 700 }}>{val}</span>
                </div>
              ))}

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: cls.color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={13} /> <strong>ABILITY:</strong> {cls.ability}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={13} /> <strong>PASSIVE:</strong> {cls.passive}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{cls.playstyle}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="secondary" onClick={back}>BACK</button>
              <button onClick={next} style={{ flex: 1, background: cls.color }}>
                CONFIRM {cls.label} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: NAME ── */}
        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>NAME YOUR OPERATOR</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
              Your callsign appears on the leaderboard and above your character in game.<br />
              Make it count.
            </p>

            <div style={{
              padding: '1.25rem', background: 'var(--bg-primary)', borderRadius: 10,
              border: `1px solid ${cls.borderColor}`, marginBottom: '2rem',
              display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: cls.bgColor, border: `1px solid ${cls.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedClass === 'vanguard' ? <Shield size={24} color={cls.color} /> : <Zap size={24} color={cls.color} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: cls.color }}>{callsign || 'YOUR_CALLSIGN'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{cls.label} · Level 1</div>
              </div>
            </div>

            <input
              type="text"
              placeholder="e.g. GHOST, VIPER, NOVA..."
              value={callsign}
              maxLength={20}
              onChange={e => setCallsign(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && callsign.trim() && finish()}
              style={{ marginBottom: '0.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', letterSpacing: '0.05em' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Letters, numbers and underscores only · {20 - callsign.length} characters remaining
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="secondary" onClick={back}>BACK</button>
              <button
                onClick={finish}
                disabled={!callsign.trim() || creating}
                style={{ flex: 1, background: cls.color }}
              >
                {creating ? 'INITIALIZING...' : `DEPLOY AS ${callsign || 'OPERATOR'}`} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Rift Raiders · Early Access · All data is persistent
      </p>
    </div>
  );
}
