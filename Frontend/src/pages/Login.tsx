import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Users, Shield, Briefcase, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginWithCredentials = async (
    emailVal: string,
    passwordVal: string
  ) => {
    setLoading(true);
    setError('');
    setEmail(emailVal);
    setPassword(passwordVal);

    try {
      const response = await api.post('/auth/login', {
        email: emailVal,
        password: passwordVal,
      });
      const { token, user } = response.data;
      login(token, user);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithCredentials(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel mb-4">
            <Users className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400">Sign in to access your dashboard</p>
        </div>

        <GlassCard>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>
        </GlassCard>

        {/* Quick Demo Credentials Selection */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500 animate-bounce" />
            <span>Demo Accounts (Click to Quick Login)</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                role: 'Admin',
                email: 'admin@devsto.com',
                icon: Shield,
                hoverBorder: 'hover:border-red-500/30',
                iconColor: 'text-red-400',
              },
              {
                role: 'Manager',
                email: 'manager1@devsto.com',
                icon: Briefcase,
                hoverBorder: 'hover:border-amber-500/30',
                iconColor: 'text-amber-400',
              },
              {
                role: 'Staff',
                email: 'staff1@devsto.com',
                icon: User,
                hoverBorder: 'hover:border-blue-500/30',
                iconColor: 'text-blue-400',
              },
            ].map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.role}
                  onClick={() =>
                    loginWithCredentials(demo.email, 'password123')
                  }
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 transition-all duration-300 group cursor-pointer text-center ${demo.hoverBorder}`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity ${demo.iconColor}`}
                  />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {demo.role}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors mt-0.5 select-none truncate w-full text-center">
                    {demo.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
