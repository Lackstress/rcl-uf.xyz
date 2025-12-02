import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Save, Plus, Trash2, Calendar, FileText, Link as LinkIcon, 
  Shield, Settings, Trophy, Clock, CheckCircle, 
  ChevronDown, ChevronUp, X, Users, Star, Zap, Database
} from 'lucide-react';
import { AUTH_KEY } from '../config/auth';
import PanelSettings from './PanelSettings';

const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Trigger storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: JSON.stringify(data),
      oldValue: null
    }));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// All 32 NFL Teams
const allNflTeams = [
  { id: 'cardinals', name: 'Arizona Cardinals', abbr: 'ARI', conf: 'NFC' },
  { id: 'falcons', name: 'Atlanta Falcons', abbr: 'ATL', conf: 'NFC' },
  { id: 'ravens', name: 'Baltimore Ravens', abbr: 'BAL', conf: 'AFC' },
  { id: 'bills', name: 'Buffalo Bills', abbr: 'BUF', conf: 'AFC' },
  { id: 'panthers', name: 'Carolina Panthers', abbr: 'CAR', conf: 'NFC' },
  { id: 'bears', name: 'Chicago Bears', abbr: 'CHI', conf: 'NFC' },
  { id: 'bengals', name: 'Cincinnati Bengals', abbr: 'CIN', conf: 'AFC' },
  { id: 'browns', name: 'Cleveland Browns', abbr: 'CLE', conf: 'AFC' },
  { id: 'cowboys', name: 'Dallas Cowboys', abbr: 'DAL', conf: 'NFC' },
  { id: 'broncos', name: 'Denver Broncos', abbr: 'DEN', conf: 'AFC' },
  { id: 'lions', name: 'Detroit Lions', abbr: 'DET', conf: 'NFC' },
  { id: 'packers', name: 'Green Bay Packers', abbr: 'GB', conf: 'NFC' },
  { id: 'texans', name: 'Houston Texans', abbr: 'HOU', conf: 'AFC' },
  { id: 'colts', name: 'Indianapolis Colts', abbr: 'IND', conf: 'AFC' },
  { id: 'jaguars', name: 'Jacksonville Jaguars', abbr: 'JAX', conf: 'AFC' },
  { id: 'chiefs', name: 'Kansas City Chiefs', abbr: 'KC', conf: 'AFC' },
  { id: 'raiders', name: 'Las Vegas Raiders', abbr: 'LV', conf: 'AFC' },
  { id: 'chargers', name: 'Los Angeles Chargers', abbr: 'LAC', conf: 'AFC' },
  { id: 'rams', name: 'Los Angeles Rams', abbr: 'LAR', conf: 'NFC' },
  { id: 'dolphins', name: 'Miami Dolphins', abbr: 'MIA', conf: 'AFC' },
  { id: 'vikings', name: 'Minnesota Vikings', abbr: 'MIN', conf: 'NFC' },
  { id: 'patriots', name: 'New England Patriots', abbr: 'NE', conf: 'AFC' },
  { id: 'saints', name: 'New Orleans Saints', abbr: 'NO', conf: 'NFC' },
  { id: 'giants', name: 'New York Giants', abbr: 'NYG', conf: 'NFC' },
  { id: 'jets', name: 'New York Jets', abbr: 'NYJ', conf: 'AFC' },
  { id: 'eagles', name: 'Philadelphia Eagles', abbr: 'PHI', conf: 'NFC' },
  { id: 'steelers', name: 'Pittsburgh Steelers', abbr: 'PIT', conf: 'AFC' },
  { id: 'niners', name: 'San Francisco 49ers', abbr: 'SF', conf: 'NFC' },
  { id: 'seahawks', name: 'Seattle Seahawks', abbr: 'SEA', conf: 'NFC' },
  { id: 'buccaneers', name: 'Tampa Bay Buccaneers', abbr: 'TB', conf: 'NFC' },
  { id: 'titans', name: 'Tennessee Titans', abbr: 'TEN', conf: 'AFC' },
  { id: 'commanders', name: 'Washington Commanders', abbr: 'WAS', conf: 'NFC' },
];

