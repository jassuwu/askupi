"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, HardDrive } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { FinancialAnalysis } from "./AnalysisProcessor";

export interface HistoryItem {
  id: string;
  appName: string;
  startDate: string;
  endDate: string;
  analysisDate: string;
  data: FinancialAnalysis;
}

interface HistoryListProps {
  onSelectHistory: (item: HistoryItem) => void;
}

export function HistoryList({ onSelectHistory }: HistoryListProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Load history items from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedHistory = localStorage.getItem("askupi-history");
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load history from localStorage:", error);
      }
    }
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = historyItems.filter((item) => item.id !== id);
    setHistoryItems(updatedItems);

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("askupi-history", JSON.stringify(updatedItems));
    }
  };

  if (historyItems.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-6 border border-dashed">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Previous Analyses
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-1">
        <ScrollArea className="max-h-[220px] pr-2">
          <div className="space-y-1">
            {historyItems.map((item) => (
              <div key={item.id}>
                <div
                  className="w-full flex justify-between items-center h-auto py-2 px-2 text-start hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-pointer"
                  onClick={() => onSelectHistory(item)}
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{item.appName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.startDate)} — {formatDate(item.endDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-center gap-1 py-2 border-t">
        <HardDrive className="h-3 w-3" />
        Saved locally in your browser - no server storage
      </CardFooter>
    </Card>
  );
}
