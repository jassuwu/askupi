"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { FinancialAnalysis } from "~/components/AnalysisProcessor";
import { getChatsFromStorage, saveChatsToStorage } from "./localStorage";

// Chat message interface
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Chat history interface
export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  analysisData: FinancialAnalysis;
  messages: ChatMessage[];
}

// Context interface
interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  createChat: (analysisData: FinancialAnalysis) => string;
  selectChat: (chatId: string) => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  deleteChat: (chatId: string) => void;
  currentChat: Chat | null;
}

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  chats: [],
  currentChatId: null,
  createChat: () => "",
  selectChat: () => {},
  addMessage: () => {},
  deleteChat: () => {},
  currentChat: null,
});

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chats from localStorage on initial render
  useEffect(() => {
    const storedChats = getChatsFromStorage();
    if (storedChats.length > 0) {
      setChats(storedChats);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToStorage(chats);
    }
  }, [chats]);

  // Create a new chat
  const createChat = (analysisData: FinancialAnalysis): string => {
    // Generate title from date range in the analysis
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    };

    const startDate = formatDate(analysisData.summary.start_date);
    const endDate = formatDate(analysisData.summary.end_date);
    const title = `Analysis ${startDate} to ${endDate}`;

    // Create initial assistant message with summary
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: `I've analyzed your UPI transactions from ${startDate} to ${endDate}. You spent ₹${Math.abs(analysisData.summary.total_spent).toLocaleString("en-IN")} and received ₹${analysisData.summary.total_received.toLocaleString("en-IN")}. Your net change was ₹${analysisData.summary.net_change.toLocaleString("en-IN")}. What would you like to know about this data?`,
      timestamp: new Date().toISOString(),
    };

    // Create new chat
    const newChat: Chat = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      analysisData,
      messages: [initialMessage],
    };

    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);

    return newChat.id;
  };

  // Select a chat
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Add a message to the current chat
  const addMessage = (role: "user" | "assistant", content: string) => {
    if (!currentChatId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat,
      ),
    );
  };

  // Delete a chat
  const deleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  // Get the current chat
  const currentChat = chats.find((chat) => chat.id === currentChatId) || null;

  // Context value
  const value = {
    chats,
    currentChatId,
    createChat,
    selectChat,
    addMessage,
    deleteChat,
    currentChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
