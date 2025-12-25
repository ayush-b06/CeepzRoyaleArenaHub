import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlayerCard } from '@/components/players/PlayerCard';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Players() {
  const { data: players, isLoading } = usePlayerStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('trophies');

  // Filter and sort players
  const filteredPlayers = players
    ?.filter((player) => {
      const matchesSearch = 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.player_tag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || player.clan_role === roleFilter;
      return matchesSearch && matchesRole;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'trophies':
          return (b.trophies ?? 0) - (a.trophies ?? 0);
        case 'wins':
          return (b.wins ?? 0) - (a.wins ?? 0);
        case 'level':
          return (b.level ?? 0) - (a.level ?? 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    }) ?? [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gradient mb-2">
          Players
        </h1>
        <p className="text-muted-foreground">
          View and analyze individual player performance and stats.
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or player tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40 bg-muted border-border">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="coLeader">Co-Leader</SelectItem>
              <SelectItem value="elder">Elder</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40 bg-muted border-border">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trophies">Trophies</SelectItem>
              <SelectItem value="wins">Wins</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{filteredPlayers.length} players</span>
      </div>

      {/* Players Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="space-y-3">
          {filteredPlayers.map((player, index) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              rank={sortBy === 'trophies' ? index + 1 : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="stat-card text-center py-16">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-bold text-xl mb-2">No Players Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Add players through the Admin panel to get started.'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
