"use client";

import { useEffect, useState } from "react";
import { Trash2, HardDrive, CalendarDays, BarChart4 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { FinancialAnalysis } from "./AnalysisProcessor";
import { useChat } from "~/lib/ChatContext";
import {
  getLocalStorageInfo,
  getHistoryFromStorage,
  saveHistoryToStorage,
} from "~/lib/localStorage";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import prettyBytes from "pretty-bytes";
import Link from "next/link";

export interface HistoryItem {
  id: string;
  appName: string;
  startDate: string;
  endDate: string;
  analysisDate: string;
  data: FinancialAnalysis;
}

interface UnifiedHistoryListProps {
  className?: string;
}

export function UnifiedHistoryList({
  className = "",
}: UnifiedHistoryListProps) {
  const { chats, deleteChat } = useChat();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentUsed: 0,
  });

  // Load history items and update storage info
  useEffect(() => {
    const storedHistory = getHistoryFromStorage();
    setHistoryItems(storedHistory);
    setStorageInfo(getLocalStorageInfo());
  }, [chats]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const updatedItems = historyItems.filter((item) => item.id !== id);
    setHistoryItems(updatedItems);

    // Update localStorage
    saveHistoryToStorage(updatedItems);

    // Also delete matching chat if it exists
    const itemToDelete = historyItems.find((item) => item.id === id);
    if (itemToDelete) {
      const matchingChat = chats.find(
        (chat) =>
          chat.analysisData.summary.start_date ===
            itemToDelete.data.summary.start_date &&
          chat.analysisData.summary.end_date ===
            itemToDelete.data.summary.end_date,
      );

      if (matchingChat) {
        deleteChat(matchingChat.id);
      }
    }

    // Refresh storage info
    setStorageInfo(getLocalStorageInfo());
  };

  if (historyItems.length === 0) {
    return null;
  }

  return (
    <Card className={`border-border/40 shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart4 className="text-primary h-4 w-4" />
            Your Analyses
          </CardTitle>
          <Badge variant="outline" className="px-2 py-0 text-xs font-normal">
            {historyItems.length} items
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground flex items-center gap-1 text-xs">
          <HardDrive className="h-3 w-3" />
          {prettyBytes(storageInfo.used)} used (
          {storageInfo.percentUsed.toFixed(1)}%)
        </CardDescription>
      </CardHeader>

      <CardContent className="px-3 pt-0 pb-3">
        <ScrollArea className="h-[calc(100vh-300px)] max-h-[600px] min-h-[300px] pr-2">
          <div className="space-y-2 pt-2">
            {historyItems.map((item) => {
              // Find matching chat to show message count
              const matchingChat = chats.find(
                (chat) =>
                  chat.analysisData.summary.start_date ===
                    item.data.summary.start_date &&
                  chat.analysisData.summary.end_date ===
                    item.data.summary.end_date,
              );

              const transactionCount = item.data.transactions.length;
              const totalSpent = Math.abs(item.data.summary.total_spent);

              return (
                <Link key={item.id} href={`/analysis/${item.id}`} prefetch>
                  <div className="group hover:bg-accent border-border/40 relative cursor-pointer rounded-md border transition-all hover:shadow-sm">
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                              item.appName === "PhonePe"
                                ? "bg-purple-100 text-purple-600"
                                : item.appName === "GPay"
                                  ? "bg-blue-100 text-blue-600"
                                  : item.appName === "Paytm"
                                    ? "bg-cyan-100 text-cyan-600"
                                    : "bg-gray-100 text-gray-600"
                            } `}>
                            {item.appName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm leading-tight font-medium">
                              {item.appName}
                            </h3>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <CalendarDays className="h-3 w-3" />
                              <span>
                                {formatDate(item.startDate).split(",")[0]} —{" "}
                                {formatDate(item.endDate).split(",")[0]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteItem(item.id, e)}
                                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Delete analysis</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="mt-2 flex justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-xs">
                            ₹{totalSpent.toLocaleString("en-IN")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-xs">
                            {transactionCount} transaction
                            {transactionCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        {matchingChat && (
                          <span className="text-muted-foreground text-xs">
                            {matchingChat.messages.length} message
                            {matchingChat.messages.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
