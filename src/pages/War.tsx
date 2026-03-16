/**
 * War — standalone River Race / War Performance page.
 */

import { Link } from 'react-router-dom';
import {
  Crown,
  Swords,
  Flame,
  Award,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';

import {
  useCurrentRiverRace,
  useRiverRaceLog,
  type CRRaceParticipant,
} from '@/hooks/useClashRoyaleAPI';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className}`} />;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
      LIVE
    </span>
  );
}

// ─── War page ─────────────────────────────────────────────────────────────────

const ourTag = (import.meta.env.VITE_CR_CLAN_TAG ?? '%23QUP9LUYJ').replace('%23', '#');

export default function War() {
  const { data: currentRace, isLoading: raceLoading, error: raceError } = useCurrentRiverRace();
  const { data: raceLog, isLoading: logLoading } = useRiverRaceLog();

  const participants: CRRaceParticipant[] = currentRace?.clan?.participants ?? [];
  const sortedParticipants = [...participants].sort((a, b) => b.fame - a.fame);
  const recentRaces = (raceLog?.items ?? []).slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-gradient">CeepzRoyale</span>
          </div>
          <LiveBadge />
        </div>
      </header>

      <main className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 border border-primary/25 mb-4">
              <Swords className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">War Performance</h1>
            <p className="text-muted-foreground">Live River Race standings and recent season results</p>
          </div>

          {raceError && (
            <div className="mb-8">
              <ErrorBox message={`Could not load River Race: ${raceError.message}`} />
            </div>
          )}

          {/* Current Race + Race Log */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {/* Current River Race */}
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

              {raceLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : currentRace?.clans ? (
                <div className="space-y-2">
                  {(() => {
                    const sortedClans = [...currentRace.clans].sort((a, b) => b.fame - a.fame);
                    const maxFame = Math.max(...sortedClans.map((c) => c.fame), 1);
                    return sortedClans.map((clan, idx) => {
                      const isUs = clan.tag === ourTag;
                      return (
                        <div
                          key={clan.tag}
                          className={`rounded-lg p-3 ${isUs ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-display font-bold w-5 text-center ${idx === 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                              {idx + 1}
                            </span>
                            <span className={`flex-1 font-medium truncate ${isUs ? 'text-primary' : ''}`}>
                              {clan.name}
                              {isUs && <span className="ml-2 text-xs text-primary/70">(us)</span>}
                            </span>
                            <div className="text-right">
                              <div className="font-display font-bold text-accent text-sm">{clan.fame.toLocaleString()}</div>
                              <div className="text-[10px] text-muted-foreground">fame</div>
                            </div>
                            {clan.finishTime && <div className="h-2 w-2 rounded-full bg-green-400" title="Finished" />}
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

            {/* Recent Race Results */}
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Award className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-display font-bold text-lg">Recent Race Results</h3>
              </div>

              {logLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : recentRaces.length > 0 ? (
                <div className="space-y-2">
                  {recentRaces.map((race, i) => {
                    const ourStanding = race.standings.find((s) => s.clan.tag === ourTag);
                    const rank = ourStanding?.rank;
                    const fame = ourStanding?.clan.fame;
                    const trophyChange = ourStanding?.trophyChange;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg p-3 bg-muted/30">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-display font-bold text-sm ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                          rank === 2 ? 'bg-slate-500/20 text-slate-400' :
                          rank === 3 ? 'bg-amber-800/20 text-amber-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {rank ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">Season {race.seasonId} · Week {race.sectionIndex + 1}</div>
                          <div className="text-sm font-medium">{fame?.toLocaleString() ?? '—'} fame</div>
                        </div>
                        {trophyChange !== undefined && (
                          <div className={`font-display font-bold text-sm ${trophyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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

          {/* Individual War Contributions */}
          {(sortedParticipants.length > 0 || raceLoading) && (
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
                    {raceLoading
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <tr key={i} className="border-b border-border/40">
                            {Array.from({ length: 7 }).map((_, j) => (
                              <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                            ))}
                          </tr>
                        ))
                      : sortedParticipants.map((p, idx) => (
                          <tr key={p.tag} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
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
                              <span className="font-display font-bold text-accent">{p.fame.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">{p.decksUsed}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground hidden md:table-cell">{p.decksUsedToday}</td>
                            <td className="py-3 px-4 text-right text-primary hidden lg:table-cell">{p.boatAttacks}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground hidden md:table-cell">{p.repairPoints.toLocaleString()}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
