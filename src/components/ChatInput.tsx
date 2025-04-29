
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";
import { FileUpload } from "./FileUpload";

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !isLoading) {
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t p-4 bg-white"
    >
      <FileUpload 
        onFileSelect={setSelectedFile} 
        selectedFile={selectedFile} 
      />
      
      <div className="flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || (!message.trim() && !selectedFile)}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
