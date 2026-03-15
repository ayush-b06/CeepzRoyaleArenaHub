import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrophyProgressChartProps {
  data: Array<{
    date: string;
    trophies: number;
  }>;
}

export function TrophyProgressChart({ data }: TrophyProgressChartProps) {
  return (
    <div className="stat-card">
      <h3 className="font-display font-bold text-lg mb-4">Trophy Progression</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trophyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(240, 15%, 20%)" 
              vertical={false} 
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12, fontFamily: 'Rajdhani' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12, fontFamily: 'Rajdhani' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 20%, 9%)',
                border: '1px solid hsl(240, 15%, 20%)',
                borderRadius: '8px',
                fontFamily: 'Rajdhani',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)', fontFamily: 'Orbitron' }}
              formatter={(value: number) => [value.toLocaleString(), 'Trophies']}
            />
            <Area
              type="monotone"
              dataKey="trophies"
              stroke="hsl(45, 93%, 58%)"
              strokeWidth={2}
              fill="url(#trophyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
