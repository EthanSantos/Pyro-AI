import React from 'react';
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

// AnimatedDots Component
const AnimatedDots = () => {
    return (
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
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
        </span>
    );
};

// TypewriterMarkdown Component
const TypewriterMarkdown = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = React.useState("");

    React.useEffect(() => {
        let index = 0;
        setDisplayedText(""); // reset displayed text whenever text changes
        const interval = setInterval(() => {
            index++;
            setDisplayedText(text.slice(0, index));
            if (index === text.length) {
                clearInterval(interval);
            }
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

// ChatMessage Component
const ChatMessage = ({ message, isUser }: ChatMessageProps) => (
    <div
        className={`p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground self-end' : 'bg-muted self-start'}`}
    >
        <div className="text-sm">
            {(!isUser && message === "THINKING") ? (
                <AnimatedDots />
            ) : (
                !isUser ? <TypewriterMarkdown text={message} /> : message
            )}
        </div>
    </div>
);

// ChatInput Component
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

    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: '1',
            content: "Hello! I'm here to help with wildfire information. Ask me anything!",
            isUser: false,
            timestamp: new Date().toISOString()
        },
    ]);

    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Scroll to the bottom when messages update.
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (userMessage: string) => {
        // Add the user's message to the chat
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                content: userMessage,
                isUser: true,
                timestamp: new Date().toISOString()
            }
        ]);

        // Add a THINKING placeholder message
        const thinkingId = `thinking-${Date.now()}`;
        setMessages(prev => [
            ...prev,
            {
                id: thinkingId,
                content: "THINKING",
                isUser: false,
                timestamp: new Date().toISOString()
            }
        ]);

        // Updated regex: optionally match an article ("a" or "an") before route/path.
        const routeMatch = userMessage.match(/(?:find|show)(?: me)?(?: a safe)?(?: an?)? (?:route|path|directions) to (.+)/i);
        if (routeMatch) {
            const query = routeMatch[1].trim();
            console.log("Destination query:", query);

            try {
                const response = await axios.get(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
                    {
                        params: {
                            access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
                            limit: 5,              // Increase the limit to get multiple suggestions
                            autocomplete: true     // Enables autocomplete functionality
                        },
                    }
                );

                console.log("Mapbox response:", response.data);

                if (response.data.features && response.data.features.length > 0) {
                    // For example, take the first suggestion, or present a list to the user.
                    const feature = response.data.features[0];
                    console.log("Selected feature:", feature);

                    // Update your UI/context with the selected feature:
                    setSelectedAddress(feature);
                    setActiveTab('routes');
                    setShouldAutoSearch(true);

                    // Optionally, update your chat message:
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === thinkingId
                                ? { ...msg, content: `Found location: ${feature.place_name}. Switching to routes...`, timestamp: new Date().toISOString() }
                                : msg
                        )
                    );
                } else {
                    // Handle no suggestions found
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === thinkingId
                                ? { ...msg, content: `Couldn't find "${query}". Please try a different location.`, timestamp: new Date().toISOString() }
                                : msg
                        )
                    );
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === thinkingId
                            ? { ...msg, content: "Error finding location. Please try again.", timestamp: new Date().toISOString() }
                            : msg
                    )
                );
            }
            // Return early so the Gemini AI fallback is not executed
            return;
        }

        // Fallback: use the Gemini Generative AI model if no route command was detected.
        try {
            const locationDetails = userCoordinates
                ? await getLocationDetails(userCoordinates)
                : "Unknown location";

            const prompt = `
You are a wildfire safety assistant. Use the following context to answer "How safe am I?" with a brief response (1-2 sentences).

Context:
- Location: ${locationDetails || "Unknown"}
- Coordinates: ${userCoordinates ? userCoordinates.join(", ") : "N/A"}
- Active Fires: ${fireData.length} (${fireData.slice(0, 3).map((f: any) => f.Name).join(", ")})
- Safety Score: **${safetyScore}/100**
- Wildfire Risk: **${riskValue}/100**

Instructions:
${safetyScore! < 50 ? `
1. Begin by noting that the low safety score (**${safetyScore}/100**) indicates unsafe conditions.
2. Mention the wildfire risk (**${riskValue}**) and provide an urgent safety tip.
` : `
1. Mention the wildfire risk (**${riskValue}**).
2. Note the safety score (**${safetyScore}/100**) and offer monitoring advice.
`}

Formatting:
- Use bold formatting for numbers (e.g., **like this**).
- Avoid combining percentages; explain them separately.

Question: ${userMessage}
Answer:
      `;

            console.log("Generated prompt:", prompt);

            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === thinkingId
                        ? { ...msg, content: responseText, timestamp: new Date().toISOString() }
                        : msg
                )
            );
        } catch (error: any) {
            console.error("Gemini API error:", error);
            let fallbackMessage = "Sorry, I'm having trouble accessing wildfire information right now.";
            if (error.message && error.message.includes("SAFETY")) {
                fallbackMessage = "Sorry, I'm unable to generate a safe response for that query.";
            }
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === thinkingId
                        ? { ...msg, content: fallbackMessage, timestamp: new Date().toISOString() }
                        : msg
                )
            );
        }
    };

    return (
        <UnifiedTabContent
            header={<ChatHeader />}
            footer={<ChatInput onSend={handleSend} />}
        >
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                <div className="flex flex-col gap-4 pb-4">
                    {messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg.content}
                            isUser={msg.isUser}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
        </UnifiedTabContent>
    );
};

export default React.memo(ChatTab);
