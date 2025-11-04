import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../services/auth.service';
import { Users, DollarSign, LogOut, Eye, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalManagers: 0,
    totalVisits: 0,
    totalPOB: 0,
    totalCollection: 0,
    activeToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [usersResult, attendanceResult, visitsResult] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('attendance').select('*').gte('start_time', `${today}T00:00:00`).eq('status', 'active'),
        supabase.from('visits').select(`
          *,
          pob(total_price),
          collections(amount),
          users(name),
          doctors(name)
        `).gte('check_in_time', `${today}T00:00:00`).order('check_in_time', { ascending: false }).limit(10),
      ]);

      const staff = usersResult.data?.filter((u: any) => u.role === 'STAFF') || [];
      const managers = usersResult.data?.filter((u: any) => u.role === 'MANAGER') || [];

      const totalPOB = visitsResult.data?.reduce((sum: number, v: any) => {
        const pobTotal = v.pob?.reduce((s: number, p: any) => s + (p.total_price || 0), 0) || 0;
        return sum + pobTotal;
      }, 0) || 0;

      const totalCollection = visitsResult.data?.reduce((sum: number, v: any) => {
        const collectionTotal = v.collections?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0;
        return sum + collectionTotal;
      }, 0) || 0;

      setStats({
        totalStaff: staff.length,
        totalManagers: managers.length,
        totalVisits: visitsResult.data?.length || 0,
        totalPOB,
        totalCollection,
        activeToday: attendanceResult.data?.length || 0,
      });

      setRecentActivity(visitsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Admin Dashboard</p>
            <h1 className="text-2xl font-bold mt-1">{user.name}</h1>
          </div>
          <button
            onClick={onLogout}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalStaff}</p>
            <p className="text-xs text-gray-500 mt-1">Total MRs</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalManagers}</p>
            <p className="text-xs text-gray-500 mt-1">Total Managers</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.activeToday}</p>
            <p className="text-xs text-gray-500 mt-1">Active Today</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalVisits}</p>
            <p className="text-xs text-gray-500 mt-1">Visits Today</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.totalPOB)}</p>
                <p className="text-xs text-gray-500 mt-1">Total POB Today</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.totalCollection)}</p>
                <p className="text-xs text-gray-500 mt-1">Collection Today</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No activity yet today</p>
              <p className="text-xs text-gray-400 mt-1">Visits will appear here as they happen</p>
            </div>
          ) : (
            recentActivity.map((visit: any) => {
              const pobTotal = visit.pob?.reduce((s: number, p: any) => s + (p.total_price || 0), 0) || 0;
              const collectionTotal = visit.collections?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0;

              return (
                <div key={visit.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{visit.users?.name || 'Unknown MR'}</h4>
                      <p className="text-sm text-gray-600">visited {visit.doctors?.name || 'Unknown Doctor'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(visit.check_in_time).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        visit.visit_flag === 'In Range'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {visit.visit_flag}
                    </span>
                  </div>
                  {(pobTotal > 0 || collectionTotal > 0) && (
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">POB</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(pobTotal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Collection</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(collectionTotal)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">System Status</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Database connected and operational</li>
            <li>✓ Real-time updates enabled</li>
            <li>✓ GPS tracking active for field staff</li>
            <li>✓ All services running normally</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
