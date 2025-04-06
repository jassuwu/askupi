"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { Loader2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FileUploader, FileSubmission } from "./FileUploader";
import { Card, CardContent } from "./ui/card";
import { HistoryItem } from "./UnifiedHistoryList";
import { useChat } from "~/lib/ChatContext";
import {
  getHistoryFromStorage,
  saveHistoryToStorage,
} from "~/lib/localStorage";
import { Skeleton } from "~/components/ui/skeleton";
import dynamic from "next/dynamic";

// Dynamic imports with loading fallbacks
const DynamicTransactionSummary = dynamic(
  () =>
    import("./TransactionSummary").then((mod) => ({
      default: mod.TransactionSummary,
    })),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);

const DynamicChatUI = dynamic(
  () => import("./ChatUI").then((mod) => ({ default: mod.ChatUI })),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);

const DynamicUnifiedHistoryList = dynamic(
  () =>
    import("./UnifiedHistoryList").then((mod) => ({
      default: mod.UnifiedHistoryList,
    })),
  {
    loading: () => <Skeleton className="h-80 w-full rounded-md" />,
  },
);

// Transaction type
interface Transaction {
  date: string;
  time: string | null;
  description: string;
  amount: number;
  upi_id: string | null;
  category: string;
}

// New comprehensive type for the full analysis
export interface FinancialAnalysis {
  transactions: Transaction[];
  summary: {
    total_spent: number;
    total_received: number;
    net_change: number;
    transaction_count: number;
    start_date: string;
    end_date: string;
  };
  category_breakdown: Record<
    string,
    {
      total: number;
      percentage: number;
      count: number;
    }
  >;
  insights: Array<{
    type: "saving_opportunity" | "spending_pattern" | "anomaly" | "tip";
    description: string;
    impact: number | null;
  }>;
  recommendations: Array<{
    category: string;
    action: string;
    potential_savings: number;
  }>;
}

export function AnalysisProcessor() {
  const [analysisData, setAnalysisData] = useState<FinancialAnalysis | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { createChat } = useChat();

  // Show privacy notice on component mount
  useEffect(() => {
    const hasSeenPrivacyNotice = sessionStorage.getItem("hasSeenPrivacyNotice");
    if (!hasSeenPrivacyNotice) {
      toast.message("Privacy & Data Use", {
        icon: <ShieldCheck className="text-primary h-5 w-5" />,
        description:
          "Your PDF is sent to Google AI for analysis. For performance, only the 30 most significant transactions are processed. Results are stored locally in your browser.",
        duration: 8000,
      });
      sessionStorage.setItem("hasSeenPrivacyNotice", "true");
    }
  }, []);

  const handleFileSubmit = async (data: FileSubmission) => {
    try {
      setError(null);

      // Start uploading
      setIsUploading(true);
      const uploadToast = toast.loading("Uploading your file...");

      const formData = new FormData();
      formData.append("file", data.files[0].file);

      // Create an AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Send the file to the API
      const response = await fetch("/api", {
        method: "POST",
        body: formData,
        signal,
      });

      // File upload completed
      setIsUploading(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Upload failed", {
          id: uploadToast,
          description: errorData.error || `Error: ${response.status}`,
        });
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      // Update toast to show we're now analyzing
      toast.loading("AI analyzing your statement...", {
        id: uploadToast,
      });

      // Start AI analysis
      setIsAnalyzing(true);

      try {
        // Parse the response data
        const result = await response.json();

        // Check if we got an error response
        if (result.error) {
          throw new Error(result.error);
        }

        // Verify the response has the required fields
        if (
          !result.transactions ||
          !Array.isArray(result.transactions) ||
          result.transactions.length === 0
        ) {
          throw new Error("No transactions found. Is this a UPI statement?");
        }

        if (!result.summary || typeof result.summary !== "object") {
          throw new Error("Missing summary data in the analysis");
        }

        // Data is valid, set it to state
        setAnalysisData(result);
        setShowResults(true);

        // Save to localStorage
        saveToHistory(result);

        // Show success message
        toast.success(
          `Done! Analyzed ${result.summary.transaction_count} transactions`,
          {
            id: uploadToast,
          },
        );
      } catch (parseError) {
        console.error("Error parsing analysis data:", parseError);
        toast.error("Hmm, that doesn't look right", {
          id: uploadToast,
          description:
            "This doesn't seem to be a UPI statement. Try a different file?",
        });
        setError(
          parseError instanceof Error
            ? parseError.message
            : "We couldn't find any UPI transactions in that PDF. Make sure you're uploading the right file.",
        );
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error(error);

      // Check if the error is due to user abort
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.error("Operation canceled", {
          description: "No worries, we've stopped the process.",
        });
      } else {
        toast.error("Oops, something went wrong", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        setError(
          error instanceof Error
            ? error.message
            : "Something broke. Try again?",
        );
      }

      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setAnalysisData(null);
    setError(null);
  };

  const saveToHistory = (data: FinancialAnalysis) => {
    if (typeof window === "undefined") return;

    try {
      // Get app name from the first transaction description
      let appName = "UPI App";
      if (data.transactions && data.transactions.length > 0) {
        const firstDescription = data.transactions[0].description.toLowerCase();
        if (firstDescription.includes("phonepe")) {
          appName = "PhonePe";
        } else if (
          firstDescription.includes("gpay") ||
          firstDescription.includes("google pay")
        ) {
          appName = "GPay";
        } else if (firstDescription.includes("paytm")) {
          appName = "Paytm";
        }
      }

      // Create history item
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        appName,
        startDate: data.summary.start_date,
        endDate: data.summary.end_date,
        analysisDate: new Date().toISOString(),
        data,
      };

      // Get existing history and add new item
      const history = getHistoryFromStorage();
      history.unshift(historyItem);
      saveHistoryToStorage(history);

      // Create a new chat for this analysis
      createChat(data);
    } catch (error) {
      console.error("Failed to save to history:", error);
    }
  };

  const isProcessing = isUploading || isAnalyzing;

  return (
    <div className="w-full space-y-8">
      {/* Error display */}
      {error && (
        <div className="mx-auto max-w-xl">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="text-destructive flex items-center gap-2 p-4 text-sm">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results */}
      {showResults && analysisData ? (
        <div className="grid w-full gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:gap-10">
          <div className="h-full">
            <Suspense
              fallback={<Skeleton className="h-full min-h-96 w-full" />}>
              <DynamicTransactionSummary data={analysisData} />
            </Suspense>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleReset}>
              Analyze another statement
            </Button>
          </div>

          <div className="h-full">
            <Suspense
              fallback={<Skeleton className="h-full min-h-96 w-full" />}>
              <DynamicChatUI />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="grid w-full gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:gap-10">
          {/* File uploader */}
          <div className="order-1 md:order-none">
            <FileUploader
              onSubmit={handleFileSubmit}
              isProcessing={isProcessing}
            />
            {isProcessing ? (
              <div className="mt-4 flex flex-col items-center justify-center gap-2 text-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  {isUploading
                    ? "Uploading your file..."
                    : "AI is analyzing your statement..."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelAnalysis}>
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>

          {/* Unified History list */}
          <div className="h-full">
            <Suspense
              fallback={
                <Skeleton className="h-full min-h-80 w-full rounded-md" />
              }>
              <DynamicUnifiedHistoryList />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
