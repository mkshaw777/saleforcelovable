import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../services/auth.service';
import { Users, DollarSign, LogOut, Eye } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface ManagerDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function ManagerDashboard({ user, onLogout }: ManagerDashboardProps) {
  const [teamStats, setTeamStats] = useState({
    totalStaff: 0,
    totalPOB: 0,
    totalCollection: 0,
    activeToday: 0,
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const { data: staff } = await supabase
        .from('users')
        .select('*')
        .eq('manager_id', user.id)
        .eq('role', 'STAFF');

      const today = new Date().toISOString().split('T')[0];

      const staffIds = staff?.map((s: any) => s.id) || [];

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('user_id')
        .in('user_id', staffIds)
        .gte('start_time', `${today}T00:00:00`)
        .eq('status', 'active');

      const { data: visitsData } = await supabase
        .from('visits')
        .select(`
          *,
          pob(total_price),
          collections(amount),
          users(name)
        `)
        .in('user_id', staffIds)
        .gte('check_in_time', `${today}T00:00:00`);

      const totalPOB = visitsData?.reduce((sum: number, v: any) => {
        const pobTotal = v.pob?.reduce((s: number, p: any) => s + (p.total_price || 0), 0) || 0;
        return sum + pobTotal;
      }, 0) || 0;

      const totalCollection = visitsData?.reduce((sum: number, v: any) => {
        const collectionTotal = v.collections?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0;
        return sum + collectionTotal;
      }, 0) || 0;

      const teamData = staff?.map((member: any) => {
        const memberVisits = visitsData?.filter((v: any) => v.user_id === member.id) || [];
        const memberPOB = memberVisits.reduce((sum: number, v: any) => {
          const pobTotal = v.pob?.reduce((s: number, p: any) => s + (p.total_price || 0), 0) || 0;
          return sum + pobTotal;
        }, 0);

        const isActive = attendanceData?.some((a: any) => a.user_id === member.id) || false;

        return {
          ...member,
          visits: memberVisits.length,
          pob: memberPOB,
          active: isActive,
        };
      }) || [];

      setTeamStats({
        totalStaff: staff?.length || 0,
        totalPOB,
        totalCollection,
        activeToday: attendanceData?.length || 0,
      });

      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Manager Dashboard</p>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Overview</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{teamStats.totalStaff}</p>
            <p className="text-xs text-gray-500 mt-1">Total Team Members</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{teamStats.activeToday}</p>
            <p className="text-xs text-gray-500 mt-1">Active Today</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(teamStats.totalPOB)}</p>
            <p className="text-xs text-gray-500 mt-1">Team POB Today</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(teamStats.totalCollection)}</p>
            <p className="text-xs text-gray-500 mt-1">Collection Today</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : teamMembers.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No team members assigned yet</p>
            </div>
          ) : (
            teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{member.name}</h4>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      member.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {member.active ? 'Active' : 'Offline'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Visits Today</p>
                    <p className="font-semibold text-gray-800">{member.visits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">POB Today</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(member.pob)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
