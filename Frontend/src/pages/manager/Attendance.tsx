import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../lib/socket';

export function ManagerAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/manager/team-attendance').then(res => setAttendance(res.data.attendance));

    socket.on('attendanceUpdate', (newRecord) => {
      // Only process if the record belongs to a team member
      if (newRecord.user?.managerId === user?.id) {
        setAttendance((prev) => {
          const exists = prev.find((r) => r.id === newRecord.id);
          if (exists) {
            return prev.map((r) => r.id === newRecord.id ? newRecord : r);
          }
          return [newRecord, ...prev];
        });
      }
    });

    return () => {
      socket.off('attendanceUpdate');
    };
  }, [user]);

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
      <h1 className="text-3xl font-bold text-white mb-2">Team Attendance</h1>
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-white/5 rounded-t-xl">
              <tr>
                <th className="px-4 py-4 rounded-tl-xl">Date</th>
                <th className="px-4 py-4">Staff Name</th>
                <th className="px-4 py-4">Check In</th>
                <th className="px-4 py-4 rounded-tr-xl">Check Out</th>
              </tr>
            </thead>
            <motion.tbody variants={container} initial="hidden" animate="show">
              {attendance.map((record) => (
                <motion.tr variants={item} key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 font-medium text-white">{record.user?.name}</td>
                  <td className="px-4 py-4">{new Date(record.checkIn).toLocaleTimeString()}</td>
                  <td className="px-4 py-4">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : <span className="text-yellow-400/80">Active</span>}</td>
                </motion.tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No attendance records found for your team.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
