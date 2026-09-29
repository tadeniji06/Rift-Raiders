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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at center, #0a1f12 0%, #050a06 100%)' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 className="glowing-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>RIFT RAIDERS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter the extraction zone</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="email" placeholder="Operator Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Passcode" value={password} onChange={e => setPassword(e.target.value)} />
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => handleAuth(false)} disabled={loading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              LOGIN <ChevronRight size={18} />
            </button>
            <button className="secondary" onClick={() => handleAuth(true)} disabled={loading} style={{ flex: 1 }}>
              REGISTER
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR DEPLOY WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <button onClick={handleWeb3Login} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}>
            <Fingerprint size={18} color="var(--accent-primary)" /> CONNECT WEB3 WALLET (ETH)
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
  return (
    <div className="container lobby-layout">
      <header className="lobby-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color="var(--accent-primary)" />
          <div>
            <h2 className="glowing-text" style={{ margin: 0, color: 'var(--accent-primary)' }}>COMMAND CENTER</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              OPERATOR: <strong style={{ color: 'var(--text-primary)' }}>{character.name}</strong> | CLASS: <span style={{ textTransform: 'uppercase', color: character.class_type === 'rogue' ? '#7c3aed' : '#166534', fontWeight: 'bold' }}>{character.class_type}</span> | LVL: {character.level}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ThemeToggle />
          <button className="secondary" onClick={() => setShowLeaderboard(!showLeaderboard)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={16} /> {showLeaderboard ? 'HIDE LEADERBOARD' : 'LEADERBOARD'}
          </button>
          <button className="secondary" onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> DISCONNECT
          </button>
        </div>
      </header>

      {showLeaderboard && (
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy size={20} /> GLOBAL LEADERBOARD (XP)</h3>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            {leaderboard.map((player, index) => (
              <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: index < leaderboard.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ color: index === 0 ? '#d97706' : index === 1 ? '#64748b' : index === 2 ? '#b45309' : 'var(--text-primary)', fontWeight: 'bold' }}>
                  #{index + 1} {player.name}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>LVL {player.level} | {player.xp} XP</span>
              </div>
            ))}
            {leaderboard.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No ranked operators yet.</span>}
          </div>
        </section>
      )}

      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>YOUR STASH</h3>
        <div className="glass-panel" style={{ padding: '1rem', minHeight: '100px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {inventory.length === 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>Stash is empty. Extract items from the arena!</span>
          ) : (
            inventory.map(item => (
              <div key={item.id} style={{ padding: '0.5rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <span style={{ color: item.item_name.includes('Legendary') ? '#d97706' : item.item_name.includes('Epic') ? '#7c3aed' : '#475569' }}>
                  {item.item_name}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
      
      <section>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Arenas</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {MOCK_ARENAS.map(arena => (
            <div key={arena.id} className="glass-panel" style={{ 
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              opacity: arena.status === 'ACTIVE' ? 1 : 0.5,
              borderColor: arena.status === 'ACTIVE' ? 'var(--accent-primary)' : 'var(--border-color)',
              boxShadow: arena.status === 'ACTIVE' ? '0 0 20px rgba(34,197,94,0.1)' : 'none'
            }}>
              
              {arena.status === 'ACTIVE' && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-primary)', color: '#000', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderBottomLeftRadius: '8px' }}>
                  ACTIVE ZONES
                </div>
              )}

              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {arena.name}
                {arena.status !== 'ACTIVE' && <Lock size={16} color="var(--text-muted)" />}
              </h4>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', flex: 1, lineHeight: 1.5 }}>
                {arena.description}
              </p>
              
              {arena.status === 'ACTIVE' ? (
                <button onClick={() => navigate(`/arena/${arena.id}?class=${character.class_type}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                  <Play size={16} /> DEPLOY
                </button>
              ) : (
                <button disabled style={{ width: '100%' }}>
                  OFFLINE
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
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
