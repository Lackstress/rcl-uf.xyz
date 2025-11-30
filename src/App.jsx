import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Calendar, Shield, ExternalLink, 
  ChevronDown, Menu, X, Twitch, Youtube, FileText,
  MessageCircle, BarChart3, Star, Zap, Heart, Award, Crown, Target, Swords, Lock, Eye, EyeOff
} from 'lucide-react';
import Panel from './components/Panel';
import { validateCredentials, AUTH_KEY } from './config/auth';

// NFL Team logos from ESPN CDN
const getTeamLogo = (teamId) => `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId}.png`;

// LocalStorage helpers
const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch { return defaultValue; }
};

const saveStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// All 32 NFL Teams data
const allNflTeams = {
  cardinals: { id: 'cardinals', name: 'Arizona Cardinals', abbr: 'ARI', logo: getTeamLogo('ari') },
  falcons: { id: 'falcons', name: 'Atlanta Falcons', abbr: 'ATL', logo: getTeamLogo('atl') },
  ravens: { id: 'ravens', name: 'Baltimore Ravens', abbr: 'BAL', logo: getTeamLogo('bal') },
  bills: { id: 'bills', name: 'Buffalo Bills', abbr: 'BUF', logo: getTeamLogo('buf') },
  panthers: { id: 'panthers', name: 'Carolina Panthers', abbr: 'CAR', logo: getTeamLogo('car') },
  bears: { id: 'bears', name: 'Chicago Bears', abbr: 'CHI', logo: getTeamLogo('chi') },
  bengals: { id: 'bengals', name: 'Cincinnati Bengals', abbr: 'CIN', logo: getTeamLogo('cin') },
  browns: { id: 'browns', name: 'Cleveland Browns', abbr: 'CLE', logo: getTeamLogo('cle') },
  cowboys: { id: 'cowboys', name: 'Dallas Cowboys', abbr: 'DAL', logo: getTeamLogo('dal') },
  broncos: { id: 'broncos', name: 'Denver Broncos', abbr: 'DEN', logo: getTeamLogo('den') },
  lions: { id: 'lions', name: 'Detroit Lions', abbr: 'DET', logo: getTeamLogo('det') },
  packers: { id: 'packers', name: 'Green Bay Packers', abbr: 'GB', logo: getTeamLogo('gb') },
  texans: { id: 'texans', name: 'Houston Texans', abbr: 'HOU', logo: getTeamLogo('hou') },
  colts: { id: 'colts', name: 'Indianapolis Colts', abbr: 'IND', logo: getTeamLogo('ind') },
  jaguars: { id: 'jaguars', name: 'Jacksonville Jaguars', abbr: 'JAX', logo: getTeamLogo('jax') },
  chiefs: { id: 'chiefs', name: 'Kansas City Chiefs', abbr: 'KC', logo: getTeamLogo('kc') },
  raiders: { id: 'raiders', name: 'Las Vegas Raiders', abbr: 'LV', logo: getTeamLogo('lv') },
  chargers: { id: 'chargers', name: 'Los Angeles Chargers', abbr: 'LAC', logo: getTeamLogo('lac') },
  rams: { id: 'rams', name: 'Los Angeles Rams', abbr: 'LAR', logo: getTeamLogo('lar') },
  dolphins: { id: 'dolphins', name: 'Miami Dolphins', abbr: 'MIA', logo: getTeamLogo('mia') },
  vikings: { id: 'vikings', name: 'Minnesota Vikings', abbr: 'MIN', logo: getTeamLogo('min') },
  patriots: { id: 'patriots', name: 'New England Patriots', abbr: 'NE', logo: getTeamLogo('ne') },
  saints: { id: 'saints', name: 'New Orleans Saints', abbr: 'NO', logo: getTeamLogo('no') },
  giants: { id: 'giants', name: 'New York Giants', abbr: 'NYG', logo: getTeamLogo('nyg') },
  jets: { id: 'jets', name: 'New York Jets', abbr: 'NYJ', logo: getTeamLogo('nyj') },
  eagles: { id: 'eagles', name: 'Philadelphia Eagles', abbr: 'PHI', logo: getTeamLogo('phi') },
  steelers: { id: 'steelers', name: 'Pittsburgh Steelers', abbr: 'PIT', logo: getTeamLogo('pit') },
  niners: { id: 'niners', name: 'San Francisco 49ers', abbr: 'SF', logo: getTeamLogo('sf') },
  seahawks: { id: 'seahawks', name: 'Seattle Seahawks', abbr: 'SEA', logo: getTeamLogo('sea') },
  buccaneers: { id: 'buccaneers', name: 'Tampa Bay Buccaneers', abbr: 'TB', logo: getTeamLogo('tb') },
  titans: { id: 'titans', name: 'Tennessee Titans', abbr: 'TEN', logo: getTeamLogo('ten') },
  commanders: { id: 'commanders', name: 'Washington Commanders', abbr: 'WAS', logo: getTeamLogo('wsh') },
};

// Default team records
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

