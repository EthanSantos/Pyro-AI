import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Mic, Send, HelpCircle } from "lucide-react";
import UnifiedTabContent from './UnifiedTabContent';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrollArea } from "./ui/scroll-area";
import { useWildfireContext } from "@/context/WildfireContext";
import { getLocationDetails } from '@/utils/getLocationDetails';
import axios from 'axios';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

// AnimatedDots Component for "THINKING" animation
const AnimatedDots = () => (
  <span className="inline-flex space-x-1">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
    <style jsx>{`
      .dot {
        width: 4px;
        height: 4px;
        background-color: currentColor;
        border-radius: 50%;
        display: inline-block;
        animation: bounce 1.4s infinite ease-in-out both;
      }
      .dot:nth-child(1) { animation-delay: -0.32s; }
      .dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `}</style>
  </span>
);

// TypewriterMarkdown Component for typewriter effect
const TypewriterMarkdown = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index === text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);
  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

// ChatHeader Component
const ChatHeader = () => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold">Ask About Wildfires</h2>
      <p className="text-sm text-muted-foreground">Get real-time wildfire information</p>
    </div>
    <Button size="icon" className="rounded-full hover:bg-background/80" aria-label="Help">
      <HelpCircle className="h-5 w-5" />
    </Button>
  </div>
);

// ChatMessage Component
const ChatMessage = ({ message, isUser }: ChatMessageProps) => (
  <div className={`p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground self-end' : 'bg-muted self-start'}`}>
    <div className="text-sm">
      {(!isUser && message === "THINKING") 
        ? <AnimatedDots /> 
        : (!isUser ? <TypewriterMarkdown text={message} /> : message)}
    </div>
  </div>
);

// ChatInput Component
const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
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
        <Button type="button" size="icon" className="h-8 w-8 rounded-full">
          <Mic className="h-4 w-4" />
          <span className="sr-only">Voice input</span>
        </Button>
        <Button type="submit" className="rounded-lg px-4 gap-2" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </form>
  );
};

