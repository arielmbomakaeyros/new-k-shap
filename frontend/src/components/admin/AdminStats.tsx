'use client';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

interface AdminStatsProps {
  stats: Stat[];
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              {stat.change && (
                <p
                  className={`mt-2 text-xs font-semibold ${
                    stat.change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change.isPositive ? '↑' : '↓'} {Math.abs(stat.change.value)}%
                </p>
              )}
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
