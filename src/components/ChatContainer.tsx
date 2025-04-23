
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { Message } from "@/types/chat";
import { sendMessage } from "@/services/api";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! How can I assist you today? (Note: If you experience connection issues, this might be due to CORS restrictions in your browser.)",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCorsError(false);

    try {
      console.log("Sending message:", text);
      // Get AI response
      const response = await sendMessage(text);
      console.log("Received response:", response);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      
      // Check if error is related to CORS
      if (error.message && (
          error.message.includes("CORS") || 
          error.message.includes("NetworkError") || 
          error.message.includes("Failed to fetch"))) {
        setCorsError(true);
      }
      
      toast.error("Failed to get a response. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-purple-500 text-white p-4 text-center">
        <h1 className="text-xl font-semibold">Your Companion</h1>
      </div>
      
      {corsError && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>CORS Error</AlertTitle>
          <AlertDescription>
            Your browser is blocking the API request due to Cross-Origin Resource Sharing (CORS) restrictions. 
            We're attempting to use a proxy service, but it might not work for all requests.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
