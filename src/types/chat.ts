
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
}
