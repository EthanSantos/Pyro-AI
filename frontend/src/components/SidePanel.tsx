import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Route, MessageSquare, HelpCircle, Mic, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Types and Interfaces
interface TabConfig {
  value: string;
  icon: React.ElementType;
  label: string;
}

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface UnifiedTabContentProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Unified Tab Layout Component
const UnifiedTabContent: React.FC<UnifiedTabContentProps> = ({ header, footer, children }) => (
  <div className="flex flex-col h-full">
    {header && <div className="bg-background p-4 border-b">{header}</div>}
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 flex flex-col gap-4 min-h-full">{children}</div>
      </ScrollArea>
    </div>
    {footer && <div className="bg-background p-4 border-t">{footer}</div>}
  </div>
);

// Tab Configuration
const TAB_CONFIG: TabConfig[] = [
  { value: 'alerts', icon: Bell, label: 'Alerts' },
  { value: 'routes', icon: Route, label: 'Routes' },
  { value: 'chat', icon: MessageSquare, label: 'Chat' }
];

// Chat Message Component
const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => (
  <div
    className={`p-3 rounded-lg max-w-[80%] ${
      isUser ? 'bg-primary text-primary-foreground self-end' : 'bg-muted self-start'
    }`}
  >
    <p className="text-sm">{message}</p>
    {timestamp && (
      <span className="text-xs text-muted-foreground mt-1 block">
        {timestamp}
      </span>
    )}
  </div>
);

// Chat Header Component
const ChatHeader: React.FC = () => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold">Ask About Wildfires</h2>
      <p className="text-sm text-muted-foreground">Get real-time wildfire information</p>
    </div>
    <Button 
      variant="ghost" 
      size="icon" 
      className="rounded-full hover:bg-background/80"
      aria-label="Help"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  </div>
);

// Chat Input Component
const ChatInput: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle message submission logic here
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center w-full gap-2 bg-muted p-2 rounded-lg">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about wildfires..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
        />
        <Separator orientation="vertical" className="h-5" />
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-background/80"
        >
          <Mic className="h-4 w-4" />
          <span className="sr-only">Voice input</span>
        </Button>
        <Button 
          type="submit"
          className="rounded-full px-4 gap-2"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </form>
  );
};

// Alerts Tab Content Component
const AlertsContent: React.FC = () => (
  <UnifiedTabContent header={<h2 className="text-lg font-semibold">Alerts</h2>}>
    <Card className="p-4">
      <h3 className="font-medium mb-2">Current Alerts</h3>
      <p className="text-sm text-muted-foreground">No active alerts in your area.</p>
    </Card>
    <div className="flex-1" />
  </UnifiedTabContent>
);

// Routes Tab Content Component
const RoutesContent: React.FC = () => (
  <UnifiedTabContent header={<h2 className="text-lg font-semibold">Routes</h2>}>
    <Card className="p-4">
      <h3 className="font-medium mb-2">Evacuation Routes</h3>
      <p className="text-sm text-muted-foreground">No active evacuation routes.</p>
    </Card>
    <div className="flex-1" />
  </UnifiedTabContent>
);

// Chat Tab Content Component
const ChatContent: React.FC = () => {
  const [messages] = React.useState<Message[]>([
    {
      id: '1',
      content: "hey",
      isUser: false,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      content: "hey (with rizz)",
      isUser: true,
      timestamp: new Date().toISOString()
    },
  ]);

  return (
    <UnifiedTabContent
      header={<ChatHeader />}
      footer={<ChatInput />}
    >
      <div className="flex flex-col gap-4">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id}
            message={msg.content}
            isUser={msg.isUser}
          />
        ))}
      </div>
    </UnifiedTabContent>
  );
};

// Main SidePanel Component
export function SidePanel() {
  const [activeTab, setActiveTab] = React.useState<string>('alerts');

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <Tabs 
        defaultValue="alerts" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col h-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {TAB_CONFIG.map(({ value, icon: Icon, label }) => (
            <TabsTrigger 
              key={value}
              value={value} 
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="alerts" className="h-full">
          <AlertsContent />
        </TabsContent>

        <TabsContent value="routes" className="h-full">
          <RoutesContent />
        </TabsContent>

        <TabsContent value="chat" className="h-full">
          <ChatContent />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default SidePanel;