import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import './index.css';
import { LogOut, Play, Lock, Activity, Fingerprint, Trophy, Sun, Moon, ChevronRight } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import { GameComponent } from './game/GameComponent';
import { Onboarding } from './Onboarding';

// Dark mode context

// --- Types ---
type Arena = { id: string; name: string; status: 'ACTIVE' | 'COMING_SOON'; description: string };

// --- Mock Data ---
const MOCK_ARENAS: Arena[] = [
  { id: 'near-launchpad', name: 'NEAR Launchpad', status: 'ACTIVE', description: 'An abandoned magical launch facility built around a Rift. PvPvE.' },
  { id: 'crimson-mines', name: 'Crimson Mines', status: 'COMING_SOON', description: 'Deep underground mines.' },
  { id: 'sunken-city', name: 'Sunken City', status: 'COMING_SOON', description: 'An ancient city submerged in water.' },
  { id: 'the-abyss', name: 'The Abyss', status: 'COMING_SOON', description: 'The darkest depths of the rift.' }
];

// --- Screens ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleWeb3Login = async () => {
    if (!(window as any).ethereum) {
      alert("No Web3 wallet detected. Please install MetaMask.");
      return;
    }
    setLoading(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      
      // Supabase native Web3 auth attempt
      // Ensure Web3 is enabled in your Supabase Auth dashboard
      const { error } = await (supabase.auth as any).signInWithWeb3({
        chain: 'ethereum',
        statement: 'Log into Rift Raiders Command Center',
      });

      if (error) throw error;
    } catch (err: any) {
      alert(err.message || "Failed to authenticate with Web3.");
    }
    setLoading(false);
  };

  return (
    <div className="login-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #0a1f12 0%, #050a06 100%)' }}>
      <div className="glass-panel login-panel">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 className="glowing-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>RIFT RAIDERS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter the extraction zone</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="email" placeholder="Operator Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Passcode" value={password} onChange={e => setPassword(e.target.value)} />
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleAuth(false)} disabled={loading} style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              LOGIN <ChevronRight size={18} />
            </button>
            <button className="secondary" onClick={() => handleAuth(true)} disabled={loading} style={{ flex: '1 1 120px' }}>
              REGISTER
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR DEPLOY WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <button onClick={handleWeb3Login} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#1a1a1a', color: '#fff', border: '1px solid #333', fontSize: 'clamp(0.7rem, 3vw, 0.85rem)' }}>
            <Fingerprint size={18} color="var(--accent-primary)" /> CONNECT WEB3 WALLET
          </button>
        </div>
      </div>
    </div>
  );
}

