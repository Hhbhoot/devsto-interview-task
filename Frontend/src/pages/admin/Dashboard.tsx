import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';
import api from '../../api';
import { Users, UserCheck, Clock, Activity, Calendar } from 'lucide-react';
import { socket } from '../../lib/socket';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  const fetchStats = () => {
    api.get('/admin/attendance/stats').then(res => setStats(res.data.stats));
  };

  useEffect(() => {
    fetchStats();

    socket.on('attendanceUpdate', () => {
      fetchStats();
    });

    return () => {
      socket.off('attendanceUpdate');
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-xl text-primary-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Employees</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalEmployees}</h3>
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

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Working Hours</p>
              <h3 className="text-2xl font-bold text-white">{stats.averageWorkingHours}h</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Overtime (Week)</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalOvertimeWeek}h</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Overtime (Month)</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalOvertimeMonth}h</h3>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
