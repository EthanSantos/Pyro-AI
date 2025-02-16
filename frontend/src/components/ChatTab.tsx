// src/components/panels/tabs/chat-tab.tsx
import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Mic, Send, HelpCircle } from "lucide-react";
import UnifiedTabContent from './UnifiedTabContent';

// Types
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

// Sub-components
const ChatHeader = () => (
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

const ChatMessage = ({ message, isUser }: ChatMessageProps) => (
  <div
    className={`p-3 rounded-lg max-w-[80%] ${
      isUser ? 'bg-primary text-primary-foreground self-end' : 'bg-muted self-start'
    }`}
  >
    <p className="text-sm">{message}</p>
  </div>
);

const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center w-full gap-2 bg-muted p-2 rounded-lg">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about wildfires..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-2"
        />
        <Separator orientation="vertical" className="h-5" />
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
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

// Main Chat Tab Component
const ChatTab = () => {
  const [messages, setMessages] = React.useState<Message[]>([
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

  const handleSend = (message: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <UnifiedTabContent
      header={<ChatHeader />}
      footer={<ChatInput onSend={handleSend} />}
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

export default React.memo(ChatTab);