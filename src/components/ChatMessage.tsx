
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";

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
        <span className="text-xs opacity-70">
          {format(message.timestamp, "HH:mm")}
        </span>
      </div>
    </div>
  );
};