const gameStatuses = [
  { value: 'scheduled', label: 'Scheduled', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  { value: 'tonight', label: 'Tonight', color: 'text-green-400', bg: 'bg-green-500/20' },
  { value: 'live', label: 'LIVE', color: 'text-red-400', bg: 'bg-red-500/20' },
  { value: 'completed', label: 'Final', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
];

const defaultTeamRecords = {
  eagles: '6-4', steelers: '8-1', texans: '7-3', titans: '7-3',
  ravens: '7-3', rams: '6-4', broncos: '6-4', dolphins: '4-6',
  falcons: '5-3-2', jets: '6-3-1', bills: '5-5', chiefs: '5-5',
  lions: '6-2-2', bears: '5-5', jaguars: '5-4-1', niners: '5-4-1',
  colts: '6-3-1', commanders: '7-3', saints: '5-5-1', raiders: '4-7',
  cardinals: '0-0', panthers: '0-0', bengals: '0-0', browns: '0-0',
  cowboys: '0-0', packers: '0-0', chargers: '0-0', vikings: '0-0',
  patriots: '0-0', giants: '0-0', seahawks: '0-0', buccaneers: '0-0',
};

const defaultLinks = {
  ruleLinks: [
    { id: 1, name: 'Game Rules', url: 'https://docs.google.com/document/d/1pWO6OCmT8vJLj2Ifnsj3QG4Mv7uMrs0kC4_t4cqWW_I/edit?usp=sharing', desc: 'Official referee rulebook' },
    { id: 2, name: 'Server Rules', url: 'https://docs.google.com/document/d/1HsB4S4UnoOpqF9A2GvsxN_C61NQs2R6jERLxAPMOszw/edit?tab=t.0', desc: 'Discord server guidelines' },
  ],
  statLinks: [
    { id: 1, name: 'Season 4 Stats', url: 'https://docs.google.com/spreadsheets/d/1RtFklm_vGwmPfvngxd9nPXdSFUjzf4JW2oCNntsHmw0/edit', current: true },
    { id: 2, name: 'Season 3 Stats', url: 'https://docs.google.com/spreadsheets/d/1CBpdNxBFBwVhKgyG5Tdmw22brynvKn27vY46_PekZAY/edit', current: false },
    { id: 3, name: 'All Time Stats', url: 'https://docs.google.com/spreadsheets/d/13yh7xz6XhVVvvV0HBD_P2ddeno9LbjIUZ5Ym18dFkwI/edit', current: false },
  ],
  discordLinks: [
    { id: 1, name: 'RCL Main Server', url: 'https://discord.gg/AbYZ2CBzmq', primary: true },
  ],
  socialLinks: [
    { id: 1, platform: 'twitch', name: 'Twitch', url: 'https://twitch.tv/lastqall' },
    { id: 2, platform: 'youtube', name: 'YouTube', url: 'https://youtube.com/@Lastqall' },
  ],
};

function Panel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [saveStatus, setSaveStatus] = useState('');
  const [expandedGame, setExpandedGame] = useState(null);

  const [currentWeek, setCurrentWeek] = useState(getStoredData('rcl_week', 11));
  const [schedule, setSchedule] = useState(getStoredData('rcl_schedule', []));
  const [teamRecords, setTeamRecords] = useState(getStoredData('rcl_team_records', defaultTeamRecords));
  const [links, setLinks] = useState(getStoredData('rcl_all_links', defaultLinks));
  const [rules, setRules] = useState(getStoredData('rcl_rules', [
    { id: 1, title: 'Prohibited Behavior', items: ['No NSFW content', 'No racial slurs', 'No doxxing'] },
    { id: 2, title: 'Game Rules', items: ['7v7+ only', '9v9 standard', 'Must have referee'] },
  ]));
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem(AUTH_KEY);
    if (!session) { navigate('/'); return; }
    try { setUser(JSON.parse(session)); } catch { navigate('/'); }
  }, [navigate]);

  // Auto-save functionality - optimized for performance
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const saveTimeout = setTimeout(() => {
      handleSave('all');
      setLastSaveTime(new Date());
    }, 3000); // Auto-save after 3 seconds of inactivity (optimized)

    return () => clearTimeout(saveTimeout);
  }, [currentWeek, schedule, teamRecords, links, rules, autoSaveEnabled]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key) {
        // Reload data when it changes in another tab
        const key = e.key;
        if (key.startsWith('rcl_')) {
          switch(key) {
            case 'rcl_week':
              setCurrentWeek(getStoredData('rcl_week', 11));
              break;
            case 'rcl_schedule':
              setSchedule(getStoredData('rcl_schedule', []));
              break;
            case 'rcl_team_records':
              setTeamRecords(getStoredData('rcl_team_records', defaultTeamRecords));
              break;
            case 'rcl_all_links':
              setLinks(getStoredData('rcl_all_links', defaultLinks));
              break;
            case 'rcl_rules':
              setRules(getStoredData('rcl_rules', []));
              break;
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => { localStorage.removeItem(AUTH_KEY); navigate('/'); };

  const showSave = (msg) => { setSaveStatus(msg); setTimeout(() => setSaveStatus(''), 2000); };

  const handleSave = (type) => {
    if (type === 'week') saveData('rcl_week', currentWeek);
    if (type === 'schedule') saveData('rcl_schedule', schedule);
    if (type === 'records') saveData('rcl_team_records', teamRecords);
    if (type === 'links') saveData('rcl_all_links', links);
    if (type === 'rules') saveData('rcl_rules', rules);
    if (type === 'all') {
      saveData('rcl_week', currentWeek);
      saveData('rcl_schedule', schedule);
      saveData('rcl_team_records', teamRecords);
      saveData('rcl_all_links', links);
      saveData('rcl_rules', rules);
    }
    showSave(type === 'all' ? 'All saved!' : `${type} saved!`);
  };

  const addGame = () => {
    setSchedule([...schedule, {
      id: Date.now(), homeTeam: 'eagles', awayTeam: 'steelers',
      status: 'scheduled', isGameOfWeek: false, time: '', date: '',
      homeScore: 0, awayScore: 0, notes: ''
    }]);
  };

  const updateGame = (id, updates) => {
    setSchedule(schedule.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const removeGame = (id) => setSchedule(schedule.filter(g => g.id !== id));

  const updateTeamRecord = (teamId, record) => setTeamRecords({ ...teamRecords, [teamId]: record });

  const addLink = (cat) => {
    const nl = { id: Date.now(), name: 'New Link', url: '', desc: '' };
    if (cat === 'statLinks') nl.current = false;
    if (cat === 'discordLinks') nl.primary = false;
    if (cat === 'socialLinks') { nl.platform = 'twitch'; delete nl.desc; }
    setLinks({ ...links, [cat]: [...links[cat], nl] });
  };

  const updateLink = (cat, id, updates) => {
    setLinks({ ...links, [cat]: links[cat].map(l => l.id === id ? { ...l, ...updates } : l) });
  };

  const removeLink = (cat, id) => setLinks({ ...links, [cat]: links[cat].filter(l => l.id !== id) });

  const addRuleSection = () => setRules([...rules, { id: Date.now(), title: 'New Section', items: [] }]);
  const updateRuleSection = (id, title) => setRules(rules.map(r => r.id === id ? { ...r, title } : r));
  const addRuleItem = (sid) => setRules(rules.map(r => r.id === sid ? { ...r, items: [...r.items, 'New rule'] } : r));
  const updateRuleItem = (sid, idx, val) => setRules(rules.map(r => {
    if (r.id === sid) { const items = [...r.items]; items[idx] = val; return { ...r, items }; }
    return r;
  }));
  const removeRuleItem = (sid, idx) => setRules(rules.map(r => r.id === sid ? { ...r, items: r.items.filter((_, i) => i !== idx) } : r));
  const removeRuleSection = (id) => setRules(rules.filter(r => r.id !== id));

  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  const getTeamName = (id) => allNflTeams.find(t => t.id === id)?.name || id;
  const getStatus = (s) => gameStatuses.find(st => st.value === s) || gameStatuses[0];
  const getTeamLogo = (id) => {
    const team = allNflTeams.find(t => t.id === id);
    return team ? `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbr.toLowerCase()}.png` : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <img src="/rcl_server_logo.png" alt="RCL" className="w-10 h-10 rounded-full" />
              <span className="font-orbitron font-bold text-xl bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">RCL</span>
            </a>
            <span className="text-gray-500">|</span>
            <span className="text-white font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" /> Dev Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave('all')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save size={18} /> Save All
            </button>
            <span className="text-purple-400 text-sm hidden md:block">{user.username}</span>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {saveStatus && (
          <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50 flex items-center gap-2">
            <CheckCircle size={18} /> {saveStatus}
          </div>
        )}

        {/* Week Selector */}
        <div className="glass rounded-xl p-4 mb-6 border border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-400 w-8 h-8" />
            <div>
              <h3 className="text-white font-bold">Current Week</h3>
              <p className="text-gray-500 text-sm">Schedule header</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))} className="w-10 h-10 bg-slate-700 rounded-lg text-white font-bold">-</button>
            <div className="bg-purple-600 rounded-xl px-6 py-2 text-white text-2xl font-bold min-w-[80px] text-center">{currentWeek}</div>
            <button onClick={() => setCurrentWeek(currentWeek + 1)} className="w-10 h-10 bg-slate-700 rounded-lg text-white font-bold">+</button>
            <button onClick={() => handleSave('week')} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg ml-2"><Save size={18} /></button>
          </div>
        </div>

        {/* Auto-save Status */}
        <div className="glass rounded-xl p-3 mb-6 border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${autoSaveEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              {autoSaveEnabled && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />}
            </div>
            <div>
              <span className="text-white font-medium">Auto-save {autoSaveEnabled ? 'Enabled' : 'Disabled'}</span>
              {lastSaveTime && (
                <p className="text-gray-500 text-xs">Last saved: {lastSaveTime.toLocaleTimeString()}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              autoSaveEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {autoSaveEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'schedule', name: 'Schedule', icon: Calendar },
            { id: 'records', name: 'Records', icon: Trophy },
            { id: 'links', name: 'Links', icon: LinkIcon },
            { id: 'rules', name: 'Rules', icon: Shield },
            { id: 'settings', name: 'Settings', icon: Database },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'}`}>
              <tab.icon size={18} /> {tab.name}
            </button>
          ))}
        </div>

        <div className="glass rounded-xl border border-purple-500/20 overflow-hidden">
          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <Calendar className="text-purple-400" /> Week {currentWeek} Schedule
                </h2>
                <button onClick={addGame} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus size={18} /> Add Game
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {gameStatuses.map(s => <span key={s.value} className={`${s.bg} ${s.color} px-3 py-1 rounded-full text-xs`}>{s.label}</span>)}
              </div>

              <div className="space-y-3">
                {schedule.map((game, idx) => {
                  const status = getStatus(game.status);
                  const isExp = expandedGame === game.id;
                  return (
                    <div key={game.id} className={`bg-slate-800/50 rounded-xl border ${game.isGameOfWeek ? 'border-yellow-500/50' : 'border-white/5'}`}>
                      <div className="p-4 cursor-pointer hover:bg-slate-700/30" onClick={() => setExpandedGame(isExp ? null : game.id)}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-gray-400 text-sm font-bold">{idx + 1}</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img src={getTeamLogo(game.homeTeam)} alt="" className="w-8 h-8 object-contain" />
                            <span className="text-white font-medium truncate">{getTeamName(game.homeTeam)}</span>
                            <span className="text-gray-500 text-sm">({teamRecords[game.homeTeam] || '0-0'})</span>
                            {game.status === 'completed' ? (
                              <span className="px-2 py-1 bg-blue-500/20 rounded text-lg font-bold">
                                <span className={game.homeScore > game.awayScore ? 'text-green-400' : 'text-white'}>{game.homeScore}</span>
                                <span className="text-gray-500 mx-1">-</span>
                                <span className={game.awayScore > game.homeScore ? 'text-green-400' : 'text-white'}>{game.awayScore}</span>
                              </span>
                            ) : <span className="text-gray-500 font-bold px-2">VS</span>}
                            <img src={getTeamLogo(game.awayTeam)} alt="" className="w-8 h-8 object-contain" />
                            <span className="text-white font-medium truncate">{getTeamName(game.awayTeam)}</span>
                            <span className="text-gray-500 text-sm">({teamRecords[game.awayTeam] || '0-0'})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {game.isGameOfWeek && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs flex items-center gap-1"><Star size={12} /> GOTW</span>}
                            <span className={`${status.bg} ${status.color} px-2 py-1 rounded text-xs font-bold`}>{status.label}</span>
                            {game.time && <span className="text-gray-400 text-sm flex items-center gap-1"><Clock size={14} /> {game.time}</span>}
                            {isExp ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                          </div>
                        </div>
                      </div>
                      {isExp && (
                        <div className="p-4 border-t border-white/10 bg-slate-900/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">Home Team</label>
                              <select value={game.homeTeam} onChange={(e) => updateGame(game.id, { homeTeam: e.target.value })}
                                className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white">
                                {allNflTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">Away Team</label>
                              <select value={game.awayTeam} onChange={(e) => updateGame(game.id, { awayTeam: e.target.value })}
                                className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white">
                                {allNflTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">Status</label>
                              <select value={game.status} onChange={(e) => updateGame(game.id, { status: e.target.value })}
                                className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white">
                                {gameStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">Time</label>
                              <input type="text" value={game.time || ''} onChange={(e) => updateGame(game.id, { time: e.target.value })}
                                placeholder="8:00 PM ET" className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white" />
                            </div>
                            {(game.status === 'completed' || game.status === 'live') && (
                              <>
                                <div>
                                  <label className="text-gray-400 text-xs uppercase block mb-1">Home Score</label>
                                  <input type="number" value={game.homeScore} onChange={(e) => updateGame(game.id, { homeScore: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-center text-xl font-bold" />
                                </div>
                                <div>
                                  <label className="text-gray-400 text-xs uppercase block mb-1">Away Score</label>
                                  <input type="number" value={game.awayScore} onChange={(e) => updateGame(game.id, { awayScore: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-center text-xl font-bold" />
                                </div>
                              </>
                            )}
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">Date</label>
                              <input type="text" value={game.date || ''} onChange={(e) => updateGame(game.id, { date: e.target.value })}
                                placeholder="Nov 29" className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 bg-slate-700 rounded-lg px-4 py-2 cursor-pointer">
                                <input type="checkbox" checked={game.isGameOfWeek} onChange={(e) => updateGame(game.id, { isGameOfWeek: e.target.checked })} />
                                <span className="text-yellow-400 flex items-center gap-1"><Star size={16} /> GOTW</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => removeGame(game.id)} className="bg-red-600/20 text-red-400 px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {schedule.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No games. Click "Add Game" to start.</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => handleSave('schedule')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                  <Save size={20} /> Save Schedule
                </button>
              </div>
            </div>
          )}

          {/* RECORDS */}
          {activeTab === 'records' && (
            <div className="p-6">
              <h2 className="text-white text-xl font-bold flex items-center gap-2 mb-6"><Trophy className="text-purple-400" /> Team Records</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 font-bold mb-3">AFC</h3>
                  <div className="space-y-2">
                    {allNflTeams.filter(t => t.conf === 'AFC').map(team => (
                      <div key={team.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                        <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbr.toLowerCase()}.png`} alt="" className="w-6 h-6" />
                        <span className="text-white flex-1 text-sm">{team.name}</span>
                        <input type="text" value={teamRecords[team.id] || '0-0'} onChange={(e) => updateTeamRecord(team.id, e.target.value)}
                          className="w-20 bg-slate-700 border border-blue-500/30 rounded px-2 py-1 text-white text-center text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-red-400 font-bold mb-3">NFC</h3>
                  <div className="space-y-2">
                    {allNflTeams.filter(t => t.conf === 'NFC').map(team => (
                      <div key={team.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                        <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbr.toLowerCase()}.png`} alt="" className="w-6 h-6" />
                        <span className="text-white flex-1 text-sm">{team.name}</span>
                        <input type="text" value={teamRecords[team.id] || '0-0'} onChange={(e) => updateTeamRecord(team.id, e.target.value)}
                          className="w-20 bg-slate-700 border border-red-500/30 rounded px-2 py-1 text-white text-center text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => handleSave('records')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                  <Save size={20} /> Save Records
                </button>
              </div>
            </div>
          )}

          {/* LINKS */}
          {activeTab === 'links' && (
            <div className="p-6 space-y-8">
              <h2 className="text-white text-xl font-bold flex items-center gap-2"><LinkIcon className="text-purple-400" /> All Website Links</h2>
              
              {/* Rule Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-purple-400 font-bold flex items-center gap-2"><FileText size={18} /> Rulebook Links</h3>
                  <button onClick={() => addLink('ruleLinks')} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
                </div>
                {links.ruleLinks.map(link => (
                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-800/50 rounded-lg p-3 mb-2">
                    <input type="text" value={link.name} onChange={(e) => updateLink('ruleLinks', link.id, { name: e.target.value })} placeholder="Name" className="bg-slate-700 border border-purple-500/30 rounded px-3 py-2 text-white" />
                    <input type="text" value={link.url} onChange={(e) => updateLink('ruleLinks', link.id, { url: e.target.value })} placeholder="URL" className="bg-slate-700 border border-purple-500/30 rounded px-3 py-2 text-white md:col-span-2" />
                    <div className="flex gap-2">
                      <input type="text" value={link.desc || ''} onChange={(e) => updateLink('ruleLinks', link.id, { desc: e.target.value })} placeholder="Desc" className="bg-slate-700 border border-purple-500/30 rounded px-3 py-2 text-white flex-1" />
                      <button onClick={() => removeLink('ruleLinks', link.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stat Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-green-400 font-bold flex items-center gap-2"><Trophy size={18} /> Stat Sheet Links</h3>
                  <button onClick={() => addLink('statLinks')} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
                </div>
                {links.statLinks.map(link => (
                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-800/50 rounded-lg p-3 mb-2">
                    <input type="text" value={link.name} onChange={(e) => updateLink('statLinks', link.id, { name: e.target.value })} className="bg-slate-700 border border-green-500/30 rounded px-3 py-2 text-white" />
                    <input type="text" value={link.url} onChange={(e) => updateLink('statLinks', link.id, { url: e.target.value })} className="bg-slate-700 border border-green-500/30 rounded px-3 py-2 text-white md:col-span-2" />
                    <div className="flex items-center gap-2">
                      <label className="text-green-400 text-sm flex items-center gap-1"><input type="checkbox" checked={link.current || false} onChange={(e) => updateLink('statLinks', link.id, { current: e.target.checked })} /> Current</label>
                      <button onClick={() => removeLink('statLinks', link.id)} className="text-red-400 p-2 ml-auto"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discord Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-blue-400 font-bold flex items-center gap-2"><Users size={18} /> Discord Links</h3>
                  <button onClick={() => addLink('discordLinks')} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
                </div>
                {links.discordLinks.map(link => (
                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-800/50 rounded-lg p-3 mb-2">
                    <input type="text" value={link.name} onChange={(e) => updateLink('discordLinks', link.id, { name: e.target.value })} className="bg-slate-700 border border-blue-500/30 rounded px-3 py-2 text-white" />
                    <input type="text" value={link.url} onChange={(e) => updateLink('discordLinks', link.id, { url: e.target.value })} className="bg-slate-700 border border-blue-500/30 rounded px-3 py-2 text-white" />
                    <div className="flex items-center gap-2">
                      <label className="text-blue-400 text-sm flex items-center gap-1"><input type="checkbox" checked={link.primary || false} onChange={(e) => updateLink('discordLinks', link.id, { primary: e.target.checked })} /> Primary</label>
                      <button onClick={() => removeLink('discordLinks', link.id)} className="text-red-400 p-2 ml-auto"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-pink-400 font-bold flex items-center gap-2"><Zap size={18} /> Social Links</h3>
                  <button onClick={() => addLink('socialLinks')} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
                </div>
                {links.socialLinks.map(link => (
                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-800/50 rounded-lg p-3 mb-2">
                    <select value={link.platform} onChange={(e) => updateLink('socialLinks', link.id, { platform: e.target.value })} className="bg-slate-700 border border-pink-500/30 rounded px-3 py-2 text-white">
                      <option value="twitch">Twitch</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                    <input type="text" value={link.name} onChange={(e) => updateLink('socialLinks', link.id, { name: e.target.value })} className="bg-slate-700 border border-pink-500/30 rounded px-3 py-2 text-white" />
                    <input type="text" value={link.url} onChange={(e) => updateLink('socialLinks', link.id, { url: e.target.value })} className="bg-slate-700 border border-pink-500/30 rounded px-3 py-2 text-white" />
                    <button onClick={() => removeLink('socialLinks', link.id)} className="text-red-400 p-2 justify-self-end"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleSave('links')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                  <Save size={20} /> Save Links
                </button>
              </div>
            </div>
          )}

          {/* RULES */}
          {activeTab === 'rules' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold flex items-center gap-2"><Shield className="text-purple-400" /> Rules</h2>
                <button onClick={addRuleSection} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Section</button>
              </div>
              <div className="space-y-4">
                {rules.map(section => (
                  <div key={section.id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <input type="text" value={section.title} onChange={(e) => updateRuleSection(section.id, e.target.value)}
                        className="bg-slate-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white font-bold flex-1" />
                      <button onClick={() => removeRuleSection(section.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
                    </div>
                    <div className="space-y-2 ml-4">
                      {section.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-purple-400">•</span>
                          <input type="text" value={item} onChange={(e) => updateRuleItem(section.id, idx, e.target.value)}
                            className="bg-slate-700 border border-purple-500/30 rounded px-3 py-2 text-white flex-1" />
                          <button onClick={() => removeRuleItem(section.id, idx)} className="text-red-400 p-1"><X size={16} /></button>
                        </div>
                      ))}
                      <button onClick={() => addRuleItem(section.id)} className="text-purple-400 text-sm flex items-center gap-1 ml-4"><Plus size={14} /> Add Rule</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => handleSave('rules')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                  <Save size={20} /> Save Rules
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <PanelSettings onBack={() => setActiveTab('schedule')} />
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-purple-400 hover:text-purple-300 text-sm">← Back to Website</a>
        </div>
      </div>
    </div>
  );
}

export default Panel;
