"use client";

import { useEffect, useState } from "react";
import { MessagesSquare, Trash2, DatabaseIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useChat } from "~/lib/ChatContext";
import { getLocalStorageInfo } from "~/lib/localStorage";
import prettyBytes from "pretty-bytes";

export function ChatHistory() {
  const { chats, selectChat, deleteChat, currentChatId } = useChat();
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentUsed: 0,
  });

  // Update localStorage info
  useEffect(() => {
    if (typeof window !== "undefined") {
      setStorageInfo(getLocalStorageInfo());
    }
  }, [chats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (chats.length === 0) {
    return null;
  }

  return (
    <Card className="w-full border border-dashed">
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <MessagesSquare className="h-3.5 w-3.5" />
          Your Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-1">
        <ScrollArea className="max-h-[220px] pr-2">
          <div className="space-y-1">
            {chats.map((chat) => (
              <div key={chat.id}>
                <div
                  className={`flex h-auto w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-start transition-colors ${
                    chat.id === currentChatId
                      ? "bg-primary/10"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => selectChat(chat.id)}>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="truncate text-sm font-medium">{chat.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(chat.createdAt)} • {chat.messages.length}{" "}
                      messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="h-6 w-6 opacity-50 hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-muted-foreground justify-between gap-1 border-t px-4 py-2 text-xs">
        <div className="flex items-center gap-1">
          <DatabaseIcon className="h-3 w-3" />
          <span>
            {prettyBytes(storageInfo.used)} / {prettyBytes(storageInfo.total)}
          </span>
        </div>
        <span>{storageInfo.percentUsed.toFixed(1)}% used</span>
      </CardFooter>
    </Card>
  );
}
