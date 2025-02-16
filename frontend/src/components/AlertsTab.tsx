// src/components/panels/tabs/alerts-tab.tsx
import React from 'react';
import { Card } from "@/components/ui/card";
import UnifiedTabContent from './UnifiedTabContent';

const AlertsTab = () => (
  <UnifiedTabContent header={<h2 className="text-lg font-semibold">Alerts</h2>}>
    <Card className="p-4">
      <h3 className="font-medium mb-2">Current Alerts</h3>
      <p className="text-sm text-muted-foreground">No active alerts in your area.</p>
    </Card>
    <div className="flex-1" />
  </UnifiedTabContent>
);

export default React.memo(AlertsTab);