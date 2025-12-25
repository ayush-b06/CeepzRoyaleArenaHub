import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WinRateChartProps {
  wins: number;
  losses: number;
  draws?: number;
}

export function WinRateChart({ wins, losses, draws = 0 }: WinRateChartProps) {
  const data = [
    { name: 'Wins', value: wins, color: 'hsl(142, 76%, 45%)' },
    { name: 'Losses', value: losses, color: 'hsl(0, 84%, 60%)' },
    ...(draws > 0 ? [{ name: 'Draws', value: draws, color: 'hsl(215, 20%, 65%)' }] : []),
  ];

  const total = wins + losses + draws;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="stat-card">
      <h3 className="font-display font-bold text-lg mb-4">Win Rate Analysis</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-40 w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(240, 20%, 9%)',
                  border: '1px solid hsl(240, 15%, 20%)',
                  borderRadius: '8px',
                  fontFamily: 'Rajdhani',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display font-bold text-2xl text-gradient">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-display font-bold">{entry.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Battles</span>
              <span className="font-display font-bold">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
