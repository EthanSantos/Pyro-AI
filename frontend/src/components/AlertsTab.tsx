// src/components/panels/tabs/alerts-tab.tsx
import React from 'react';
import { Card } from "@/components/ui/card";
import UnifiedTabContent from './UnifiedTabContent';

type Alert = {
  id: number;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium";
  timestamp: string;
};

const AlertsTab = () => {
  const alerts: Alert[] = [
    {
      id: 1,
      title: "Wildfire Alert",
      description:
        "A wildfire is rapidly approaching your area. Please prepare for possible evacuation and follow local guidelines.",
      severity: "Critical",
      timestamp: "1/24/2025, 11:00 AM",
    },
    {
      id: 2,
      title: "Air Quality Warning",
      description:
        "Smoke from nearby wildfires is affecting air quality. Limit outdoor activities and consider using masks.",
      severity: "High",
      timestamp: "1/24/2025, 10:45 AM",
    },
    {
      id: 3,
      title: "Evacuation Advisory",
      description:
        "Local authorities advise evacuation in certain areas as a precautionary measure. Stay tuned for updates.",
      severity: "Medium",
      timestamp: "1/24/2025, 10:30 AM",
    },
  ];

  // Define color classes based on alert severity.
  const severityColors: Record<Alert["severity"], string> = {
    Critical: "border-red-500 text-red-600",
    High: "border-orange-500 text-orange-600",
    Medium: "border-yellow-500 text-yellow-600",
  };

  return (
    <UnifiedTabContent header={<h2 className="text-xl font-bold text-gray-800">ALERTS</h2>}>
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`p-4 mb-3 border-l-4 ${severityColors[alert.severity]} shadow-sm rounded-md`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
            <span className={`text-xs font-bold uppercase ${severityColors[alert.severity]}`}>
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
        </Card>
      ))}
      <div className="flex-1" />
    </UnifiedTabContent>
  );
};

export default React.memo(AlertsTab);
