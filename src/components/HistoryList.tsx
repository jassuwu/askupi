"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, HardDrive } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { FinancialAnalysis } from "./AnalysisProcessor";
import { Separator } from "./ui/separator";

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
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Previous Analyses
        </CardTitle>
        <CardDescription>
          Your previously analyzed UPI statements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="flex flex-col">
                <div
                  className="flex justify-between items-start p-3 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => onSelectHistory(item)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{item.appName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.startDate)} to {formatDate(item.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Analyzed on {formatDate(item.analysisDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
                <Separator className="mt-2" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-0">
        <HardDrive className="h-3 w-3" />
        Saved locally in your browser - no server storage
      </CardFooter>
    </Card>
  );
}
