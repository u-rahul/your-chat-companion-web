
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";
import { ImageIcon } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        message.isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 my-1",
          message.isUser
            ? "bg-purple-500 text-white"
            : "bg-gray-100 text-gray-800"
        )}
      >
        <p className="text-sm">{message.text}</p>
        
        {message.attachment && (
          <div className={`mt-2 rounded ${message.isUser ? 'bg-purple-600' : 'bg-gray-200'}`}>
            {message.attachment.type.startsWith('image/') ? (
              <a 
                href={message.attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src={message.attachment.url} 
                  alt={message.attachment.name}
                  className="rounded max-h-48 object-contain mx-auto my-2"
                />
              </a>
            ) : (
              <a 
                href={message.attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs p-2"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="truncate">{message.attachment.name}</span>
                <span>({(message.attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
              </a>
            )}
          </div>
        )}
        
        <span className="text-xs opacity-70">
          {format(message.timestamp, "HH:mm")}
        </span>
      </div>
    </div>
  );
};
