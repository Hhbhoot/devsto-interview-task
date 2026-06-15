import React from 'react';
import { AIReportDashboard } from '../../components/AIReportDashboard';

export function ManagerReports() {
  return (
    <AIReportDashboard
      endpoint="/manager/reports"
      title="Team AI Attendance Report"
      description="Generate an AI summary of your team's attendance patterns, identifying trends and anomalies."
    />
  );
}
