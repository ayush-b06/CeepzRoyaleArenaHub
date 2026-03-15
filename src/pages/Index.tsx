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
    { href: '#roster',      label: 'Roster'    },
    { href: '#war',         label: 'War'       },
    { href: '#leaderboard', label: 'Leaders'   },
    { href: '#top5',        label: 'Top 5 🏆'  },
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 arena-grid" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

      {/* Orb glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

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
      <div className="mx-auto max-w-7xl">
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
          {stats.map(({ icon: Icon, label, value, format, color }) => (
            <div key={label} className="stat-card flex flex-col items-center text-center gap-2 py-6">
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
      <div className="mx-auto max-w-7xl">
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

        {/* Table */}
        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">#</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="flex items-center gap-1" onClick={() => handleSort('name')}>
                      Player <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="inline-flex items-center gap-1 ml-auto" onClick={() => handleSort('trophies')}>
                      <SortIcon col="trophies" /> Trophies
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Best</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="inline-flex items-center gap-1 ml-auto" onClick={() => handleSort('donations')}>
                      <SortIcon col="donations" /> Donated
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Last Online</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Arena</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="py-3 px-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sorted.map((m, idx) => (
                      <tr
                        key={m.tag}
                        className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                      >
                        {/* Rank */}
                        <td className="py-3 px-4">
                          <span
                            className={`font-display font-bold text-xs ${
                              idx === 0 ? 'text-amber-400' :
                              idx === 1 ? 'text-slate-400' :
                              idx === 2 ? 'text-amber-700' :
                              'text-muted-foreground'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="font-medium">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground">{m.tag}</div>
                        </td>
                        {/* Role */}
                        <td className="py-3 px-4 text-center">
                          <RoleBadge role={m.role} />
                        </td>
                        {/* Trophies */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-display font-bold trophy-shimmer">
                            {m.trophies?.toLocaleString() ?? '—'}
                          </span>
                        </td>
                        {/* Best */}
                        <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">
                          {m.bestTrophies?.toLocaleString() ?? '—'}
                        </td>
                        {/* Donations */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-display font-bold text-green-400">
                            {m.donations?.toLocaleString() ?? '—'}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            recv {m.donationsReceived?.toLocaleString() ?? '—'}
                          </span>
                        </td>
                        {/* Last online */}
                        <td className="py-3 px-4 text-center text-muted-foreground text-xs hidden md:table-cell">
                          {formatLastSeen(m.lastSeen)}
                        </td>
                        {/* Arena */}
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground hidden lg:table-cell">
                          {m.arena?.name ?? '—'}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && sorted.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                No members match your filters.
              </div>
            )}
          </div>
        </div>
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
      <div className="mx-auto max-w-7xl">
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
                {[...currentRace.clans]
                  .sort((a, b) => b.fame - a.fame)
                  .map((clan, idx) => {
                    const isUs = clan.tag === ourTag;
                    return (
                      <div
                        key={clan.tag}
                        className={`flex items-center gap-3 rounded-lg p-3 ${
                          isUs
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/30'
                        }`}
                      >
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
                    );
                  })}
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
    name: 'Starter',
    price: '$29',
    period: '/session',
    badge: '',
    highlight: false,
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    features: [
      '1-hour coaching session',
      'Deck building review',
      'Battle replay analysis',
      'Basic strategy tips',
      'Post-session recap',
    ],
    cta: 'Book Starter',
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/3 sessions',
    badge: 'Most Popular',
    highlight: true,
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/40',
    features: [
      '3 × 1-hour sessions',
      'Full deck portfolio review',
      'War strategy coaching',
      'Meta analysis & counters',
      'Private Discord access',
      'Between-session Q&A',
    ],
    cta: 'Book Pro',
  },
  {
    name: 'Elite',
    price: '$149',
    period: '/month',
    badge: 'Best Value',
    highlight: false,
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    features: [
      'Weekly coaching (4 sessions)',
      'Unlimited deck feedback',
      'Custom war game plan',
      'Tournament prep',
      'Priority Discord support',
      'Monthly progress report',
    ],
    cta: 'Book Elite',
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
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          icon={Star}
          title="Coaching Services"
          sub="Level up your gameplay with personalized 1-on-1 coaching from CeepzRoyale's top players"
        />

        {/* Packages */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {COACHING_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.name}
                className={`relative stat-card flex flex-col ${
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
        <div id="book" className="mx-auto max-w-2xl">
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
                  <label className="block text-sm font-medium mb-1.5">Package</label>
                  <select className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="starter">Starter — $29 / session</option>
                    <option value="pro">Pro — $79 / 3 sessions</option>
                    <option value="elite">Elite — $149 / month</option>
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
        </div>
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

  const top5 = [...(members ?? [])].sort((a, b) => (b.trophies ?? 0) - (a.trophies ?? 0)).slice(0, 5);

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
      className={`py-20 px-4 transition-all duration-500 ${
        isPlaying
          ? 'bg-gradient-to-b from-amber-500/5 via-background to-background'
          : ''
      }`}
    >
      <div className="mx-auto max-w-3xl">

        {/* Heading */}
        <div className="mb-8 text-center relative">
          <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4 transition-all duration-300 ${
            isPlaying
              ? 'bg-amber-500/20 border border-amber-500/40 shadow-[0_0_24px_hsl(45,93%,58%,0.4)]'
              : 'bg-primary/15 border border-primary/25'
          }`}>
            <Crown className={`h-7 w-7 transition-colors ${isPlaying ? 'text-amber-400' : 'text-primary'}`} />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
            Top 5 · Hall of Fame
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

        {/* Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {top5.map((m, i) => (
              <div
                key={m.tag}
                className={`relative flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300 ${
                  isPlaying
                    ? 'border border-amber-500/20 bg-card shadow-[0_0_16px_hsl(45,93%,58%,0.08)]'
                    : 'border border-border bg-card'
                } ${i === 0 && isPlaying ? 'ring-1 ring-amber-400/30' : ''}`}
              >
                {/* Rank */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display font-black text-sm ${TOP5_RANK_STYLE[i]}`}>
                  {MEDAL[i]}
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold truncate">{m.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RoleBadge role={m.role} />
                    <span className="text-[11px] text-muted-foreground">{m.tag}</span>
                  </div>
                </div>

                {/* Trophies */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 trophy-shimmer justify-end">
                    <Trophy className="h-4 w-4" />
                    <span className="font-display font-bold text-lg">
                      {m.trophies?.toLocaleString() ?? '—'}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Best: {m.bestTrophies?.toLocaleString() ?? '—'}
                  </div>
                </div>
              </div>
            ))}

            {top5.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No member data available yet.
              </div>
            )}
          </div>
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
                ['#leaderboard', 'Leaderboard'],
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

      <LeaderboardSection
        members={members}
        isLoading={clanLoading || membersLoading}
      />

      <Top5Section
        members={members}
        isLoading={clanLoading || membersLoading}
      />

      <CoachingSection />

      <Footer clanTag={CLAN_TAG_DISPLAY} />
    </div>
  );
};

export default Index;