// Main ChatTab Component
const ChatTab = () => {
  const {
    setActiveTab,
    setSelectedAddress,
    setShouldAutoSearch,
    safetyScore,
    riskValue,
    userCoordinates,
    fireData,
  } = useWildfireContext();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm here to help with wildfire information. Ask me anything!",
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Helper to update the THINKING placeholder message
  const updateThinkingMessage = (thinkingId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === thinkingId
          ? { ...msg, content: newContent, timestamp: new Date().toISOString() }
          : msg
      )
    );
  };

  // Main message handler
  const handleSend = useCallback(async (userMessage: string) => {
    // Append user's message to chat history
    const userMsg: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add THINKING placeholder
    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMsg: Message = {
      id: thinkingId,
      content: "THINKING",
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    // Regex check for route/directions commands
    const routeMatch = userMessage.match(
      /(?:find|show|plan|give)(?: me)?(?: a safe)?(?: an?)? (?:route|path|directions) to (.+)/i
    );
    if (routeMatch) {
      const query = routeMatch[1].trim();
      console.log("Destination query:", query);
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
          {
            params: {
              access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
              limit: 5,
              autocomplete: true
            },
          }
        );
        console.log("Mapbox response:", response.data);
        if (response.data.features && response.data.features.length > 0) {
          const feature = response.data.features[0];
          console.log("Selected feature:", feature);
          // Update context to show routes
          setSelectedAddress(feature);
          setActiveTab('routes');
          setShouldAutoSearch(true);
          updateThinkingMessage(thinkingId, `Found location: ${feature.place_name}. Switching to routes...`);
        } else {
          updateThinkingMessage(thinkingId, `Couldn't find "${query}". Please try a different location.`);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        updateThinkingMessage(thinkingId, "Error finding location. Please try again.");
      }
      return; // Route command handled; do not trigger fallback.
    }

    // 2. Special case: "Where am I?" with risk assessment.
    if (
      userMessage.trim().toLowerCase() === "where am i?" ||
      userMessage.trim().toLowerCase() === "where am i"
    ) {
      const locationDetails = userCoordinates
        ? await getLocationDetails(userCoordinates)
        : "Unknown location";
      let riskMessage = "";
      if (safetyScore !== null && safetyScore < 50) {
        riskMessage = `Your safety score is ${safetyScore}/100, indicating unsafe conditions, and your wildfire risk is ${riskValue}/100. Please follow immediate safety measures.`;
      } else {
        riskMessage = `Your safety score is ${safetyScore}/100 and your wildfire risk is ${riskValue}/100. Please stay alert and monitor conditions.`;
      }
      updateThinkingMessage(thinkingId, `You are at ${locationDetails}. ${riskMessage}`);
      return;
    }

    // 3. New specialized queries for wildfire-related questions:
    const lowerMsg = userMessage.toLowerCase();
    const locationDetails = userCoordinates
      ? await getLocationDetails(userCoordinates)
      : "Unknown location";
    let customPrompt = "";

    if (lowerMsg.includes("evacuate")) {
      customPrompt = `
You are a wildfire evacuation assistant. Using the context below, provide the safest evacuation route from the current location.
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Active Fires: ${fireData.length}
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    } else if (lowerMsg.includes("air quality") || lowerMsg.includes("aqi")) {
      customPrompt = `
You are a wildfire safety assistant. Using the context below, provide the current air quality index and advise if it is safe to go outside.
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    } else if (lowerMsg.includes("weather forecast") && lowerMsg.includes("fire")) {
      customPrompt = `
You are a wildfire safety assistant. Using the context below, provide the weather forecast and explain how it might affect wildfire behavior.
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Active Fires: ${fireData.length}
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    } else if (lowerMsg.includes("new fires") || lowerMsg.includes("reported near")) {
      customPrompt = `
You are a wildfire safety assistant. Using the context below, determine if there are any new fires reported near the current location.
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Active Fires: ${fireData.length}
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    } else if (lowerMsg.includes("upcoming weather") && lowerMsg.includes("wildfires")) {
      customPrompt = `
You are a wildfire safety assistant. Using the context below, explain how the upcoming weather (wind, rain, etc.) might affect wildfire behavior.
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Active Fires: ${fireData.length}
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    } else if (lowerMsg.includes("smoke") && lowerMsg.includes("protect")) {
      customPrompt = `
You are a wildfire safety assistant. Using the context below, provide practical advice on how to protect oneself from wildfire smoke exposure.
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    } else {
      // Default prompt for general wildfire safety queries.
      customPrompt = `
You are a wildfire safety assistant. Using the context below, answer "How safe am I?" with a brief response (1-2 sentences).
Context:
- Current Location: ${locationDetails}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Active Fires: ${fireData.length} (${fireData.slice(0, 3).map((f: any) => f.Name).join(", ")})
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**
Answer:
      `;
    }

    // Use Gemini Generative AI with the custom prompt
    try {
      console.log("Generated prompt:", customPrompt);
      const result = await model.generateContent(customPrompt);
      const responseText = await result.response.text();
      updateThinkingMessage(thinkingId, responseText);
    } catch (error: any) {
      console.error("Gemini API error:", error);
      let fallbackMessage = "Sorry, I'm having trouble accessing wildfire information right now.";
      if (error.message && error.message.includes("SAFETY")) {
        fallbackMessage = "Sorry, I'm unable to generate a safe response for that query.";
      }
      updateThinkingMessage(thinkingId, fallbackMessage);
    }
  }, [fireData, riskValue, safetyScore, setActiveTab, setSelectedAddress, setShouldAutoSearch, userCoordinates]);

  return (
    <UnifiedTabContent header={<ChatHeader />} footer={<ChatInput onSend={handleSend} />}>
      <ScrollArea className="h-[calc(100vh-180px)] pr-4">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg.content} isUser={msg.isUser} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </UnifiedTabContent>
  );
};

export default React.memo(ChatTab);
