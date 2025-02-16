// src/components/panels/tabs/unified-tab-content.tsx
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnifiedTabContentProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const UnifiedTabContent: React.FC<UnifiedTabContentProps> = React.memo(({ 
  header, 
  footer, 
  children 
}) => (
  <div className="flex flex-col h-full">
    {header && <div className="bg-background p-4 border-b">{header}</div>}
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 flex flex-col gap-4 min-h-full">{children}</div>
      </ScrollArea>
    </div>
    {footer && <div className="bg-background p-4 border-t">{footer}</div>}
  </div>
));

export default UnifiedTabContent;