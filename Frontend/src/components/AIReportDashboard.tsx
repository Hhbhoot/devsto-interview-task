import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Sparkles, FileText, AlertCircle } from 'lucide-react';
import api from '../api';

interface AIReportDashboardProps {
  endpoint: string;
  title: string;
  description: string;
}

export function AIReportDashboard({ endpoint, title, description }: AIReportDashboardProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      setReport(res.data.report);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-slate-400">{description}</p>
        </div>
        <Button onClick={generateReport} isLoading={loading} className="px-6 flex items-center gap-2">
          {!loading && <Sparkles className="w-4 h-4" />}
          Generate New Report
        </Button>
      </div>

      <GlassCard className="min-h-[400px]">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400">
            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="animate-pulse">AI is analyzing attendance data...</p>
          </div>
        ) : report ? (
          <div className="prose prose-invert max-w-none">
            {/* Split by newline and render paragraphs, or render markdown if we added react-markdown. We'll just map lines for simplicity */}
            {report.split('\n').map((line, idx) => {
              if (line.startsWith('##')) return <h2 key={idx} className="text-xl font-bold text-white mt-6 mb-3">{line.replace(/##/g, '').trim()}</h2>;
              if (line.startsWith('#')) return <h1 key={idx} className="text-2xl font-bold text-white mt-8 mb-4">{line.replace(/#/g, '').trim()}</h1>;
              if (line.trim().startsWith('-') || line.trim().startsWith('*')) return <li key={idx} className="ml-4 text-slate-300">{line.replace(/^[-*]/, '').trim()}</li>;
              if (line.trim() === '') return <br key={idx} />;
              return <p key={idx} className="text-slate-300 mb-2">{line}</p>;
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText className="w-16 h-16 mb-4 opacity-30" />
            <p>No report generated yet.</p>
            <p className="text-sm">Click the button above to ask AI to analyze the attendance data.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