// Default schedule (used for initialization)
const defaultSchedule = [
  { id: 1, homeTeam: 'eagles', awayTeam: 'steelers', status: 'scheduled', isGameOfWeek: true, time: '', homeScore: 0, awayScore: 0 },
  { id: 2, homeTeam: 'saints', awayTeam: 'raiders', status: 'completed', isGameOfWeek: false, time: '', homeScore: 56, awayScore: 0 },
  { id: 3, homeTeam: 'texans', awayTeam: 'titans', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 4, homeTeam: 'ravens', awayTeam: 'rams', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 5, homeTeam: 'broncos', awayTeam: 'dolphins', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 6, homeTeam: 'falcons', awayTeam: 'jets', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 7, homeTeam: 'bills', awayTeam: 'chiefs', status: 'rescheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 8, homeTeam: 'lions', awayTeam: 'bears', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 9, homeTeam: 'jaguars', awayTeam: 'niners', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
  { id: 10, homeTeam: 'colts', awayTeam: 'commanders', status: 'scheduled', isGameOfWeek: false, time: '', homeScore: 0, awayScore: 0 },
];

// Initialize localStorage with defaults only if empty (preserves edits)
const initializeData = () => {
  if (!localStorage.getItem('rcl_schedule')) {
    saveStoredData('rcl_schedule', defaultSchedule);
  }
  if (!localStorage.getItem('rcl_team_records')) {
    saveStoredData('rcl_team_records', defaultTeamRecords);
  }
  if (!localStorage.getItem('rcl_week')) {
    saveStoredData('rcl_week', 11);
  }
};
initializeData();

// Legacy nflTeams for backward compatibility with other components
const nflTeams = {
  eagles: { name: 'Philadelphia Eagles', abbr: 'PHI', record: '6-4', logo: getTeamLogo('phi') },
  steelers: { name: 'Pittsburgh Steelers', abbr: 'PIT', record: '8-1', logo: getTeamLogo('pit') },
  texans: { name: 'Houston Texans', abbr: 'HOU', record: '7-3', logo: getTeamLogo('hou') },
  titans: { name: 'Tennessee Titans', abbr: 'TEN', record: '7-3', logo: getTeamLogo('ten') },
  ravens: { name: 'Baltimore Ravens', abbr: 'BAL', record: '7-3', logo: getTeamLogo('bal') },
  rams: { name: 'Los Angeles Rams', abbr: 'LAR', record: '6-4', logo: getTeamLogo('lar') },
  broncos: { name: 'Denver Broncos', abbr: 'DEN', record: '6-4', logo: getTeamLogo('den') },
  dolphins: { name: 'Miami Dolphins', abbr: 'MIA', record: '4-6', logo: getTeamLogo('mia') },
  falcons: { name: 'Atlanta Falcons', abbr: 'ATL', record: '5-3-2', logo: getTeamLogo('atl') },
  jets: { name: 'New York Jets', abbr: 'NYJ', record: '6-3-1', logo: getTeamLogo('nyj') },
  bills: { name: 'Buffalo Bills', abbr: 'BUF', record: '5-5', logo: getTeamLogo('buf') },
  chiefs: { name: 'Kansas City Chiefs', abbr: 'KC', record: '5-5', logo: getTeamLogo('kc') },
  lions: { name: 'Detroit Lions', abbr: 'DET', record: '6-2-2', logo: getTeamLogo('det') },
  bears: { name: 'Chicago Bears', abbr: 'CHI', record: '5-5', logo: getTeamLogo('chi') },
  jaguars: { name: 'Jacksonville Jaguars', abbr: 'JAX', record: '5-4-1', logo: getTeamLogo('jax') },
  niners: { name: 'San Francisco 49ers', abbr: 'SF', record: '5-4-1', logo: getTeamLogo('sf') },
  colts: { name: 'Indianapolis Colts', abbr: 'IND', record: '6-3-1', logo: getTeamLogo('ind') },
  commanders: { name: 'Washington Commanders', abbr: 'WAS', record: '7-3', logo: getTeamLogo('wsh') },
  saints: { name: 'New Orleans Saints', abbr: 'NO', record: '5-5-1', logo: getTeamLogo('no') },
  raiders: { name: 'Las Vegas Raiders', abbr: 'LV', record: '4-7', logo: getTeamLogo('lv') },
};

const scheduleGames = [
  { home: nflTeams.eagles, away: nflTeams.steelers, isGameOfWeek: true },
  { home: nflTeams.saints, away: nflTeams.raiders, isCompleted: true, homeScore: 56, awayScore: 0 },
  { home: nflTeams.texans, away: nflTeams.titans },
  { home: nflTeams.ravens, away: nflTeams.rams },
  { home: nflTeams.broncos, away: nflTeams.dolphins },
  { home: nflTeams.falcons, away: nflTeams.jets },
  { home: nflTeams.bills, away: nflTeams.chiefs, rescheduled: true },
  { home: nflTeams.lions, away: nflTeams.bears },
  { home: nflTeams.jaguars, away: nflTeams.niners },
  { home: nflTeams.colts, away: nflTeams.commanders },
];

// Playoff Picture
const afcPlayoffs = [
  { seed: 1, team: nflTeams.steelers, status: 'DIV', note: '1st Round Bye' },
  { seed: 2, team: nflTeams.titans, status: 'DIV', note: '1st Round Bye' },
  { seed: 3, team: nflTeams.texans, status: 'WC', note: 'Plays 6th seed' },
  { seed: 4, team: nflTeams.ravens, status: 'WC', note: 'Plays 5th seed' },
  { seed: 5, team: nflTeams.colts, status: 'WC', note: 'Plays 4th seed' },
  { seed: 6, team: nflTeams.jets, status: 'WC', note: 'Plays 3rd seed' },
];

const afcHunt = [
  { seed: 7, team: nflTeams.broncos },
  { seed: 8, team: nflTeams.jaguars },
  { seed: 9, team: nflTeams.chiefs },
  { seed: 10, team: nflTeams.dolphins },
];

const nfcPlayoffs = [
  { seed: 1, team: nflTeams.commanders, status: 'DIV', note: '1st Round Bye' },
  { seed: 2, team: nflTeams.lions, status: 'DIV', note: '1st Round Bye' },
  { seed: 3, team: nflTeams.eagles, status: 'WC', note: 'Plays 6th seed' },
  { seed: 4, team: nflTeams.rams, status: 'WC', note: 'Plays 5th seed' },
  { seed: 5, team: nflTeams.niners, status: 'WC', note: 'Plays 4th seed' },
  { seed: 6, team: nflTeams.falcons, status: 'WC', note: 'Plays 3rd seed' },
];

const nfcHunt = [
  { seed: 7, team: nflTeams.bears },
  { seed: 8, team: nflTeams.bills },
  { seed: 9, team: nflTeams.saints },
  { seed: 10, team: nflTeams.raiders },
];

const statSheets = [
  { name: 'Season 4 Stats', url: 'https://docs.google.com/spreadsheets/d/1RtFklm_vGwmPfvngxd9nPXdSFUjzf4JW2oCNntsHmw0/edit?gid=252753848#gid=252753848', current: true },
  { name: 'Season 3 Stats', url: 'https://docs.google.com/spreadsheets/d/1CBpdNxBFBwVhKgyG5Tdmw22brynvKn27vY46_PekZAY/edit?usp=sharing' },
  { name: 'Season 2 Stats', url: 'https://docs.google.com/spreadsheets/d/1miG9TLkdL1_KoWsDAuQA1nwsqWAjiwRcsDHqBP5eIeQ/edit?usp=sharing' },
  { name: 'All Time Stats', url: 'https://docs.google.com/spreadsheets/d/13yh7xz6XhVVvvV0HBD_P2ddeno9LbjIUZ5Ym18dFkwI/edit?usp=drivesdk' },
  { name: 'Redzone History', url: 'https://docs.google.com/spreadsheets/d/1V0GipvytpUjeG6O-b-wSEieSTMHfNq853TpaQYVEH1Q/edit?usp=drivesdk' },
];

// Super Bowl History
const superBowls = [
  {
    season: 1,
    date: '2/11/25',
    winner: { team: 'Los Angeles Rams', seed: 2, score: 38, logo: getTeamLogo('lar') },
    loser: { team: 'Jacksonville Jaguars', seed: 1, score: 36, logo: getTeamLogo('jax') },
    mvp: '92vll',
    fo: 'Lackstress',
    qb: 'Jpingenzo77',
  },
  {
    season: 2,
    date: '6/17/25',
    winner: { team: 'Cleveland Browns', seed: 5, score: 38, logo: getTeamLogo('cle') },
    loser: { team: 'Atlanta Falcons', seed: 1, score: 36, logo: getTeamLogo('atl') },
    mvp: 'Bigboneinher',
    fo: 'Bigboneinher',
    qb: 'Bigboneinher',
  },
  {
    season: 3,
    date: '9/11/25',
    winner: { team: 'Tennessee Titans', seed: 6, score: 43, logo: getTeamLogo('ten') },
    loser: { team: 'Atlanta Falcons', seed: 7, score: 28, logo: getTeamLogo('atl') },
    mvp: 'Sagggi_nkcalb',
    fo: 'Sagggi_nkcalb',
    qb: 'Sagggi_nkcalb',
  },
];

// Hall of Fame (3000+ Legacy)
const hallOfFame = [
  { name: 'perkiiyana', legacy: 2875, titles: 1, sbChamps: 1, mvp: 0, proBowl: 2 },
  { name: 'chadz', legacy: 2850, titles: 1, sbChamps: 0, mvp: 0, proBowl: 1 },
  { name: 'izzcomes', legacy: 2650, titles: 0, sbChamps: 0, mvp: 1, proBowl: 2 },
  { name: 'Bigboneinher', legacy: 2325, titles: 0, sbChamps: 1, mvp: 1, proBowl: 5 },
];

// X-Factor Players (1100-1999 Legacy)
const xFactorPlayers = [
  { name: 'LocoLopez74', legacy: 1975, proBowl: 3 },
  { name: 'JajJajit', legacy: 1925, proBowl: 2 },
  { name: 'Kryptonitee', legacy: 1900, proBowl: 1 },
  { name: 'dxmdih', legacy: 1625, proBowl: 3 },
  { name: 'Rip_sammyxx', legacy: 1550, proBowl: 2 },
  { name: 'iiLxserWrldz', legacy: 1475, proBowl: 4 },
];

// Season Awards
const seasonAwards = {
  s1: { mvp: 'Jpingenzo77', opoty: '92vll', dpoty: 'Stacyislittle2' },
  s2: { mvp: 'JajJajit', opoty: 'Compflaco', dpoty: 'LocoLopez74' },
  s3: { mvp: 'izzcomes', opoty: 'chadz', dpoty: 'Kryptonitee' },
};

// Record Book
const records = {
  passing: [
    { stat: 'Passing Yards (Season)', value: '8,126', holder: 'izzcomes', season: 'S3' },
    { stat: 'Passing TDs (Season)', value: '101', holder: 'izzcomes', season: 'S3' },
    { stat: 'Passing Yards (Career)', value: '9,302', holder: 'izzcomes', season: 'All-Time' },
    { stat: 'Passing TDs (Career)', value: '118', holder: 'izzcomes', season: 'All-Time' },
  ],
  rushing: [
    { stat: 'Rushing Yards (Season)', value: '969', holder: 'Aidenddod', season: 'S3' },
    { stat: 'Rushing TDs (Season)', value: '13', holder: 'Aidenddod', season: 'S3' },
    { stat: 'Rushing TDs (Career)', value: '15', holder: 'iiLxserWrldz', season: 'All-Time' },
  ],
  receiving: [
    { stat: 'Receiving Yards WR (Season)', value: '2,433', holder: 'perkiiyana', season: 'S3' },
    { stat: 'Receiving TDs WR (Season)', value: '39', holder: 'perkiiyana', season: 'S3' },
    { stat: 'Receiving Yards TE (Season)', value: '2,151', holder: 'chadz', season: 'S3' },
    { stat: 'Receptions TE (Season)', value: '104', holder: 'chadz', season: 'S3' },
  ],
  defense: [
    { stat: 'Interceptions (Season)', value: '21', holder: 'JajJajit', season: 'S2' },
    { stat: 'Sacks (Season)', value: '24', holder: 'Kryptonitee', season: 'S3' },
    { stat: 'Tackles DB (Season)', value: '42', holder: 'Bigboneinher', season: 'S3' },
    { stat: 'Pressures (Season)', value: '99', holder: 'SukoVT', season: 'S3' },
  ],
};

// Like Button Component with localStorage persistence
function LikeButton() {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load likes from localStorage
    const storedLikes = localStorage.getItem('rcl_likes');
    const userLiked = localStorage.getItem('rcl_user_liked');
    
    if (storedLikes) {
      setLikes(parseInt(storedLikes, 10));
    }
    if (userLiked === 'true') {
      setHasLiked(true);
    }
  }, []);

  const handleLike = () => {
    if (hasLiked) return;
    
    setIsAnimating(true);
    const newLikes = likes + 1;
    setLikes(newLikes);
    setHasLiked(true);
    
    localStorage.setItem('rcl_likes', newLikes.toString());
    localStorage.setItem('rcl_user_liked', 'true');
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked}
      className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
        hasLiked 
          ? 'bg-rcl-red text-white cursor-default' 
          : 'bg-white/10 backdrop-blur-md text-white hover:bg-rcl-red hover:scale-105 cursor-pointer'
      } ${isAnimating ? 'scale-125' : ''}`}
    >
      <Heart 
        className={`w-5 h-5 transition-all ${hasLiked ? 'fill-white' : ''} ${isAnimating ? 'animate-ping' : ''}`} 
      />
      <span className="font-semibold">{likes}</span>
    </button>
  );
}

const rules = [
  {
    title: 'Prohibited Behavior',
    items: [
      'No NSFW content (bannable without appeal)',
      'No racial slurs or hate speech',
      'No homophobic slurs (day timeout, mods lose position)',
      'No doxxing (sharing personal information) - bannable',
      'No insulting players\' family members (day mute)',
      'No telling others to harm themselves',
      'No raid threats (immediate ban)',
      'Bypassing rules with alternate spellings results in same penalties',
    ]
  },
  {
    title: 'Game Rules',
    items: [
      '7v7+ only league',
      '9v9 is the new standard player count',
      '9v8 Games: Team with 9 players cannot run the ball',
      'Games must have an official referee (referee must host)',
      'No suspended players in games (auto FFL & disbandment)',
    ]
  },
  {
    title: 'Team Rules',
    items: [
      '2 Game Rule: Must stay on new team for 2 games before demanding (unless old team disbands)',
      'Suspension Evasion: Team gets FFL, disbandment, possible ban',
      'Only Franchise Owners and General Managers can confirm/schedule games',
      'Head Coaches need written permission from FO/GM to handle games',
    ]
  },
  {
    title: 'Extensions',
    items: [
      'New FOs (2 days or less before deadline): 2 day extension',
      'Everyone else: 1 day extension only',
    ]
  },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'Champions', href: '#champions' },
    { name: 'Hall of Fame', href: '#hof' },
    { name: 'Records', href: '#records' },
    { name: 'Rules', href: '#rules' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/rcl_server_logo.png" alt="RCL Logo" className="w-10 h-10 rounded-full" />
            <span className="font-orbitron font-bold text-xl gradient-text">RCL</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
            <a
              href="https://discord.gg/AbYZ2CBzmq"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-rcl-red hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
            >
              Join Discord
            </a>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-red-900/30">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="https://discord.gg/AbYZ2CBzmq"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-rcl-red hover:bg-red-700 px-4 py-2 rounded-lg font-semibold text-center"
            >
              Join Discord
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900/90 via-purple-900/10 to-slate-900/90 relative z-10">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-rcl-darker via-rcl-dark to-rcl-darker" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img 
              src="/rcl_server_logo.png" 
              alt="RCL Logo" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full pulse-ring"
            />
            <div className="absolute -inset-4 bg-rcl-red/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        <h1 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-black mb-4">
          <span className="gradient-text">REDZONE</span>
          <br />
          <span className="text-white">CHAMPIONSHIP LEAGUE</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-4 font-orbitron">
          SEASON 4
        </p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Trophy className="text-rcl-gold w-8 h-8" />
          <span className="text-2xl md:text-3xl font-bold text-rcl-gold font-orbitron">
            $500 SUPER BOWL PRIZE
          </span>
          <Trophy className="text-rcl-gold w-8 h-8" />
        </div>

        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          The most competitive NFL Universe league on Roblox. Join elite players, compete for glory, and claim your championship.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://discord.gg/AbYZ2CBzmq"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-rcl-red hover:bg-red-700 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 animate-glow"
          >
            <MessageCircle size={20} />
            Join the League
          </a>
          <a
            href="#schedule"
            className="border border-rcl-red text-rcl-red hover:bg-rcl-red hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <Calendar size={20} />
            View Schedule
          </a>
        </div>

        {/* Stats preview */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white font-orbitron">4</div>
            <div className="text-gray-500 text-sm">Seasons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-rcl-gold font-orbitron">$500</div>
            <div className="text-gray-500 text-sm">Prize Pool</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white font-orbitron">7v7+</div>
            <div className="text-gray-500 text-sm">Format</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-rcl-red w-8 h-8" />
      </div>
    </section>
  );
}

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [teamRecords, setTeamRecords] = useState({});
  const [currentWeek, setCurrentWeek] = useState(11);

  // Load data and listen for changes
  useEffect(() => {
    const loadData = () => {
      setSchedule(getStoredData('rcl_schedule', defaultSchedule));
      setTeamRecords(getStoredData('rcl_team_records', defaultTeamRecords));
      setCurrentWeek(getStoredData('rcl_week', 11));
    };
    loadData();

    // Listen for storage changes (from Panel)
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    
    // Also poll for changes every 2 seconds (for same-tab updates)
    const interval = setInterval(loadData, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Helper to get team data
  const getTeam = (teamId) => {
    const team = allNflTeams[teamId];
    if (!team) return { name: teamId, abbr: teamId, logo: '' };
    return { ...team, record: teamRecords[teamId] || '0-0' };
  };

  // Convert schedule format for display
  const games = schedule.map(g => ({
    ...g,
    home: getTeam(g.homeTeam),
    away: getTeam(g.awayTeam),
    isTonight: g.status === 'tonight',
    isCompleted: g.status === 'completed',
    isLive: g.status === 'live',
    rescheduled: g.status === 'rescheduled',
  }));

  return (
    <section id="schedule" className="py-20 px-4 bg-slate-900/60 backdrop-blur-sm relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">WEEK {currentWeek}</span> SCHEDULE
          </h2>
          <p className="text-gray-400">Official matchups for this week</p>
        </div>

        {/* Tonight's Game */}
        {games.filter(g => g.isTonight).map((game, idx) => (
          <div key={game.id || idx} className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="live-dot" />
              <span className="text-green-400 font-orbitron font-bold">TONIGHT {game.time ? `@ ${game.time}` : ''}</span>
              <div className="live-dot" />
            </div>
            <div className="glass rounded-2xl p-6 md:p-8 team-card border-2 border-green-500/50 animate-pulse-slow hover:shadow-green-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <img src={game.home.logo} alt={game.home.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 object-contain" />
                  <p className="font-semibold text-lg">{game.home.name}</p>
                  <p className="text-gray-400 text-sm">({game.home.record})</p>
                </div>
                <div className="px-6">
                  <span className="text-green-400 font-orbitron font-bold text-xl">VS</span>
                </div>
                <div className="flex-1 text-center">
                  <img src={game.away.logo} alt={game.away.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 object-contain" />
                  <p className="font-semibold text-lg">{game.away.name}</p>
                  <p className="text-gray-400 text-sm">({game.away.record})</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* LIVE Game */}
        {games.filter(g => g.isLive).map((game, idx) => (
          <div key={game.id || idx} className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="live-dot" />
              <span className="text-red-400 font-orbitron font-bold animate-pulse">🔴 LIVE NOW</span>
              <div className="live-dot" />
            </div>
            <div className="glass rounded-2xl p-6 md:p-8 team-card border-2 border-red-500/50 animate-pulse-slow">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <img src={game.home.logo} alt={game.home.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 object-contain" />
                  <p className="font-semibold text-lg">{game.home.name}</p>
                  <p className="text-gray-400 text-sm">({game.home.record})</p>
                </div>
                <div className="px-6 text-center">
                  <span className="text-white font-orbitron font-bold text-3xl">{game.homeScore} - {game.awayScore}</span>
                </div>
                <div className="flex-1 text-center">
                  <img src={game.away.logo} alt={game.away.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 object-contain" />
                  <p className="font-semibold text-lg">{game.away.name}</p>
                  <p className="text-gray-400 text-sm">({game.away.record})</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Game of the Week */}
        {games.filter(g => g.isGameOfWeek && !g.isTonight && !g.isLive).map((game, idx) => (
          <div key={game.id || idx} className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="text-rcl-gold w-5 h-5" />
              <span className="text-rcl-gold font-orbitron font-bold">GAME OF THE WEEK</span>
              <Star className="text-rcl-gold w-5 h-5" />
            </div>
            <div className="glass rounded-2xl p-6 md:p-8 team-card border-2 border-rcl-gold/50 hover:shadow-yellow-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <img src={game.home.logo} alt={game.home.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 object-contain" />
                  <p className="font-semibold text-lg">{game.home.name}</p>
                  <p className="text-gray-400 text-sm">({game.home.record})</p>
                </div>
                <div className="px-6">
                  {game.isCompleted ? (
                    <span className="text-green-400 font-orbitron font-bold text-2xl">{game.homeScore} - {game.awayScore}</span>
                  ) : (
                    <span className="text-rcl-red font-orbitron font-bold text-xl">VS</span>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <img src={game.away.logo} alt={game.away.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 object-contain" />
                  <p className="font-semibold text-lg">{game.away.name}</p>
                  <p className="text-gray-400 text-sm">({game.away.record})</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Regular Games */}
        <div className="grid md:grid-cols-2 gap-4">
          {games.filter(g => !g.isGameOfWeek && !g.isTonight && !g.isLive).map((game, idx) => (
            <div key={game.id || idx} className={`glass rounded-xl p-4 team-card hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border ${game.rescheduled ? 'border-yellow-500/50' : 'border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img src={game.home.logo} alt={game.home.abbr} className="w-10 h-10 object-contain" />
                  <div>
                    <span className="font-medium text-sm md:text-base block">{game.home.name}</span>
                    <span className="text-gray-500 text-xs">({game.home.record})</span>
                    {game.rescheduled && <span className="text-yellow-400 text-xs font-bold block">RESCHEDULED!</span>}
                  </div>
                </div>
                <div className="px-3">
                  {game.isCompleted ? (
                    <span className="text-green-400 font-bold text-lg flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {game.homeScore} - {game.awayScore}
                    </span>
                  ) : (
                    <span className="text-rcl-red font-bold text-sm">VS</span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <span className="font-medium text-sm md:text-base block">{game.away.name}</span>
                    <span className="text-gray-500 text-xs">({game.away.record})</span>
                  </div>
                  <img src={game.away.logo} alt={game.away.abbr} className="w-10 h-10 object-contain" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Playoff Picture */}
        <div className="mt-12">
          <h3 className="font-orbitron text-2xl font-bold text-center mb-2">
            <span className="gradient-text">PLAYOFF</span> PICTURE
          </h3>
          <p className="text-gray-500 text-center text-sm mb-6">12 Team Playoff Format • Division Winners get Bye</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* AFC */}
            <div className="glass rounded-xl p-5">
              <h4 className="font-orbitron font-bold text-lg text-center mb-4 text-blue-400">AFC PLAYOFFS</h4>
              <div className="space-y-2">
                {afcPlayoffs.map((team, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${team.status === 'DIV' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5'}`}>
                    <span className="font-orbitron font-bold text-blue-400 w-6">#{team.seed}</span>
                    <img src={team.team.logo} alt={team.team.abbr} className="w-8 h-8 object-contain" />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{team.team.name}</span>
                      <span className="text-gray-500 text-xs ml-2">({team.team.record})</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${team.status === 'DIV' ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-500/30 text-gray-400'}`}>
                      {team.note}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-3 text-center">— Playoff Hunt —</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {afcHunt.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded opacity-60">
                    <span className="text-gray-500 text-xs">#{team.seed}</span>
                    <img src={team.team.logo} alt={team.team.abbr} className="w-5 h-5 object-contain" />
                    <span className="text-gray-400 text-xs">{team.team.record}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NFC */}
            <div className="glass rounded-xl p-5">
              <h4 className="font-orbitron font-bold text-lg text-center mb-4 text-red-400">NFC PLAYOFFS</h4>
              <div className="space-y-2">
                {nfcPlayoffs.map((team, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${team.status === 'DIV' ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5'}`}>
                    <span className="font-orbitron font-bold text-red-400 w-6">#{team.seed}</span>
                    <img src={team.team.logo} alt={team.team.abbr} className="w-8 h-8 object-contain" />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{team.team.name}</span>
                      <span className="text-gray-500 text-xs ml-2">({team.team.record})</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${team.status === 'DIV' ? 'bg-red-500/30 text-red-300' : 'bg-gray-500/30 text-gray-400'}`}>
                      {team.note}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-3 text-center">— Playoff Hunt —</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {nfcHunt.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded opacity-60">
                    <span className="text-gray-500 text-xs">#{team.seed}</span>
                    <img src={team.team.logo} alt={team.team.abbr} className="w-5 h-5 object-contain" />
                    <span className="text-gray-400 text-xs">{team.team.record}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Champions() {
  return (
    <section id="champions" className="py-20 px-4 bg-gradient-to-br from-slate-900/80 via-purple-900/10 to-slate-900/80 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">SUPER BOWL</span> CHAMPIONS
          </h2>
          <p className="text-gray-400">History of RCL championship games</p>
        </div>

        <div className="space-y-6">
          {superBowls.map((sb, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 team-card">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="text-rcl-gold w-6 h-6" />
                <span className="font-orbitron font-bold text-rcl-gold text-xl">SEASON {sb.season} SUPER BOWL</span>
                <Trophy className="text-rcl-gold w-6 h-6" />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 text-center">
                  <div className="relative inline-block">
                    <img src={sb.winner.logo} alt={sb.winner.team} className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain" />
                    <div className="absolute -top-2 -right-2 bg-rcl-gold rounded-full p-1">
                      <Crown className="w-4 h-4 text-black" />
                    </div>
                  </div>
                  <p className="font-bold text-lg mt-2 text-green-400">{sb.winner.team}</p>
                  <p className="text-gray-400 text-sm">#{sb.winner.seed} Seed</p>
                  <p className="text-4xl font-orbitron font-bold text-white mt-2">{sb.winner.score}</p>
                </div>
                
                <div className="px-4 text-center">
                  <div className="text-gray-500 text-sm mb-1">{sb.date}</div>
                  <div className="text-2xl font-orbitron text-gray-600">VS</div>
                </div>
                
                <div className="flex-1 text-center">
                  <img src={sb.loser.logo} alt={sb.loser.team} className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain opacity-75" />
                  <p className="font-bold text-lg mt-2 text-gray-400">{sb.loser.team}</p>
                  <p className="text-gray-500 text-sm">#{sb.loser.seed} Seed</p>
                  <p className="text-4xl font-orbitron font-bold text-gray-500 mt-2">{sb.loser.score}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-center text-gray-500 text-xs uppercase mb-3">CHAMPION DETAILS</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase">Super Bowl MVP</p>
                    <p className="font-semibold text-rcl-gold">{sb.mvp}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase">Franchise Owner</p>
                    <p className="font-semibold text-green-400">{sb.fo}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase">Winning QB</p>
                    <p className="font-semibold text-green-400">{sb.qb}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HallOfFame() {
  return (
    <section id="hof" className="py-20 px-4 bg-slate-900/60 backdrop-blur-sm relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">HALL OF</span> FAME
          </h2>
          <p className="text-gray-400">Legendary players with 2000+ Legacy Points</p>
        </div>

        {/* Hall of Fame */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="text-rcl-gold w-6 h-6" />
            <h3 className="font-orbitron text-xl font-bold text-rcl-gold">HALL OF FAME</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hallOfFame.map((player, idx) => (
              <div key={idx} className="glass rounded-xl p-5 team-card border border-rcl-gold/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-rcl-gold/10 rounded-bl-full" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rcl-gold to-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{player.name}</h4>
                    <p className="text-rcl-gold text-sm font-orbitron">{player.legacy.toLocaleString()} Legacy</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-gray-500 text-xs">Titles</p>
                    <p className="font-bold">{player.titles}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-gray-500 text-xs">SB Champs</p>
                    <p className="font-bold">{player.sbChamps}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-gray-500 text-xs">MVP</p>
                    <p className="font-bold">{player.mvp}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-gray-500 text-xs">Pro Bowls</p>
                    <p className="font-bold">{player.proBowl}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* X-Factor Players */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-purple-400 w-6 h-6" />
            <h3 className="font-orbitron text-xl font-bold text-purple-400">X-FACTOR PLAYERS</h3>
            <span className="text-gray-500 text-sm">(1100-1999 Legacy)</span>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {xFactorPlayers.map((player, idx) => (
              <div key={idx} className="glass rounded-xl p-4 team-card border border-purple-500/30 text-center">
                <h4 className="font-bold">{player.name}</h4>
                <p className="text-purple-400 text-sm font-orbitron">{player.legacy.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-1">{player.proBowl} Pro Bowls</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Awards() {
  const [selectedSeason, setSelectedSeason] = useState('s3');
  
  const positionalAwards = {
    s1: [
      { pos: 'QB', player: 'Coolguysonic' },
      { pos: 'RB', player: 'Iilxserwrldz' },
      { pos: 'WR', player: 'llMixll' },
      { pos: 'TE', player: 'BlvdTooMixy' },
      { pos: 'C', player: 'Lackstress' },
      { pos: 'DE', player: 'OffensiveLineman' },
      { pos: 'LB', player: 'Forrgetfull' },
      { pos: 'DB', player: 'Mrturtle77' },
      { pos: 'K', player: 'Carvallo2208' },
      { pos: 'HC', player: 'Nightlifeyt123' },
    ],
    s2: [
      { pos: 'QB', player: 'Kzxu' },
      { pos: 'RB', player: 'Evilreplayz123' },
      { pos: 'WR', player: 'Stacyislittle2' },
      { pos: 'TE', player: 'Dxmdih' },
      { pos: 'C', player: 'Trimmed4567' },
      { pos: 'DE', player: 'XTankmanXD' },
      { pos: 'LB', player: 'Rip_sammyxx' },
      { pos: 'DB', player: 'Solelyaaronwastaken' },
      { pos: 'K', player: 'yrainzz' },
      { pos: 'HC', player: 'Bigboneinher' },
      { pos: 'ROTY', player: 'Spiderman2653o' },
    ],
    s3: [
      { pos: 'QB', player: 'Bigboneinher' },
      { pos: 'RB', player: 'Aidenddod' },
      { pos: 'WR', player: 'perkiiyana' },
      { pos: 'TE', player: 'chadz' },
      { pos: 'C', player: 'Dabster_07' },
      { pos: 'DE', player: 'Kryptonitee' },
      { pos: 'LB', player: 'izzcomes' },
      { pos: 'DB', player: 'perkiiyana' },
      { pos: 'K', player: 'Nikowasban' },
      { pos: 'HC', player: 'Nightlifeyt123' },
      { pos: 'OROTY', player: 'Iorsanity' },
      { pos: 'DROTY', player: 'kadja' },
    ],
  };

  const awards = seasonAwards[selectedSeason];
  const posAwards = positionalAwards[selectedSeason];

  return (
    <section id="awards" className="py-20 px-4 bg-rcl-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">SEASON</span> AWARDS
          </h2>
          <p className="text-gray-400 mb-6">Recognizing the best performers each season</p>
          
          {/* Season Selector */}
          <div className="flex justify-center gap-2">
            {['s1', 's2', 's3'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-4 py-2 rounded-lg font-orbitron font-bold transition-all ${
                  selectedSeason === s 
                    ? 'bg-rcl-red text-white' 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* MVP & Major Awards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6 team-card border-2 border-rcl-gold text-center">
            <Trophy className="w-12 h-12 text-rcl-gold mx-auto mb-3" />
            <p className="text-gray-400 text-sm uppercase mb-1">Most Valuable Player</p>
            <p className="font-orbitron font-bold text-2xl text-rcl-gold">{awards.mvp}</p>
          </div>
          <div className="glass rounded-xl p-6 team-card border border-green-500/50 text-center">
            <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm uppercase mb-1">Offensive Player of the Year</p>
            <p className="font-orbitron font-bold text-2xl text-green-400">{awards.opoty}</p>
          </div>
          <div className="glass rounded-xl p-6 team-card border border-blue-500/50 text-center">
            <Swords className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm uppercase mb-1">Defensive Player of the Year</p>
            <p className="font-orbitron font-bold text-2xl text-blue-400">{awards.dpoty}</p>
          </div>
        </div>

        {/* Positional Awards */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="text-rcl-red" />
            Positional Awards
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {posAwards.map((award, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-rcl-red font-bold text-sm">{award.pos}OTY</p>
                <p className="text-white font-medium text-sm truncate">{award.player}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecordBook() {
  const [category, setCategory] = useState('passing');
  
  const categories = [
    { id: 'passing', name: 'Passing', icon: '🏈' },
    { id: 'rushing', name: 'Rushing', icon: '🏃' },
    { id: 'receiving', name: 'Receiving', icon: '🙌' },
    { id: 'defense', name: 'Defense', icon: '🛡️' },
  ];

  return (
    <section id="records" className="py-20 px-4 bg-rcl-darker">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">RECORD</span> BOOK
          </h2>
          <p className="text-gray-400">All-time league records</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                category === cat.id 
                  ? 'bg-rcl-red text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Records Table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left p-4 text-gray-400 font-medium">Record</th>
                <th className="text-center p-4 text-gray-400 font-medium">Value</th>
                <th className="text-center p-4 text-gray-400 font-medium">Holder</th>
                <th className="text-center p-4 text-gray-400 font-medium">Season</th>
              </tr>
            </thead>
            <tbody>
              {records[category].map((record, idx) => (
                <tr key={idx} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{record.stat}</td>
                  <td className="p-4 text-center font-orbitron text-rcl-gold font-bold">{record.value}</td>
                  <td className="p-4 text-center text-white font-semibold">{record.holder}</td>
                  <td className="p-4 text-center text-gray-400">{record.season}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section id="stats" className="py-20 px-4 bg-rcl-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">STATS</span> & RECORDS
          </h2>
          <p className="text-gray-400">Track performance across all seasons</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statSheets.map((sheet, idx) => (
            <a
              key={idx}
              href={sheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass rounded-xl p-6 team-card group ${sheet.current ? 'border-2 border-rcl-gold' : ''}`}
            >
              {sheet.current && (
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-rcl-gold w-4 h-4" />
                  <span className="text-rcl-gold text-sm font-semibold">CURRENT SEASON</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rcl-red/20 rounded-lg flex items-center justify-center group-hover:bg-rcl-red/40 transition-colors">
                    <BarChart3 className="text-rcl-red w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{sheet.name}</h3>
                    <p className="text-gray-500 text-sm">Google Sheets</p>
                  </div>
                </div>
                <ExternalLink className="text-gray-500 group-hover:text-rcl-red transition-colors" size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rules() {
  const [openSection, setOpenSection] = useState(0);

  const ruleLinks = [
    { name: 'Game Rules', url: 'https://docs.google.com/document/d/1pWO6OCmT8vJLj2Ifnsj3QG4Mv7uMrs0kC4_t4cqWW_I/edit?usp=sharing', desc: 'Official referee rulebook' },
    { name: 'Server Rules', url: 'https://docs.google.com/document/d/1HsB4S4UnoOpqF9A2GvsxN_C61NQs2R6jERLxAPMOszw/edit?tab=t.0', desc: 'Discord server guidelines' },
  ];

  return (
    <section id="rules" className="py-20 px-4 bg-gradient-to-br from-slate-900/80 via-purple-900/10 to-slate-900/80 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">LEAGUE</span> RULES
          </h2>
          <p className="text-gray-400">Code of conduct and game regulations</p>
          
          {/* Links Section */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {ruleLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-lg px-5 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors group"
              >
                <FileText className="text-rcl-red" size={20} />
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-rcl-red transition-colors">{link.name}</p>
                  <p className="text-gray-500 text-xs">{link.desc}</p>
                </div>
                <ExternalLink className="text-gray-500 group-hover:text-rcl-red transition-colors" size={16} />
              </a>
            ))}
          </div>
        </div>
        
        <p className="text-center text-gray-500 text-sm mb-6">SERVER RULES QUICK REFERENCE</p>

        <div className="space-y-4">
          {rules.map((section, idx) => (
            <div key={idx} className="glass rounded-xl overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                onClick={() => setOpenSection(openSection === idx ? -1 : idx)}
              >
                <div className="flex items-center gap-3">
                  <Shield className="text-rcl-red w-5 h-5" />
                  <span className="font-semibold text-lg">{section.title}</span>
                </div>
                <ChevronDown 
                  className={`text-gray-400 transition-transform ${openSection === idx ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              {openSection === idx && (
                <div className="px-6 pb-4">
                  <ul className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-gray-300">
                        <span className="text-rcl-red mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Join() {
  const discordServers = [
    { name: 'RCL Main Server', url: 'https://discord.gg/AbYZ2CBzmq', primary: true },
    { name: 'Stats Server', url: 'https://discord.gg/T8FNG7QThY' },
    { name: 'Support Server', url: 'https://discord.gg/EY6Gx5veNh' },
  ];

  return (
    <section id="join" className="py-20 px-4 bg-rcl-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">JOIN</span> THE LEAGUE
          </h2>
          <p className="text-gray-400">Connect with us and start competing</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Discord Servers */}
          <div>
            <h3 className="font-orbitron text-xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="text-rcl-red" />
              Discord Servers
            </h3>
            <div className="space-y-4">
              {discordServers.map((server, idx) => (
                <a
                  key={idx}
                  href={server.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glass rounded-xl p-4 flex items-center justify-between team-card group ${server.primary ? 'border-2 border-rcl-red' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${server.primary ? 'bg-rcl-red' : 'bg-rcl-red/20'}`}>
                      <MessageCircle className={server.primary ? 'text-white' : 'text-rcl-red'} size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{server.name}</h4>
                      {server.primary && <span className="text-rcl-red text-sm">Main League Server</span>}
                    </div>
                  </div>
                  <ExternalLink className="text-gray-500 group-hover:text-rcl-red transition-colors" size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Creator Socials */}
          <div>
            <h3 className="font-orbitron text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-rcl-red" />
              Follow the Creator
            </h3>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src="/founders_pfp.png" 
                  alt="lastqall"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-xl">lastqall</h4>
                  <p className="text-gray-400">League Founder</p>
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href="https://twitch.tv/lastqall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 transition-colors group"
                >
                  <Twitch className="text-purple-400" size={24} />
                  <span>Twitch</span>
                  <ExternalLink className="ml-auto text-gray-500 group-hover:text-purple-400" size={16} />
                </a>
                <a
                  href="https://youtube.com/@lastqall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-600/20 hover:bg-red-600/40 transition-colors group"
                >
                  <Youtube className="text-red-500" size={24} />
                  <span>YouTube</span>
                  <ExternalLink className="ml-auto text-gray-500 group-hover:text-red-500" size={16} />
                </a>
                <a
                  href="https://tiktok.com/@lastqall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span>TikTok</span>
                  <ExternalLink className="ml-auto text-gray-500 group-hover:text-white" size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Login Modal Component
function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = validateCredentials(username, password);
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        onClose();
        navigate('/panel');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-purple-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-purple-500/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white">Developer Login</h2>
          <p className="text-gray-400 text-sm mt-2">Access the admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors pr-12"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={18} />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Footer() {
  const [showLogin, setShowLogin] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const session = localStorage.getItem(AUTH_KEY);
    if (session) {
      // User is already logged in
    }
  }, []);

  return (
    <>
      <footer className="py-8 px-4 bg-slate-900/80 backdrop-blur-sm border-t border-purple-500/20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/rcl_server_logo.png" alt="RCL Logo" className="w-8 h-8 rounded-full" />
              <span className="font-orbitron font-bold gradient-text">RCL</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400 text-sm">Redzone Championship League</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-gray-500 text-sm">
                Season 4 • $500 Super Bowl Prize • Founded by lastqall
              </div>
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-600 hover:text-purple-400 transition-colors flex items-center gap-1 text-xs"
              >
                <Lock size={12} />
                Dev
              </button>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

// Main Site Component
function MainSite() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-x-hidden relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Schedule />
        <Champions />
        <HallOfFame />
        <Awards />
        <RecordBook />
        <Stats />
        <Rules />
        <Join />
      </main>
      <Footer />
      <LikeButton />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/panel" element={<Panel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
