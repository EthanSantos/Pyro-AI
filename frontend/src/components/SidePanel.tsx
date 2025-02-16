// src/components/panels/side-panel.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Bell, Route, MessageSquare } from "lucide-react";
import AlertsTab from './AlertsTab';
import RoutesTab from './RoutesTab'; 
import ChatTab from './ChatTab';

type TabConfig = {
  value: string;
  icon: React.ElementType;
  label: string;
  component: React.ReactNode;
};

const TAB_CONFIGS: TabConfig[] = [
  {
    value: 'alerts',
    icon: Bell,
    label: 'Alerts',
    component: <AlertsTab />,
  },
  {
    value: 'routes',
    icon: Route,
    label: 'Routes',
    component: <RoutesTab />,
  },
  {
    value: 'chat',
    icon: MessageSquare,
    label: 'Chat',
    component: <ChatTab />,
  },
];

export function SidePanel() {
  const [activeTab, setActiveTab] = React.useState<string>(TAB_CONFIGS[0].value);

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col h-full"
      >
        {/* TabsList stays fixed at the top */}
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-none">
            {TAB_CONFIGS.map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 rounded-none"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab content area with scroll */}
        <div className="flex-1 overflow-hidden">
          {TAB_CONFIGS.map(({ value, component }) => (
            <TabsContent key={value} value={value} className="h-full mt-0">
              {component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Card>
  );
}

export default React.memo(SidePanel);