export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClose: () => void;
  headerColor?: string;
}

export interface ChatMessagesProps {
  messages: Message[];
  isTyping?: boolean;
  onFeedbackRequested?: (messageIndex: number) => void;
  showFeedbackFor?: number | null;
  chatId?: string;
  conversationEnded?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  buttonColor?: string;
}

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
}
