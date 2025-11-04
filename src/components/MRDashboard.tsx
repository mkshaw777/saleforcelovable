import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { AuthUser } from '../services/auth.service';
import { DollarSign, Users, LogOut, Play, Square } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface MRDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function MRDashboard({ user, onLogout }: MRDashboardProps) {
  const [stats, setStats] = useState({
    visits: 0,
    pob: 0,
    collection: 0,
  });
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00`)
        .eq('status', 'active')
        .maybeSingle();

      setAttendance(attendanceData);

      const { data: visits } = await supabase
        .from('visits')
        .select(`
          *,
          pob(total_price),
          collections(amount)
        `)
        .eq('user_id', user.id)
        .gte('check_in_time', `${today}T00:00:00`);

      const totalVisits = visits?.length || 0;
      const totalPOB = visits?.reduce((sum: number, v: any) => {
        const pobTotal = v.pob?.reduce((s: number, p: any) => s + (p.total_price || 0), 0) || 0;
        return sum + pobTotal;
      }, 0) || 0;

      const totalCollection = visits?.reduce((sum: number, v: any) => {
        const collectionTotal = v.collections?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0;
        return sum + collectionTotal;
      }, 0) || 0;

      setStats({
        visits: totalVisits,
        pob: totalPOB,
        collection: totalCollection,
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
    }
  };

  const handleStartDay = async () => {
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { error } = await supabase.from('attendance').insert([{
            user_id: user.id,
            start_coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            status: 'active',
          }] as any);

          if (error) throw error;

          toast.success('Day started successfully!');
          loadData();
        },
        () => {
          toast.error('Failed to get location');
        }
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEndDay = async () => {
    if (!attendance) return;

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const updateData: any = {
            end_time: new Date().toISOString(),
            end_coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            status: 'completed',
          };

          const { error: updateError } = await (supabase
            .from('attendance') as any)
            .update(updateData)
            .eq('id', attendance.id);

          if (updateError) throw updateError;

          const response = await fetch(
            `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/calculate-verified-km`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ attendance_id: attendance.id }),
            }
          );

          if (!response.ok) {
            console.error('Failed to calculate KM');
          }

          toast.success('Day ended successfully!');
          loadData();
        },
        () => {
          toast.error('Failed to get location');
        }
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm opacity-90">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-1">{user.name}</h1>
          </div>
          <button
            onClick={onLogout}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {attendance ? (
          <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Day is Active</span>
              </div>
              <span className="text-xs">
                Started: {new Date(attendance.start_time).toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={handleEndDay}
              className="w-full mt-3 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-50"
            >
              <Square size={16} />
              End Day
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartDay}
            className="w-full bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50"
          >
            <Play size={20} />
            Start Day
          </button>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.visits}</p>
            <p className="text-xs text-gray-500 mt-1">Visits</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.pob)}</p>
            <p className="text-xs text-gray-500 mt-1">POB</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.collection)}</p>
            <p className="text-xs text-gray-500 mt-1">Collection</p>
          </div>
        </div>

        {!attendance && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 font-medium">Start your day to begin tracking</p>
            <p className="text-xs text-yellow-600 mt-1">
              Click "Start Day" to enable visit tracking and GPS logging
            </p>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Guide</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start your day before visiting doctors</li>
            <li>• GPS tracking runs automatically</li>
            <li>• End day to calculate verified kilometers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
