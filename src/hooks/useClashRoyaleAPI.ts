/**
 * useClashRoyaleAPI.ts
 * Hooks for fetching live data from the Clash Royale v1 API.
 *
 * Config (set in .env):
 *   VITE_CR_API_KEY   — your Clash Royale developer key
 *   VITE_CR_API_BASE  — base URL; defaults to /api/cr (Vite proxy in dev)
 *   VITE_CR_CLAN_TAG  — URL-encoded clan tag; defaults to %23QUP9LUYJ (#QUP9LUYJ)
 */

import { useQuery } from '@tanstack/react-query';

// ─── Configuration ────────────────────────────────────────────────────────────
const CR_API_BASE = import.meta.env.VITE_CR_API_BASE ?? '/api/cr';
const CR_API_KEY  = ''; // key is server-side only (CR_API_KEY in Vercel env, not exposed to browser)
const CLAN_TAG    = import.meta.env.VITE_CR_CLAN_TAG ?? '%23QUP9LUYJ';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CRArena {
  id: number;
  name: string;
}

export interface CRClanMember {
  tag: string;
  name: string;
  role: 'member' | 'elder' | 'coLeader' | 'leader';
  lastSeen: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  donations: number;
  donationsReceived: number;
  clanRank: number;
  previousClanRank: number;
  arena: CRArena;
}

export interface CRClan {
  tag: string;
  name: string;
  type: string;
  description: string;
  badgeId: number;
  clanScore: number;
  clanWarTrophies: number;
  location?: { id: number; name: string; isCountry: boolean; countryCode?: string };
  requiredTrophies: number;
  donationsPerWeek: number;
  members: number;
  memberList: CRClanMember[];
}

export interface CRRaceParticipant {
  tag: string;
  name: string;
  fame: number;
  repairPoints: number;
  boatAttacks: number;
  decksUsed: number;
  decksUsedToday: number;
}

export interface CRRaceClan {
  tag: string;
  name: string;
  badgeId: number;
  fame: number;
  repairPoints: number;
  finishTime?: string;
  participants: CRRaceParticipant[];
}

export interface CRCurrentRiverRace {
  state: string;
  clan: CRRaceClan;
  clans: CRRaceClan[];
  sectionIndex: number;
  periodType: string;
  periodIndex: number;
}

export interface CRRaceLogEntry {
  seasonId: number;
  sectionIndex: number;
  createdDate: string;
  standings: Array<{
    rank: number;
    trophyChange: number;
    clan: CRRaceClan;
  }>;
}

export interface CRRaceLog {
  items: CRRaceLogEntry[];
}

export interface CRPoLSeasonResult {
  leagueNumber: number; // 0=Challenger I … 8=Ultimate Champion
  trophies: number;     // PoL rating/medals within the league
  rank?: number;        // global rank — only present for Ultimate Champion
}

export interface CRPlayerProfile {
  tag: string;
  name: string;
  bestPathOfLegendSeasonResult?: CRPoLSeasonResult;
  lastPathOfLegendSeasonResult?: CRPoLSeasonResult;
  currentPathOfLegendSeasonResult?: CRPoLSeasonResult;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function crFetch<T>(path: string): Promise<T> {
  const url = `${CR_API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CR_API_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`CR API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Full clan info including memberList. Auto-refreshes every 60 s. */
export function useClan() {
  return useQuery<CRClan, Error>({
    queryKey: ['cr-clan', CLAN_TAG],
    queryFn: () => crFetch<CRClan>(`/clans/${CLAN_TAG}`),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}

/** Paginated member list (up to 50). Auto-refreshes every 60 s. */
export function useClanMembers() {
  return useQuery<{ items: CRClanMember[] }, Error>({
    queryKey: ['cr-members', CLAN_TAG],
    queryFn: () => crFetch<{ items: CRClanMember[] }>(`/clans/${CLAN_TAG}/members`),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}

/** Current River Race (war). Auto-refreshes every 60 s. */
export function useCurrentRiverRace() {
  return useQuery<CRCurrentRiverRace, Error>({
    queryKey: ['cr-current-riverrace', CLAN_TAG],
    queryFn: () => crFetch<CRCurrentRiverRace>(`/clans/${CLAN_TAG}/currentriverrace`),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}

/**
 * Fetches individual player profiles for a list of tags in parallel.
 * Used to retrieve Path of Legend season results per member.
 * Refreshes every 5 min — PoL data changes slowly.
 */
export function useClanMembersPoL(memberTags: string[]) {
  return useQuery<CRPlayerProfile[], Error>({
    queryKey: ['cr-members-pol', memberTags.join(',')],
    queryFn: async () => {
      const results = await Promise.allSettled(
        memberTags.map((tag) =>
          crFetch<CRPlayerProfile>(`/players/${encodeURIComponent(tag)}`)
        )
      );
      return results
        .filter((r): r is PromiseFulfilledResult<CRPlayerProfile> => r.status === 'fulfilled')
        .map((r) => r.value);
    },
    enabled: memberTags.length > 0,
    staleTime: 300_000,
    refetchInterval: 300_000,
    retry: 1,
  });
}

/** River Race log — last 10 seasons. */
export function useRiverRaceLog() {
  return useQuery<CRRaceLog, Error>({
    queryKey: ['cr-riverrace-log', CLAN_TAG],
    queryFn: () => crFetch<CRRaceLog>(`/clans/${CLAN_TAG}/riverracelog`),
    refetchInterval: 300_000, // refresh every 5 min — historical data changes slowly
    staleTime: 120_000,
    retry: 2,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a CR "lastSeen" timestamp (YYYYMMDDTHHmmss.000Z) to a human string. */
export function formatLastSeen(lastSeen: string): string {
  try {
    // CR format: "20240101T120000.000Z"
    const iso = lastSeen.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*$/,
      '$1-$2-$3T$4:$5:$6Z'
    );
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return lastSeen;
  }
}

/** Map a role string to a display label. */
export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    leader: 'Leader',
    coLeader: 'Co-Leader',
    elder: 'Elder',
    member: 'Member',
  };
  return map[role] ?? role;
}
