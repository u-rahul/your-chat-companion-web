
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
}

