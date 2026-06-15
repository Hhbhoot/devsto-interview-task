import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
      <p className="text-slate-400 mb-8">
        Manage application configurations and preferences.
      </p>

      <div className="grid gap-6">
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-4">
            General Preferences
          </h2>
          <div className="space-y-4 text-slate-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="font-medium text-white">Maintenance Mode</p>
                <p className="text-sm text-slate-400">
                  Temporarily disable access for staff
                </p>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-not-allowed opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-slate-400">
                  Send summary reports to admins
                </p>
              </div>
              <div className="w-12 h-6 bg-primary-500 rounded-full relative cursor-not-allowed opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