function Lobby() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [character, setCharacter] = useState<any>(null);
  const [loadingChar, setLoadingChar] = useState(true);
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      // Fetch Character
      const { data: charData } = await supabase
        .from('characters')
        .select('*')
        .eq('profile_id', user.user.id)
        .single();
      
      if (charData) setCharacter(charData);
      setLoadingChar(false);

      // Fetch Inventory
      const { data: invData } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('profile_id', user.user.id)
        .order('created_at', { ascending: false });
        
      if (invData) setInventory(invData);
      
      // Fetch Leaderboard
      const { data: leadData } = await supabase
        .from('characters')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10);
      
      if (leadData) setLeaderboard(leadData);
    };
    fetchData();
  }, []);

  if (loadingChar) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Activity size={48} color="var(--accent-primary)" style={{ animation: 'pulse 2s infinite' }} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontFamily: 'monospace' }}>LOADING COMMAND CENTER...</p>
      </div>
    </div>
  );

  // ONBOARDING: If no character yet, show the full wizard
  if (!character) {
    const handleOnboardingComplete = async (name: string, classType: 'vanguard' | 'rogue') => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { error } = await supabase.from('characters').insert({
        profile_id: user.user.id,
        name,
        class_type: classType,
      });
      if (error) alert(error.message);
      else window.location.reload();
    };
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // LOBBY
  const highValue = inventory.filter(i => i.item_name.includes('Legendary') || i.item_name.includes('Epic')).length;

  return (
    <div className="min-h-screen bg-rift-bg text-rift-textWarm font-rajdhani selection:bg-rift-primary selection:text-black flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-rift-primary/20 bg-rift-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-rift-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <h1 className="text-2xl font-bold text-rift-primary tracking-widest drop-shadow-[0_0_12px_rgba(34,197,94,0.3)]">RIFT RAIDERS</h1>
            </div>
            <nav className="hidden md:flex gap-6 text-sm tracking-widest font-semibold text-rift-textMuted">
              <a href="#" className="text-rift-primary border-b-2 border-rift-primary py-5">COMMAND CENTER</a>
              <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="hover:text-rift-textWarm transition-colors py-5 uppercase">
                {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold leading-tight">{character.name}</div>
               <div className="text-[10px] text-rift-primary tracking-widest uppercase">Lvl {character.level} {character.class_type}</div>
             </div>
             <div className="h-8 w-px bg-rift-primary/20"></div>
             <ThemeToggle />
             <button onClick={() => supabase.auth.signOut()} className="text-rift-textMuted hover:text-rarity-mythic transition-colors" title="Disconnect">
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column (Player & Stash) */}
        <div className="lg:col-span-4 space-y-8">
           {/* Player Card */}
           <div className="bg-rift-surface border border-rift-primary/20 rounded-xl p-7 relative overflow-hidden group shadow-lg">
             <div className="absolute top-0 left-0 w-1 h-full bg-rift-primary group-hover:shadow-[0_0_15px_#22c55e] transition-shadow"></div>
             <h3 className="text-xs tracking-widest text-rift-textMuted uppercase mb-4 flex items-center gap-2">
               <Fingerprint size={14} className="text-rift-primary" /> Operator Status
             </h3>
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rift-primary/20 to-transparent border border-rift-primary/30 rounded-lg flex items-center justify-center text-3xl font-bold text-rift-primary shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  {character.name.charAt(0)}
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-wide">{character.name}</div>
                  <div className="text-sm font-mono text-rift-primary uppercase font-bold tracking-wider">{character.class_type}</div>
                </div>
             </div>
             
             {/* Stats */}
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-lg border border-rift-primary/10 hover:border-rift-primary/30 transition-colors">
                  <div className="text-[10px] text-rift-textMuted tracking-widest uppercase mb-1">XP Level</div>
                  <div className="text-lg font-mono font-semibold">{character.level}</div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-rift-primary/10 hover:border-rarity-legendary/40 transition-colors">
                  <div className="text-[10px] text-rift-textMuted tracking-widest uppercase mb-1">High Value</div>
                  <div className="text-lg font-mono font-semibold text-rarity-legendary">{highValue}</div>
                </div>
             </div>
           </div>

           {/* Stash */}
           <div className="bg-rift-surface border border-rift-primary/20 rounded-xl p-7 shadow-lg flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs tracking-widest text-rift-textMuted uppercase">Secured Stash</h3>
                 <span className="text-xs font-mono text-rift-textMuted bg-black/40 px-2 py-1 rounded">{inventory.length} Items</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-rift-primary/20 scrollbar-track-transparent">
                {inventory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-rift-textMuted text-sm">
                    <Lock size={32} className="mb-2 opacity-50" />
                    Stash is empty.<br/>Survive the rift to secure loot.
                  </div>
                ) : (
                  inventory.map(item => {
                    const isLeg = item.item_name.includes('Legendary');
                    const isEpic = item.item_name.includes('Epic');
                    const color = isLeg ? 'text-rarity-legendary border-rarity-legendary/50' : isEpic ? 'text-rarity-epic border-rarity-epic/50' : 'text-rarity-common border-rarity-common/30';
                    const bg = isLeg ? 'bg-rarity-legendary/10 hover:bg-rarity-legendary/20' : isEpic ? 'bg-rarity-epic/10 hover:bg-rarity-epic/20' : 'bg-white/5 hover:bg-white/10';
                    const glow = isLeg ? 'shadow-[0_0_8px_#f59e0b]' : isEpic ? 'shadow-[0_0_8px_#a855f7]' : '';
                    
                    return (
                      <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-default ${bg} ${color}`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLeg ? 'bg-rarity-legendary' : isEpic ? 'bg-rarity-epic' : 'bg-rarity-common'} ${glow}`}></div>
                        <div className="font-mono text-sm truncate font-semibold tracking-tight">{item.item_name}</div>
                      </div>
                    )
                  })
                )}
              </div>
           </div>
        </div>

        {/* Right Column (Arenas) */}
        <div className="lg:col-span-8 space-y-12">
          {showLeaderboard && (
             <div className="bg-rift-surface border border-rarity-legendary/30 rounded-xl p-8 shadow-[0_0_30px_rgba(245,158,11,0.05)] animate-in fade-in slide-in-from-top-4">
               <h3 className="text-lg text-rarity-legendary font-bold tracking-widest flex items-center gap-2 mb-4"><Trophy size={20}/> GLOBAL LEADERBOARD</h3>
               <div className="space-y-1">
                 {leaderboard.map((p, i) => (
                   <div key={p.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0">
                     <div className="flex gap-4 items-center">
                        <span className={`font-mono text-lg font-bold ${i===0?'text-rarity-legendary':i===1?'text-gray-300':i===2?'text-orange-700':'text-rift-textMuted'}`}>#{i+1}</span>
                        <span className="font-bold text-lg tracking-wide">{p.name}</span>
                     </div>
                     <div className="text-sm font-mono text-rift-textMuted bg-black/40 px-3 py-1 rounded">LVL {p.level} • <span className="text-white">{p.xp} XP</span></div>
                   </div>
                 ))}
                 {leaderboard.length === 0 && <div className="text-rift-textMuted font-mono">No operators ranked yet.</div>}
               </div>
             </div>
          )}

          <h2 className="text-sm tracking-widest text-rift-textMuted uppercase mb-4 flex items-center gap-2">
            <Activity size={16} className="text-rift-primary" /> Active Deployment Zones
          </h2>
          
          {/* Hero Arena: NEAR Launchpad */}
          <div className="relative rounded-2xl overflow-hidden border border-rift-primary/30 group shadow-2xl transition-all duration-300 hover:border-rift-primary">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-gradient-to-br from-rift-primary/20 via-[#0a150a] to-black z-0"></div>
             <div className="absolute top-0 right-0 w-96 h-96 bg-rift-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-rift-primary/20 transition-all duration-700"></div>
             
             <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="max-w-xl">
                  <div className="inline-block px-3 py-1 bg-rift-primary text-black text-xs font-bold tracking-widest mb-4 rounded shadow-[0_0_15px_rgba(34,197,94,0.5)] uppercase">
                    Live Zone
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg tracking-tight">NEAR LAUNCHPAD</h2>
                  <p className="text-rift-textWarm/80 text-lg mb-6 leading-relaxed font-medium">An abandoned magical launch facility built around a volatile Rift. Extreme PvPvE combat zone.</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm font-mono text-rift-textMuted">
                    <div className="flex items-center gap-2 bg-black/60 border border-white/5 px-3 py-1.5 rounded-lg font-semibold"><Activity size={16} className="text-rift-primary"/> PvPvE</div>
                    <div className="flex items-center gap-2 bg-black/60 border border-white/5 px-3 py-1.5 rounded-lg font-semibold text-rarity-legendary">RISK: HIGH</div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/arena/near-launchpad?class=${character.class_type}`)}
                  className="w-full md:w-auto px-10 py-5 bg-rift-primary hover:bg-[#4ade80] text-black font-bold text-xl tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] group/btn"
                >
                  <Play fill="currentColor" className="group-hover/btn:scale-110 transition-transform" /> DEPLOY NOW
                </button>
             </div>
          </div>

          <h2 className="text-sm tracking-widest text-rift-textMuted uppercase pt-6 mb-4 border-t border-rift-primary/10">Classified Sectors (Locked)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {MOCK_ARENAS.filter(a => a.id !== 'near-launchpad').map(arena => (
               <div key={arena.id} className="bg-rift-surface/40 border border-rift-primary/10 rounded-xl p-5 relative overflow-hidden opacity-50 hover:opacity-80 transition-opacity">
                 <div className="flex items-center justify-between mb-3">
                   <h4 className="font-bold text-lg text-white tracking-wide">{arena.name}</h4>
                   <Lock size={16} className="text-rift-textMuted" />
                 </div>
                 <p className="text-sm text-rift-textMuted mb-6 line-clamp-2 leading-relaxed">{arena.description}</p>
                 <div className="text-[10px] tracking-widest text-rift-primary font-mono bg-rift-primary/10 inline-block px-2 py-1 rounded font-bold uppercase">COMING SOON</div>
               </div>
             ))}
          </div>

        </div>
      </main>
    </div>
  );
}

function ArenaMatch() {
  const navigate = useNavigate();
  const [loot, setLoot] = useState<string[]>([]);
  const params = new URLSearchParams(window.location.search);
  const playerClass = (params.get('class') as 'vanguard' | 'rogue') || 'vanguard';
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  useEffect(() => {
    let currentLoot: string[] = [];
    
    const handleLoot = async (e: any) => {
      const newItem = e.detail.item;
      currentLoot.push(newItem);
      setLoot([...currentLoot]);
      
      // Auto-save to DB immediately for better UX
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('inventory_items').insert([{
          profile_id: user.user.id,
          item_name: newItem
        }]);
      }
    };
    
    const handleExtract = async () => {
      // Loot is already auto-saved, just navigate
      setModalConfig({
        isOpen: true,
        title: 'SUCCESS',
        message: `SUCCESSFULLY EXTRACTED! Saved ${currentLoot.length} item(s) to stash.`,
        confirmText: 'Return to Lobby',
        onConfirm: () => navigate('/lobby')
      });
    };

    const handleDeath = async () => {
      // Loot is already auto-saved!
      setModalConfig({
        isOpen: true,
        title: 'YOU DIED',
        message: `Your operator went down... but we recovered your ${currentLoot.length} item(s)!`,
        confirmText: 'Restart Mission',
        onConfirm: () => window.location.reload(),
        cancelText: 'Return to Menu',
        onCancel: () => navigate('/lobby')
      });
    };
    
    document.addEventListener('loot-pickup', handleLoot);
    document.addEventListener('match-extracted', handleExtract);
    document.addEventListener('match-died', handleDeath);
    return () => {
      document.removeEventListener('loot-pickup', handleLoot);
      document.removeEventListener('match-extracted', handleExtract);
      document.removeEventListener('match-died', handleDeath);
    };
  }, [navigate]);

  return (
    <div className="arena-layout" style={{ color: 'var(--text-primary)' }}>
      <header className="arena-header">
        <h2 className="glowing-text" style={{ color: 'var(--accent-primary)' }}>ZONE: NEAR LAUNCHPAD</h2>
        <div className="arena-controls">
          <ThemeToggle />
          {/* Loot badge */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>LOOT:</span>
            {loot.length === 0
              ? <span style={{ opacity: 0.5, color: 'var(--text-primary)' }}>EMPTY</span>
              : <span style={{ color: '#d97706', fontWeight: 'bold' }}>{loot.length} ITEM(S)</span>}
          </div>

          <span className="loot-detail" style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>LATENCY: 12ms | CONNECTED</span>
          <button onClick={() => {
            setModalConfig({
              isOpen: true,
              title: 'ABORT EXPEDITION?',
              message: 'Are you sure you want to abort? All unsaved loot will be LOST.',
              confirmText: 'Abort',
              cancelText: 'Cancel',
              onConfirm: () => navigate('/lobby')
            });
          }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} className="secondary">
            <LogOut size={14} /> ABORT
          </button>
        </div>
      </header>
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <GameComponent playerClass={playerClass} />
      </div>

      {/* Custom Modal Overlay */}
      {modalConfig && modalConfig.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-color)',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: modalConfig.title.includes('DIED') || modalConfig.title.includes('ABORT') ? '#ef4444' : '#22c55e' }}>
              {modalConfig.title}
            </h2>
            <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {modalConfig.cancelText && (
                <button 
                  className="secondary" 
                  onClick={() => {
                    if (modalConfig.onCancel) modalConfig.onCancel();
                    else setModalConfig(null);
                  }}
                  style={{ flex: 1 }}
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button 
                className="primary" 
                onClick={modalConfig.onConfirm}
                style={{ flex: 1 }}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Dark Mode Toggle Component ---
function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('rr-theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    return isDark;
  });

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      localStorage.setItem('rr-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      className="secondary"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem' }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}

// --- App Root ---
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore theme on mount
    const saved = localStorage.getItem('rr-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Activity className="glowing-text" size={48} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/lobby" />} />
        <Route path="/lobby" element={session ? <Lobby /> : <Navigate to="/login" />} />
        <Route path="/arena/:id" element={session ? <ArenaMatch /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={session ? "/lobby" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
