import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Users, Shield, Swords, Database } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">
          Admin Settings
        </h1>
        <p className="text-muted-foreground">
          Manage players, sync data, and configure the platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Users, title: 'Manage Players', desc: 'Add, edit, or remove players from the roster' },
          { icon: Database, title: 'Sync API Data', desc: 'Pull latest stats from Clash Royale API' },
          { icon: Shield, title: 'War Seasons', desc: 'Create and manage clan war seasons' },
          { icon: Swords, title: 'Tournaments', desc: 'Create brackets and manage tournaments' },
          { icon: Settings, title: 'User Roles', desc: 'Assign admin privileges to users' },
        ].map((item) => (
          <div key={item.title} className="stat-card cursor-pointer hover:border-accent">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
