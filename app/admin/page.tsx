import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  CreditCard,
  TestTube2,
  FileText,
  Shield,
  DollarSign,
  UserPlus,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Overview | PRISMA',
  description: 'Admin dashboard overview for PRISMA portfolio builder',
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    redirect('/auth/signin');
  }
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  // Get quick stats
  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: totalPortfolios },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']),
    supabase.from('portfolios').select('*', { count: 'exact', head: true }),
  ]);

  const quickActions = [
    {
      title: 'Revenue Analytics',
      description: 'View detailed revenue metrics and trends',
      icon: TrendingUp,
      href: '/admin/revenue',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Subscriptions',
      description: 'Monitor and manage subscriptions',
      icon: CreditCard,
      href: '/admin/subscriptions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Experiments',
      description: 'A/B testing and experiments',
      icon: TestTube2,
      href: '/admin/experiments',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the PRISMA admin dashboard. Monitor and manage your
          platform.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolios
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPortfolios || 0}</div>
            <p className="text-xs text-muted-foreground">Created portfolios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Health
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map(action => (
            <Card
              key={action.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={action.href}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Activity tracking coming soon</p>
              <p className="text-sm mt-2">
                View recent user actions, system events, and security logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Database Management</CardTitle>
              <CardDescription>Manage database and backups</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Templates</CardTitle>
              <CardDescription>Customize system emails</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Flags</CardTitle>
              <CardDescription>Toggle platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
