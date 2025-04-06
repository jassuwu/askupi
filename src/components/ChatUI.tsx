"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2, HistoryIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Input } from "~/components/ui/input";
import {
  useChat,
  type ChatMessage as ChatMessageType,
} from "~/lib/ChatContext";
import { getLocalStorageInfo } from "~/lib/localStorage";
import { toast } from "sonner";
import prettyBytes from "pretty-bytes";

export function ChatUI() {
  const { currentChat, addMessage, deleteChat } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentUsed: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update localStorage info when needed
  const updateStorageInfo = () => {
    if (typeof window !== "undefined") {
      setStorageInfo(getLocalStorageInfo());
    }
  };

  // Update storage info when component mounts and when chat changes
  useEffect(() => {
    updateStorageInfo();
  }, [currentChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // Focus the input field when chat changes
  useEffect(() => {
    if (currentChat) {
      inputRef.current?.focus();
    }
  }, [currentChat]);

  if (!currentChat) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    // Add user message
    addMessage("user", inputValue);

    // Clear input and set loading state
    const userQuestion = inputValue;
    setInputValue("");
    setIsSubmitting(true);

    try {
      // Call the API with the chat history and analysis data
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...currentChat.messages,
            {
              id: Date.now().toString(),
              role: "user",
              content: userQuestion,
              timestamp: new Date().toISOString(),
            },
          ],
          analysisData: currentChat.analysisData,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      // Add the AI response to the chat
      addMessage("assistant", result.text);
      updateStorageInfo();
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get a response", {
        description: "Please try asking your question again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex h-[calc(100vh-180px)] max-h-[900px] min-h-[500px] w-full flex-col">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            <span>{currentChat.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => currentChat && deleteChat(currentChat.id)}
            disabled={isSubmitting}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete chat</span>
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-4">
            {currentChat.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isSubmitting && (
              <div className="flex justify-start">
                <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Analyzing your data...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t p-3">
        <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
          <span>
            Storage: {prettyBytes(storageInfo.used)} /{" "}
            {prettyBytes(storageInfo.total)}
          </span>
          <span>{storageInfo.percentUsed.toFixed(1)}% used</span>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            }
            placeholder="Ask something about your data..."
            className="flex-grow"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

// Individual message component
function ChatMessage({ message }: { message: ChatMessageType }) {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
