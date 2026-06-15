import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export function StaffProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data: any = {};
      if (name !== user?.name) data.name = name;
      if (password) data.password = password;

      if (Object.keys(data).length === 0) {
        setLoading(false);
        return;
      }

      await api.put('/auth/profile', data);
      setSuccess('Profile updated successfully');
      setPassword(''); // Clear password field
      
      // Update local storage name if needed, though user will need to re-login to see all changes or context must update
      // Since context is read from token, full name update requires re-login or context update logic
      // But for now, success message is enough
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
      <p className="text-slate-400 text-lg">Update your personal information</p>

      <GlassCard>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {success && <div className="text-green-400 mb-4">{success}</div>}
        
        <div className="mb-6 pb-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white mb-1">Account Details</h2>
          <p className="text-sm text-slate-400">Your email address and role cannot be changed.</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="font-medium text-slate-200">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">System Role</p>
              <p className="font-medium text-slate-200">{user?.role}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input 
            label="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
          <Input 
            label="New Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Leave blank to keep current password"
          />
          <div className="pt-4">
            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
