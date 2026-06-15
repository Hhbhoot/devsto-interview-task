import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../api';

export function StaffLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/me');
      setLeaves(res.data.leaveRequests);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/leaves', {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason
      });
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      
      await fetchLeaves();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (status === 'REJECTED') return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Leave Management</h1>
        <p className="text-slate-400">Apply for leaves and track your requests</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Application Form */}
        <div className="lg:col-span-1">
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Apply for Leave</h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-sm font-medium text-slate-300">Reason</label>
                <textarea
                  className="glass-input rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:border-primary-500 min-h-[100px]"
                  placeholder="Why do you need this leave?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" isLoading={submitting}>
                Submit Request
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Leave History */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <h2 className="text-lg font-semibold text-white mb-4">My Leave History</h2>
            {loading ? (
              <div className="text-slate-400">Loading records...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-white/5">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Period</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-lg">Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-4 whitespace-nowrap">
                          {new Date(leave.startDate).toLocaleDateString()} - <br/>
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 max-w-[200px] truncate" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {leaves.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                          No leave requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
