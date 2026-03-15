/**
 * CeepzRoyale ArenaHub — main public landing page.
 * Fetches live data from the Clash Royale API every 60 s.
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Shield,
  Swords,
  Crown,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Star,
  Zap,
  Target,
  Heart,
  Gift,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Music,
  MessageSquare,
} from 'lucide-react';

import {
  useClan,
  useClanMembers,
  useCurrentRiverRace,
  useRiverRaceLog,
  formatLastSeen,
  roleLabel,
  type CRClanMember,
  type CRRaceParticipant,
} from '@/hooks/useClashRoyaleAPI';

// ─── Small reusable pieces ────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
      LIVE
    </span>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 border border-primary/25 mb-4">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2">{title}</h2>
      {sub && <p className="text-muted-foreground max-w-xl mx-auto">{sub}</p>}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/60 ${className}`}
    />
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── Role styling ─────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, string> = {
  leader:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  coLeader: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  elder:    'bg-blue-500/20  text-blue-400  border-blue-500/30',
  member:   'bg-muted/50     text-muted-foreground border-border',
};

const ROLE_ICON: Record<string, React.ElementType> = {
  leader:   Crown,
  coLeader: Shield,
  elder:    Star,
  member:   Users,
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLE[role] ?? ROLE_STYLE.member;
  const Icon  = ROLE_ICON[role] ?? Users;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>
      <Icon className="h-3 w-3" />
      {roleLabel(role)}
    </span>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Navbar({ memberCount }: { memberCount?: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '#stats',       label: 'Stats'     },
    { href: '#top5',        label: 'Hall of Fame 🏆'  },
    { href: '#roster',      label: 'Roster'    },
    { href: '#war',         label: 'War'       },
    { href: '#coaching',    label: 'Coaching'  },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-lg' : ''
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <a href="#top" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <div className="font-display text-base font-bold text-gradient">CeepzRoyale</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">ArenaHub</div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://discord.gg/QuxsNvHpjh"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-btn inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> Discord
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {memberCount !== undefined && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {memberCount}/50
            </span>
          )}
          <Link
            to="/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors"
          >
            Dashboard <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          {/* Mobile burger */}
          <button
            className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <Flame className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard →
          </Link>
          <a
            href="https://discord.gg/QuxsNvHpjh"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-btn inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors w-full"
          >
            <MessageSquare className="h-4 w-4" /> Discord
          </a>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({
  clanName,
  clanDesc,
  memberCount,
  warTrophies,
  clanScore,
  isLoading,
}: {
  clanName?: string;
  clanDesc?: string;
  memberCount?: number;
  warTrophies?: number;
  clanScore?: number;
  isLoading: boolean;
}) {
  return (
    <section
      id="top"
      className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Legendary Arena background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: 'url(/legendary-arena.jpg)', backgroundPosition: 'center center', opacity: 0.45 }}
      />
      {/* Hexagon grid */}
      <div className="absolute inset-0 hex-grid opacity-60" />
      {/* Radial pulse */}
      <div className="absolute inset-0 radial-pulse" />
      {/* Rising gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left:'4%',  size:'3px', dur:'9s',  delay:'0s',   drift:'8px'  },
          { left:'12%', size:'2px', dur:'13s', delay:'2s',   drift:'-6px' },
          { left:'22%', size:'4px', dur:'11s', delay:'1s',   drift:'12px' },
          { left:'33%', size:'2px', dur:'15s', delay:'3.5s', drift:'-10px'},
          { left:'45%', size:'3px', dur:'10s', delay:'0.5s', drift:'6px'  },
          { left:'55%', size:'2px', dur:'14s', delay:'4s',   drift:'-8px' },
          { left:'65%', size:'3px', dur:'12s', delay:'1.5s', drift:'10px' },
          { left:'75%', size:'2px', dur:'9s',  delay:'2.5s', drift:'-5px' },
          { left:'84%', size:'4px', dur:'16s', delay:'0.8s', drift:'7px'  },
          { left:'93%', size:'2px', dur:'11s', delay:'3s',   drift:'-9px' },
        ].map((p, i) => (
          <div
            key={i}
            className="gold-particle"
            style={{
              left: p.left,
              bottom: '-10px',
              width: p.size,
              height: p.size,
              animationDuration: p.dur,
              animationDelay: p.delay,
              ['--drift' as string]: p.drift,
            }}
          />
        ))}
      </div>
      {/* Bottom fade to page */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />



      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Crown className="h-4 w-4" />
          Official Clash Royale Clan · #QUP9LUYJ
        </div>

        {/* Clan crest placeholder */}
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 shadow-[0_0_40px_hsl(217,91%,60%,0.3)]">
          <Crown className="h-14 w-14 text-gradient-gold" style={{ color: 'hsl(45,93%,58%)' }} />
        </div>

        {/* Clan name */}
        {isLoading ? (
          <Skeleton className="mx-auto mb-4 h-14 w-72" />
        ) : (
          <h1 className="font-display text-5xl md:text-7xl font-black text-gradient mb-4 leading-none">
            {clanName ?? 'CeepzRoyale'}
          </h1>
        )}

        <p className="font-display text-accent text-lg md:text-xl font-semibold tracking-wide mb-4">
          ARENAHUB · CLASH ROYALE
        </p>

        {isLoading ? (
          <Skeleton className="mx-auto mb-8 h-6 w-80" />
        ) : (
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            {clanDesc ?? 'Elite clan competing at the highest level. Join us, conquer the Arena.'}
          </p>
        )}

        {/* Live counters */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {[
            { icon: Users,   label: 'Members',     value: isLoading ? '…' : `${memberCount ?? 0}/50` },
            { icon: Trophy,  label: 'Clan Score',   value: isLoading ? '…' : (clanScore ?? 0).toLocaleString() },
            { icon: Shield,  label: 'War Trophies', value: isLoading ? '…' : (warTrophies ?? 0).toLocaleString() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-display text-2xl font-bold text-gradient">{value}</span>
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#roster"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-display font-bold text-white shadow-[0_0_20px_hsl(217,91%,60%,0.4)] hover:shadow-[0_0_30px_hsl(217,91%,60%,0.6)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Users className="h-4 w-4" /> View Roster
          </a>
          <a
            href="#coaching"
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-6 py-3 font-display font-bold text-accent hover:bg-accent/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Zap className="h-4 w-4" /> Get Coached
          </a>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

// ─── Live Stats Banner ────────────────────────────────────────────────────────

function LiveStatsSection({
  memberCount,
  clanScore,
  warTrophies,
  requiredTrophies,
  donationsPerWeek,
  isLoading,
  error,
  lastUpdated,
}: {
  memberCount?: number;
  clanScore?: number;
  warTrophies?: number;
  requiredTrophies?: number;
  donationsPerWeek?: number;
  isLoading: boolean;
  error?: Error | null;
  lastUpdated: Date | null;
}) {
  const stats = [
    { icon: Users,  label: 'Members',           value: memberCount,     format: (v: number) => `${v}/50`,           color: 'text-primary'   },
    { icon: Trophy, label: 'Clan Score',         value: clanScore,       format: (v: number) => v.toLocaleString(),  color: 'trophy-shimmer' },
    { icon: Shield, label: 'War Trophies',       value: warTrophies,     format: (v: number) => v.toLocaleString(),  color: 'text-accent'    },
    { icon: Target, label: 'Min Trophies',       value: requiredTrophies,format: (v: number) => v.toLocaleString(),  color: 'text-secondary' },
    { icon: Gift,   label: 'Donations / Week',   value: donationsPerWeek,format: (v: number) => v.toLocaleString(),  color: 'text-success'   },
  ];

  return (
    <section id="stats" className="py-20 px-4">
      <div className="mx-auto max-w-7xl fade-up">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">Live Clan Stats</h2>
            <p className="text-sm text-muted-foreground">Auto-refreshes every 60 seconds</p>
          </div>
          <div className="flex items-center gap-3">
            <LiveBadge />
            {lastUpdated && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {error && <ErrorBox message={`Could not load clan data: ${error.message}`} />}

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ icon: Icon, label, value, format, color }, idx) => (
            <div key={label} className={`stat-card flex flex-col items-center text-center gap-2 py-6 fade-up ${idx === 0 ? 'fade-up-delay-1' : idx === 1 ? 'fade-up-delay-2' : idx === 2 ? 'fade-up-delay-3' : ''}`}>
              <Icon className={`h-6 w-6 ${color === 'trophy-shimmer' ? 'text-amber-400' : color}`} />
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <span className={`font-display text-2xl font-bold ${color}`}>
                  {value !== undefined ? format(value) : '—'}
                </span>
              )}
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Member Roster ────────────────────────────────────────────────────────────

type SortKey = 'trophies' | 'donations' | 'clanRank' | 'name';

function RosterSection({
  members,
  isLoading,
  error,
}: {
  members?: CRClanMember[];
  isLoading: boolean;
  error?: Error | null;
}) {
  const [query, setQuery]     = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('clanRank');
  const [sortAsc, setSortAsc] = useState(true);
  const [roleFilter, setRole] = useState<string>('all');

  const sorted = (members ?? [])
    .filter((m) => {
      const matchName = m.name.toLowerCase().includes(query.toLowerCase())
                     || m.tag.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === 'all' || m.role === roleFilter;
      return matchName && matchRole;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'trophies':   cmp = b.trophies   - a.trophies;   break;
        case 'donations':  cmp = b.donations  - a.donations;  break;
        case 'clanRank':   cmp = a.clanRank   - b.clanRank;   break;
        case 'name':       cmp = a.name.localeCompare(b.name); break;
      }
      return sortAsc ? cmp : -cmp;
    });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="h-3.5 w-3.5 opacity-30" />;
    return sortAsc
      ? <ChevronDown className="h-3.5 w-3.5 text-primary" />
      : <ChevronUp   className="h-3.5 w-3.5 text-primary" />;
  }

  return (
    <section id="roster" className="py-20 px-4">
      <div className="mx-auto max-w-7xl fade-up">
        <SectionHeading
          icon={Users}
          title="Clan Roster"
          sub="All 50 members · live data from Clash Royale API"
        />

        {error && <ErrorBox message={`Could not load members: ${error.message}`} />}

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or tag…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Role */}
            <select
              value={roleFilter}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="leader">Leader</option>
              <option value="coLeader">Co-Leader</option>
              <option value="elder">Elder</option>
              <option value="member">Member</option>
            </select>
            {/* Sort buttons */}
            <div className="flex gap-2">
              {([
                ['trophies',  'Trophies'],
                ['donations', 'Donations'],
                ['clanRank',  'Rank'],
                ['name',      'Name'],
              ] as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortKey === key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{sorted.length} members</span>
          <LiveBadge />
        </div>

        {/* Card Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No members match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((m, idx) => {
              const trophyBorder = (m.trophies ?? 0) >= 7000 ? 'border-amber-500/50 shadow-[0_0_12px_hsl(45,93%,58%,0.2)]' :
                                   (m.trophies ?? 0) >= 5000 ? 'border-primary/50' :
                                   (m.trophies ?? 0) >= 3000 ? 'border-red-500/40' : 'border-border';
              return (
                <div key={m.tag} className={`stat-card border ${trophyBorder} flex flex-col gap-2`}>
                  <div className="flex items-center gap-3">
                    {/* Rank + avatar placeholder */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display font-black text-sm border-2 ${trophyBorder} bg-muted`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm truncate">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">{m.tag}</div>
                    </div>
                    <RoleBadge role={m.role} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-border/50">
                    <div>
                      <div className="trophy-shimmer font-display font-bold">{(m.trophies ?? 0).toLocaleString()}</div>
                      <div className="text-muted-foreground">Trophies</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-display font-bold">{(m.donations ?? 0).toLocaleString()}</div>
                      <div className="text-muted-foreground">Donated</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium">{formatLastSeen(m.lastSeen)}</div>
                      <div className="text-muted-foreground">Online</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── War Section ──────────────────────────────────────────────────────────────

function WarSection({
  currentRace,
  raceLog,
  isLoadingCurrent,
  isLoadingLog,
  errorCurrent,
}: {
  currentRace?: ReturnType<typeof useCurrentRiverRace>['data'];
  raceLog?: ReturnType<typeof useRiverRaceLog>['data'];
  isLoadingCurrent: boolean;
  isLoadingLog: boolean;
  errorCurrent?: Error | null;
}) {
  const participants: CRRaceParticipant[] = currentRace?.clan?.participants ?? [];
  const sortedParticipants = [...participants].sort((a, b) => b.fame - a.fame);

  const recentRaces = (raceLog?.items ?? []).slice(0, 5);

  // Find our clan's standing in each historical race
  const ourTag = (import.meta.env.VITE_CR_CLAN_TAG ?? '%23QUP9LUYJ').replace('%23', '#');

  return (
    <section id="war" className="py-20 px-4">
      <div className="mx-auto max-w-7xl fade-up">
        <SectionHeading
          icon={Swords}
          title="War Performance"
          sub="Live River Race and recent season results"
        />

        {errorCurrent && (
          <ErrorBox message={`Could not load River Race: ${errorCurrent.message}`} />
        )}

        {/* Current Race Summary */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                <Flame className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Current River Race</h3>
                {currentRace && (
                  <p className="text-xs text-muted-foreground">
                    Section {currentRace.sectionIndex + 1} · {currentRace.periodType}
                  </p>
                )}
              </div>
              <LiveBadge />
            </div>

            {isLoadingCurrent ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : currentRace?.clans ? (
              <div className="space-y-2">
                {(() => {
                  const sortedClans = [...currentRace.clans].sort((a, b) => b.fame - a.fame);
                  const maxFame = Math.max(...sortedClans.map(c => c.fame), 1);
                  return sortedClans.map((clan, idx) => {
                    const isUs = clan.tag === ourTag;
                    return (
                      <div
                        key={clan.tag}
                        className={`rounded-lg p-3 ${
                          isUs
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-display font-bold w-5 text-center ${
                            idx === 0 ? 'text-amber-400' : 'text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`flex-1 font-medium truncate ${isUs ? 'text-primary' : ''}`}>
                            {clan.name}
                            {isUs && <span className="ml-2 text-xs text-primary/70">(us)</span>}
                          </span>
                          <div className="text-right">
                            <div className="font-display font-bold text-accent text-sm">
                              {clan.fame.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground">fame</div>
                          </div>
                          {clan.finishTime && (
                            <div className="h-2 w-2 rounded-full bg-green-400" title="Finished" />
                          )}
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                              idx === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                              idx === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-800' :
                              'bg-primary/60'
                            }`}
                            style={{ width: `${Math.round((clan.fame / maxFame) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No active River Race data.</p>
            )}
          </div>

          {/* Race log summary */}
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-display font-bold text-lg">Recent Race Results</h3>
            </div>

            {isLoadingLog ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentRaces.length > 0 ? (
              <div className="space-y-2">
                {recentRaces.map((race, i) => {
                  const ourStanding = race.standings.find(
                    (s) => s.clan.tag === ourTag
                  );
                  const rank = ourStanding?.rank;
                  const fame = ourStanding?.clan.fame;
                  const trophyChange = ourStanding?.trophyChange;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg p-3 bg-muted/30"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-display font-bold text-sm ${
                        rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                        rank === 2 ? 'bg-slate-500/20 text-slate-400' :
                        rank === 3 ? 'bg-amber-800/20 text-amber-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {rank ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">
                          Season {race.seasonId} · Week {race.sectionIndex + 1}
                        </div>
                        <div className="text-sm font-medium">
                          {fame?.toLocaleString() ?? '—'} fame
                        </div>
                      </div>
                      {trophyChange !== undefined && (
                        <div className={`font-display font-bold text-sm ${
                          trophyChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trophyChange >= 0 ? '+' : ''}{trophyChange}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No race history available.</p>
            )}
          </div>
        </div>

        {/* Individual contributions */}
        {(sortedParticipants.length > 0 || isLoadingCurrent) && (
          <div className="stat-card overflow-hidden p-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Individual War Contributions</h3>
              <LiveBadge />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">#</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fame</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Decks Used</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Today</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Boat Attacks</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Repair Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCurrent
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/40">
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="py-3 px-4">
                              <Skeleton className="h-4 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : sortedParticipants.map((p, idx) => (
                        <tr
                          key={p.tag}
                          className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className={`font-display font-bold text-xs ${
                              idx === 0 ? 'text-amber-400' :
                              idx === 1 ? 'text-slate-400' :
                              idx === 2 ? 'text-amber-700' :
                              'text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-[11px] text-muted-foreground">{p.tag}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-display font-bold text-accent">
                              {p.fame.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">
                            {p.decksUsed}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground hidden md:table-cell">
                            {p.decksUsedToday}
                          </td>
                          <td className="py-3 px-4 text-right text-primary hidden lg:table-cell">
                            {p.boatAttacks}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground hidden md:table-cell">
                            {p.repairPoints.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

function LeaderboardSection({
  members,
  isLoading,
}: {
  members?: CRClanMember[];
  isLoading: boolean;
}) {
  const [tab, setTab] = useState<'trophies' | 'donations'>('trophies');

  const topTrophies  = [...(members ?? [])].sort((a, b) => b.trophies   - a.trophies).slice(0, 10);
  const topDonations = [...(members ?? [])].sort((a, b) => b.donations  - a.donations).slice(0, 10);

  const list = tab === 'trophies' ? topTrophies : topDonations;

  function PodiumCard({ m, rank }: { m: CRClanMember; rank: number }) {
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <div className={`stat-card flex items-center gap-4 ${rank <= 3 ? 'border-accent/20' : ''}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display font-black text-base ${
          rank === 1 ? 'bg-amber-500/20 text-amber-400 text-xl' :
          rank === 2 ? 'bg-slate-500/20 text-slate-400' :
          rank === 3 ? 'bg-amber-800/20 text-amber-700' :
          'bg-muted text-muted-foreground text-sm'
        }`}>
          {rank <= 3 ? medals[rank - 1] : rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold truncate">{m.name}</div>
          <RoleBadge role={m.role} />
        </div>
        <div className="text-right">
          <div className={`font-display font-bold text-lg ${tab === 'trophies' ? 'trophy-shimmer' : 'text-green-400'}`}>
            {tab === 'trophies'
              ? m.trophies.toLocaleString()
              : m.donations.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {tab === 'trophies' ? 'trophies' : 'donated'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="leaderboard" className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          icon={TrendingUp}
          title="Top Players"
          sub="Ranked by trophies and donations this season"
        />

        {/* Tab toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-xl w-fit mx-auto">
          {[
            { key: 'trophies',  label: 'By Trophies',   icon: Trophy },
            { key: 'donations', label: 'By Donations',  icon: Gift   },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'trophies' | 'donations')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((m, i) => (
              <PodiumCard key={m.tag} m={m} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Coaching ─────────────────────────────────────────────────────────────────

const COACHING_PACKAGES = [
  {
    name: 'Clan Member',
    price: 'Free',
    period: '',
    badge: 'Members Only',
    highlight: true,
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    features: [
      'Free 1-on-1 coaching sessions',
      'Deck building & review',
      'Battle replay analysis',
      'War strategy coaching',
      'Meta analysis & counters',
      'Private Discord access',
    ],
    cta: 'Book Free Session',
  },
  {
    name: 'Non-Clan',
    price: '$10',
    period: '/hour',
    badge: '',
    highlight: false,
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    features: [
      '$10 per hour of coaching',
      'Deck building review',
      'Battle replay analysis',
      'Basic strategy tips',
      'Post-session recap',
      'Join the clan to get it free!',
    ],
    cta: 'Book Session',
  },
];

function CoachingSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real deployment, wire this to Formspree, EmailJS, etc.
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    formRef.current?.reset();
  }

  return (
    <section id="coaching" className="py-20 px-4">
      <div className="mx-auto max-w-7xl fade-up">
        <SectionHeading
          icon={Star}
          title="Coaching Services"
          sub="Level up your gameplay with personalized 1-on-1 coaching from CeepzRoyale's top players"
        />

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Packages */}
          <div className="grid gap-6">
            {COACHING_PACKAGES.map((pkg, pkgIdx) => {
              const Icon = pkg.icon;
              return (
                <div
                  key={pkg.name}
                  className={`relative stat-card flex flex-col fade-up ${pkgIdx === 0 ? 'fade-up-delay-1' : 'fade-up-delay-2'} ${
                    pkg.highlight ? 'ring-2 ring-primary shadow-[0_0_40px_hsl(217,91%,60%,0.2)]' : ''
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-4 py-0.5 text-xs font-bold text-white">
                      {pkg.badge}
                    </div>
                  )}

                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border mb-4 ${pkg.bgColor}`}>
                    <Icon className={`h-6 w-6 ${pkg.color}`} />
                  </div>

                  <h3 className="font-display text-xl font-bold mb-1">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-display text-4xl font-black text-gradient">{pkg.price}</span>
                    <span className="text-muted-foreground text-sm">{pkg.period}</span>
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-8">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Heart className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#book"
                    className={`w-full text-center rounded-xl py-3 font-display font-bold text-sm transition-all duration-300 ${
                      pkg.highlight
                        ? 'bg-gradient-primary text-white shadow-[0_0_20px_hsl(217,91%,60%,0.3)] hover:shadow-[0_0_30px_hsl(217,91%,60%,0.5)]'
                        : 'border border-border hover:border-primary/40 hover:bg-primary/10 text-foreground'
                    }`}
                  >
                    {pkg.cta}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Booking form */}
          <div id="book">
          <div className="glass rounded-2xl p-8">
            <h3 className="font-display text-2xl font-bold text-gradient mb-2">Book a Session</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Fill out the form and we'll reach out within 24 hours to schedule your coaching session.
            </p>

            {submitted ? (
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-6 text-center">
                <div className="font-display font-bold text-green-400 text-lg mb-1">Request Sent!</div>
                <p className="text-muted-foreground text-sm">We'll contact you within 24 hours.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">In-Game Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Your Clash Royale name"
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Player Tag *</label>
                    <input
                      required
                      type="text"
                      placeholder="#XXXXXXXX"
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Contact (Discord / Email) *</label>
                  <input
                    required
                    type="text"
                    placeholder="Discord: User#1234  or  you@email.com"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Membership</label>
                  <select className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="member">Clan Member — Free</option>
                    <option value="non-member">Non-Clan — $10 / hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Goals / Focus Areas</label>
                  <textarea
                    rows={3}
                    placeholder="What do you want to improve? (deck building, war strategy, ladder climbing…)"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-primary py-3 font-display font-bold text-white shadow-[0_0_20px_hsl(217,91%,60%,0.3)] hover:shadow-[0_0_30px_hsl(217,91%,60%,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Send Booking Request
                </button>
              </form>
            )}
          </div>
          </div>{/* end booking form column */}
        </div>{/* end grid gap-12 */}
      </div>
    </section>
  );
}

// ─── Top 5 Hall of Fame ───────────────────────────────────────────────────────

const MEDAL = ['🥇', '🥈', '🥉', '4th', '5th'];
const TOP5_RANK_STYLE = [
  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'bg-slate-500/20  text-slate-300  border border-slate-500/30',
  'bg-amber-800/20  text-amber-600  border border-amber-800/30',
  'bg-muted         text-muted-foreground border border-border',
  'bg-muted         text-muted-foreground border border-border',
];

function Top5Section({
  members,
  isLoading,
}: {
  members?: CRClanMember[];
  isLoading: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const [isVisible,     setIsVisible]     = useState(false);
  const [musicEnabled,  setMusicEnabled]  = useState(true);

  const top5 = [...(members ?? [])].sort((a, b) => (b.trophies ?? 0) - (a.trophies ?? 0)).slice(0, 3);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio('/clash_royale_ot.mp3');
    audio.loop   = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // IntersectionObserver — fire when ≥30% of section is on screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Play / pause based on visibility + toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isVisible && musicEnabled) {
      audio.play().catch(() => {
        // Autoplay blocked until first user interaction — silently ignore
      });
    } else {
      audio.pause();
    }
  }, [isVisible, musicEnabled]);

  const isPlaying = isVisible && musicEnabled;

  return (
    <section
      id="top5"
      ref={sectionRef}
      className="relative py-20 px-4 overflow-hidden"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(258,30%,6%)] to-background pointer-events-none" />

      {/* Golden stadium light radiating from top center */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'conic-gradient(from 270deg at 50% -20%, transparent 60deg, hsl(43,96%,56%,0.22) 85deg, hsl(48,100%,72%,0.35) 90deg, hsl(43,96%,56%,0.22) 95deg, transparent 120deg)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'conic-gradient(from 270deg at 50% -20%, transparent 50deg, hsl(43,96%,56%,0.08) 80deg, hsl(48,100%,65%,0.12) 90deg, hsl(43,96%,56%,0.08) 100deg, transparent 130deg)',
      }} />
      {/* Stadium floor glow beneath #1 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-16 w-80 h-24 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, hsl(43,96%,56%,0.3) 0%, hsl(43,96%,56%,0.1) 50%, transparent 75%)', filter: 'blur(12px)' }} />

      {/* Dark vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 75% at 50% 50%, transparent 35%, hsl(258,30%,3%,0.75) 100%)',
      }} />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left:'3%',  w:8,  h:5,  dur:'4.5s', delay:'0s',   color:'hsl(43,96%,60%)',  spin:'520deg',  flip:'-1' },
          { left:'8%',  w:6,  h:9,  dur:'5.5s', delay:'0.6s', color:'hsl(278,80%,65%)', spin:'380deg',  flip:'1'  },
          { left:'13%', w:10, h:6,  dur:'4.0s', delay:'1.2s', color:'hsl(0,90%,60%)',   spin:'600deg',  flip:'-1' },
          { left:'19%', w:7,  h:7,  dur:'6.0s', delay:'0.3s', color:'hsl(195,100%,65%)',spin:'290deg',  flip:'1'  },
          { left:'25%', w:9,  h:5,  dur:'4.8s', delay:'1.8s', color:'hsl(43,96%,70%)',  spin:'450deg',  flip:'-1' },
          { left:'31%', w:6,  h:10, dur:'5.2s', delay:'0.9s', color:'hsl(120,70%,55%)', spin:'540deg',  flip:'1'  },
          { left:'37%', w:8,  h:6,  dur:'3.8s', delay:'2.4s', color:'hsl(278,80%,70%)', spin:'360deg',  flip:'-1' },
          { left:'43%', w:5,  h:8,  dur:'5.8s', delay:'0.1s', color:'hsl(0,90%,65%)',   spin:'480deg',  flip:'1'  },
          { left:'49%', w:10, h:5,  dur:'4.2s', delay:'1.5s', color:'hsl(43,96%,60%)',  spin:'620deg',  flip:'-1' },
          { left:'55%', w:7,  h:9,  dur:'5.0s', delay:'0.7s', color:'hsl(195,100%,60%)',spin:'310deg',  flip:'1'  },
          { left:'61%', w:6,  h:6,  dur:'4.6s', delay:'2.1s', color:'hsl(120,70%,60%)', spin:'560deg',  flip:'-1' },
          { left:'67%', w:9,  h:5,  dur:'3.9s', delay:'0.4s', color:'hsl(278,80%,65%)', spin:'430deg',  flip:'1'  },
          { left:'73%', w:5,  h:10, dur:'5.4s', delay:'1.1s', color:'hsl(0,90%,60%)',   spin:'500deg',  flip:'-1' },
          { left:'79%', w:8,  h:6,  dur:'4.3s', delay:'2.8s', color:'hsl(43,96%,65%)',  spin:'350deg',  flip:'1'  },
          { left:'85%', w:6,  h:8,  dur:'5.7s', delay:'0.5s', color:'hsl(195,100%,65%)',spin:'580deg',  flip:'-1' },
          { left:'91%', w:9,  h:5,  dur:'4.1s', delay:'1.9s', color:'hsl(120,70%,55%)', spin:'410deg',  flip:'1'  },
          { left:'96%', w:7,  h:7,  dur:'5.3s', delay:'0.8s', color:'hsl(278,80%,60%)', spin:'470deg',  flip:'-1' },
          { left:'6%',  w:5,  h:6,  dur:'6.2s', delay:'3.0s', color:'hsl(43,96%,55%)',  spin:'340deg',  flip:'1'  },
          { left:'22%', w:8,  h:5,  dur:'4.7s', delay:'2.2s', color:'hsl(0,90%,65%)',   spin:'590deg',  flip:'-1' },
          { left:'46%', w:6,  h:9,  dur:'5.1s', delay:'3.5s', color:'hsl(195,100%,70%)',spin:'420deg',  flip:'1'  },
          { left:'58%', w:10, h:6,  dur:'3.7s', delay:'1.3s', color:'hsl(120,70%,60%)', spin:'510deg',  flip:'-1' },
          { left:'70%', w:7,  h:8,  dur:'4.9s', delay:'2.6s', color:'hsl(43,96%,68%)',  spin:'370deg',  flip:'1'  },
          { left:'82%', w:5,  h:5,  dur:'5.6s', delay:'0.2s', color:'hsl(278,80%,68%)', spin:'630deg',  flip:'-1' },
          { left:'16%', w:9,  h:6,  dur:'4.4s', delay:'4.0s', color:'hsl(0,90%,62%)',   spin:'460deg',  flip:'1'  },
          { left:'88%', w:6,  h:8,  dur:'6.5s', delay:'1.6s', color:'hsl(195,100%,68%)',spin:'390deg',  flip:'-1' },
        ].map((c, i) => (
          <div key={i} className="confetti-piece" style={{
            left: c.left,
            width: `${c.w}px`,
            height: `${c.h}px`,
            background: c.color,
            borderRadius: i % 4 === 0 ? '50%' : '2px',
            animationDuration: c.dur,
            animationDelay: c.delay,
            ['--spin' as string]: c.spin,
            ['--flip' as string]: c.flip,
          }} />
        ))}
      </div>

      {/* Top gold sweep line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
      {/* Bottom gold sweep line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />


      <div className="relative mx-auto max-w-3xl fade-up">

        {/* Heading */}
        <div className="mb-8 text-center relative">
          <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4 transition-all duration-300 ${
            isPlaying
              ? 'bg-amber-500/20 border border-amber-400/50 shadow-[0_0_30px_hsl(43,96%,56%,0.5)]'
              : 'bg-primary/15 border border-primary/30 shadow-[0_0_20px_hsl(43,96%,56%,0.2)]'
          }`}>
            <Crown className="h-7 w-7 text-primary" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
            Hall of Fame
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The clan's elite · ranked by trophies
          </p>

          {/* Music toggle */}
          <button
            onClick={() => setMusicEnabled((v) => !v)}
            aria-label={musicEnabled ? 'Mute overtime music' : 'Unmute overtime music'}
            className={`absolute right-0 top-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${
              musicEnabled
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            {musicEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Music On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Music Off</span>
              </>
            )}
          </button>
        </div>

        {/* Now-playing badge */}
        {isPlaying && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Music className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 font-medium animate-pulse tracking-wide uppercase">
              Overtime music playing
            </span>
            <Music className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          </div>
        )}

        {/* Podium */}
        {isLoading ? (
          <div className="flex items-end justify-center gap-4">
            <Skeleton className="h-52 w-1/3 rounded-t-2xl" />
            <Skeleton className="h-64 w-1/3 rounded-t-2xl" />
            <Skeleton className="h-40 w-1/3 rounded-t-2xl" />
          </div>
        ) : top5.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No member data available yet.
          </div>
        ) : (
          <>
            {/* ── Top 3 podium ── */}
            <div className="flex items-end justify-center gap-3 mb-3">

              {/* 2nd place */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full rounded-2xl border border-slate-400/30 bg-gradient-to-b from-slate-600/20 to-slate-800/20 px-3 py-4 mb-2 text-center shadow-[0_0_25px_hsl(215,20%,55%,0.2)] backdrop-blur-sm">
                  <div className="font-display text-3xl mb-1">🥈</div>
                  <div className="font-display font-bold text-sm truncate text-slate-200 mb-1">
                    {top5[1]?.name ?? '—'}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="h-3.5 w-3.5 text-slate-300" />
                    <span className="font-display text-sm font-bold text-slate-200">
                      {top5[1]?.trophies?.toLocaleString() ?? '—'}
                    </span>
                  </div>
                  <RoleBadge role={top5[1]?.role ?? 'member'} />
                </div>
                <div className="w-full h-24 rounded-t-xl flex items-center justify-center bg-gradient-to-t from-slate-700/40 to-slate-500/20 border border-slate-400/30 shadow-[0_0_20px_hsl(215,20%,55%,0.25)]">
                  <span className="font-display text-4xl font-black text-slate-300 drop-shadow-[0_0_10px_hsl(215,20%,80%,0.5)]">2</span>
                </div>
              </div>

              {/* 1st place — tallest + most epic */}
              <div className="flex flex-col items-center flex-1 -mt-6">
                <Crown className="h-9 w-9 text-amber-400 crown-bounce mb-1 drop-shadow-[0_0_12px_hsl(43,96%,56%,0.9)]" />
                <div className="relative w-full mb-2">
                  <div className="relative w-full rounded-2xl border border-amber-400/50 bg-gradient-to-b from-amber-900/30 to-yellow-950/20 px-3 py-5 text-center gold-pulse backdrop-blur-sm">
                    <div className="font-display text-3xl mb-1">🥇</div>
                    <div className="font-display font-bold text-base truncate trophy-shimmer mb-1">
                      {top5[0]?.name ?? '—'}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Trophy className="h-4 w-4 text-amber-400" />
                      <span className="font-display text-lg font-black trophy-shimmer">
                        {top5[0]?.trophies?.toLocaleString() ?? '—'}
                      </span>
                    </div>
                    <RoleBadge role={top5[0]?.role ?? 'member'} />
                  </div>
                </div>
                <div className="w-full h-36 rounded-t-xl flex items-center justify-center bg-gradient-to-t from-amber-900/50 to-amber-500/20 border border-amber-400/40 shadow-[0_0_40px_hsl(43,96%,56%,0.4)]">
                  <span className="font-display text-6xl font-black trophy-shimmer drop-shadow-[0_0_16px_hsl(43,96%,56%,0.8)]">1</span>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full rounded-2xl border border-amber-700/30 bg-gradient-to-b from-amber-900/20 to-orange-950/20 px-3 py-4 mb-2 text-center shadow-[0_0_20px_hsl(30,80%,40%,0.2)] backdrop-blur-sm">
                  <div className="font-display text-3xl mb-1">🥉</div>
                  <div className="font-display font-bold text-sm truncate text-amber-500 mb-1">
                    {top5[2]?.name ?? '—'}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-display text-sm font-bold text-amber-500">
                      {top5[2]?.trophies?.toLocaleString() ?? '—'}
                    </span>
                  </div>
                  <RoleBadge role={top5[2]?.role ?? 'member'} />
                </div>
                <div className="w-full h-14 rounded-t-xl flex items-center justify-center bg-gradient-to-t from-amber-900/40 to-amber-700/20 border border-amber-700/35 shadow-[0_0_18px_hsl(30,80%,40%,0.25)]">
                  <span className="font-display text-3xl font-black text-amber-600 drop-shadow-[0_0_8px_hsl(30,80%,50%,0.6)]">3</span>
                </div>
              </div>
            </div>

            {/* Podium base plate */}
            <div className="neon-sweep-line mb-2" />

          </>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ clanTag }: { clanTag: string }) {
  return (
    <footer className="border-t border-border bg-background py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-gradient">CeepzRoyale ArenaHub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Official clan hub for CeepzRoyale · Clash Royale · Clan tag: {clanTag}
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                ['#stats',       'Clan Stats'],
                ['#roster',      'Roster'],
                ['#war',         'War Performance'],
                ['#top5',        'Top 5'],
                ['#coaching',    'Coaching'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="hover:text-foreground transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-3 uppercase tracking-wider">Internal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/players" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Players
                </Link>
              </li>
              <li>
                <Link to="/war-readiness" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> War Readiness
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CeepzRoyale ArenaHub. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" /> Live data refreshes every 60 s via Clash Royale API
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────

const Index = () => {
  const { data: clan,    isLoading: clanLoading,    error: clanError    } = useClan();
  const { data: membersData, isLoading: membersLoading, error: membersError } = useClanMembers();
  const { data: currentRace, isLoading: raceLoading,  error: raceError  } = useCurrentRiverRace();
  const { data: raceLog,     isLoading: logLoading                       } = useRiverRaceLog();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track last successful update
  useEffect(() => {
    if (clan || membersData) setLastUpdated(new Date());
  }, [clan, membersData]);

  // Use memberList from clan or items from members endpoint — whichever is available
  const members: CRClanMember[] =
    membersData?.items ?? clan?.memberList ?? [];

  const CLAN_TAG_DISPLAY = '#QUP9LUYJ';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar memberCount={clan?.members} />

      <HeroSection
        clanName={clan?.name}
        clanDesc={clan?.description}
        memberCount={clan?.members}
        warTrophies={clan?.clanWarTrophies}
        clanScore={clan?.clanScore}
        isLoading={clanLoading}
      />

      <LiveStatsSection
        memberCount={clan?.members}
        clanScore={clan?.clanScore}
        warTrophies={clan?.clanWarTrophies}
        requiredTrophies={clan?.requiredTrophies}
        donationsPerWeek={clan?.donationsPerWeek}
        isLoading={clanLoading}
        error={clanError}
        lastUpdated={lastUpdated}
      />

      <Top5Section
        members={members}
        isLoading={clanLoading || membersLoading}
      />

      <RosterSection
        members={members}
        isLoading={clanLoading || membersLoading}
        error={membersError ?? clanError}
      />

      <WarSection
        currentRace={currentRace}
        raceLog={raceLog}
        isLoadingCurrent={raceLoading}
        isLoadingLog={logLoading}
        errorCurrent={raceError}
      />

      <CoachingSection />

      <Footer clanTag={CLAN_TAG_DISPLAY} />

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <a
          href="#coaching"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 font-display font-bold text-white text-sm shadow-[0_0_20px_hsl(217,91%,60%,0.5)] hover:shadow-[0_0_30px_hsl(217,91%,60%,0.7)] transition-all"
        >
          <Crown className="h-4 w-4" /> Join Clan
        </a>
      </div>
    </div>
  );
};

export default Index;
