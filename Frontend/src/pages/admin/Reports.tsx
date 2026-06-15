import React from 'react';
import { AIReportDashboard } from '../../components/AIReportDashboard';

export function AdminReports() {
  return (
    <AIReportDashboard
      endpoint="/admin/reports"
      title="System-Wide AI Attendance Report"
      description="Generate an AI summary of all employee attendance patterns, identifying trends and anomalies."
    />
  );
}
