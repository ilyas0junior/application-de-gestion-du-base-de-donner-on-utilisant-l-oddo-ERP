import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Wifi, DollarSign, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSubscriptions: 0,
    monthlyRevenue: 0,
    openTickets: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientsRes, subsRes, invoicesRes, ticketsRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' }),
        supabase.from('invoices').select('amount').eq('status', 'Payée'),
        supabase.from('support_tickets').select('id', { count: 'exact' }).in('status', ['Nouveau', 'En cours']),
      ]);

      const revenue = invoicesRes.data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      setStats({
        totalClients: clientsRes.count || 0,
        totalSubscriptions: subsRes.count || 0,
        monthlyRevenue: revenue,
        openTickets: ticketsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const revenueData = [
    { month: "Jan", revenue: 45000 },
    { month: "Fév", revenue: 52000 },
    { month: "Mar", revenue: 49000 },
    { month: "Avr", revenue: 58000 },
    { month: "Mai", revenue: 62000 },
    { month: "Juin", revenue: 67000 },
  ];

  const subscriptionData = [
    { type: "Fibre", count: 180 },
    { type: "4G/5G", count: 150 },
    { type: "ADSL", count: 90 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Clients Actifs" value={stats.totalClients.toString()} icon={Users} trend="+12%" trendLabel="ce mois" />
        <StatCard title="Abonnements" value={stats.totalSubscriptions.toString()} icon={Wifi} trend="+8%" trendLabel="ce mois" />
        <StatCard title="Revenu Mensuel" value={`${stats.monthlyRevenue.toLocaleString()} MAD`} icon={DollarSign} trend="+15%" trendLabel="vs mois dernier" />
        <StatCard title="Tickets Ouverts" value={stats.openTickets.toString()} icon={AlertCircle} trend="-5%" trendLabel="vs semaine dernière" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Revenu (MAD)</CardTitle>
            <CardDescription>Revenus mensuels des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des Abonnements</CardTitle>
            <CardDescription>Par type de connexion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;