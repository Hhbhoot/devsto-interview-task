import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import api from '../../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function StaffAttendanceHistory() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/me?page=${page}&limit=10`);
      setAttendance(res.data.attendance);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Attendance History
        </h1>
        <p className="text-slate-400 text-lg">
          View your past check-ins and hours
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium"
        >
          {error}
        </motion.div>
      )}

      <GlassCard>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-white/5 rounded-t-xl">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Date</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-tr-xl">Total Hours</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {attendance.map((record) => (
                    <motion.tr
                      variants={item}
                      key={record.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(record.checkIn).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30">
                          {record.checkOut ? 'PRESENT' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {record.workingHours != null
                          ? record.workingHours < 1
                            ? `${Math.round(record.workingHours * 60)}m`
                            : `${record.workingHours.toFixed(2)}h`
                          : '-'}
                      </td>
                    </motion.tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-sm text-slate-400">
                  Page <span className="font-medium text-white">{page}</span> of{' '}
                  <span className="font-medium text-white">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
