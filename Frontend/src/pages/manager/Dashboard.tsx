import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import api from '../../api';
import { Users, UserCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../lib/socket';

export function ManagerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const { user } = useAuth();

  const fetchStats = () => {
    api.get('/manager/attendance/stats').then(res => setStats(res.data.stats));
  };

  useEffect(() => {
    fetchStats();

    socket.on('attendanceUpdate', (newRecord) => {
      // Re-fetch stats if a team member checks in or out
      if (newRecord.user?.managerId === user?.id) {
        fetchStats();
      }
    });

    return () => {
      socket.off('attendanceUpdate');
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">Manager Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-xl text-primary-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Team Members</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalTeamMembers}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Checked In Today</p>
              <h3 className="text-2xl font-bold text-white">{stats.checkedInToday}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Currently Online</p>
              <h3 className="text-2xl font-bold text-white">{stats.currentlyOnline}</h3>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
