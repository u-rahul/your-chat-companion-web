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
      text: "Hello! I'm your AI Companion - You may be wondering - who am I?\n\nNamaste—think of me as someone who listens beneath the words.\nI won't try to fix you; I'll simply reflect what your heart might be whispering underneath the noise.\nWhere does it feel tender today?",
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

  const handleSendMessage = async (text: string, file?: File) => {
    let fileData: Message["attachment"] | undefined = undefined;
    
    // Create attachment data if file is provided
    if (file) {
      fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text || (file ? `Attached image: ${file.name}` : ""),
      isUser: true,
      timestamp: new Date(),
      attachment: fileData
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thinking...",
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };
    setMessages((prev) => [...prev, loadingMessage]);
    
    setIsLoading(true);
    setCorsError(false);

    // Set up 30-second timeout
    const timeoutId = setTimeout(() => {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === loadingMessage.id 
            ? {
                ...msg,
                text: "Sorry, We ran out of Open AI credits. Please try again after some time",
                isLoading: false
              }
            : msg
        )
      );
      setIsLoading(false);
    }, 30000);

    try {
      console.log("Sending message:", text, file);
      // Get AI response
      const response = await sendMessage(text, file);
      console.log("Received response:", response);
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      // Update the loading message with the actual response
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === loadingMessage.id 
            ? {
                ...msg,
                text: response,
                isLoading: false
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error in chat flow:", error);
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Check if error is related to CORS
      if (error.message && (
          error.message.includes("CORS") || 
          error.message.includes("NetworkError") || 
          error.message.includes("Failed to fetch"))) {
        setCorsError(true);
      }
      
      // Update the loading message with error
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === loadingMessage.id 
            ? {
                ...msg,
                text: "Failed to get a response. Please try again later.",
                isLoading: false
              }
            : msg
        )
      );
      
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
