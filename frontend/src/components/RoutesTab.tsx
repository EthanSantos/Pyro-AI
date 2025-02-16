// src/components/panels/tabs/routes-tab.tsx
import React from 'react';
import { Card } from "@/components/ui/card";
import UnifiedTabContent from './UnifiedTabContent';

const RoutesTab = () => (
  <UnifiedTabContent header={<h2 className="text-lg font-semibold">Routes</h2>}>
    <Card className="p-4">
      <h3 className="font-medium mb-2">Evacuation Routes</h3>
      <p className="text-sm text-muted-foreground">No active evacuation routes.</p>
    </Card>
    <div className="flex-1" />
  </UnifiedTabContent>
);

export default React.memo(RoutesTab);