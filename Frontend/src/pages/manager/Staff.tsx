import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../api';

export function ManagerStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchStaff = async () => {
    const res = await api.get('/manager/staff');
    setStaff(res.data.staff);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/manager/staff', { name, email, password });
    setName('');
    setEmail('');
    setPassword('');
    fetchStaff();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Team</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Add Staff Member</h2>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Create Staff</Button>
          </form>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Team Roster</h2>
          <div className="space-y-4">
            {staff.map(user => (
              <div key={user.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-sm text-slate-400">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
