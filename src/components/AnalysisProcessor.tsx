"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FileUploader, FileSubmission } from "./FileUploader";
import { TransactionSummary } from "./TransactionSummary";
import { Card, CardContent } from "./ui/card";
import { HistoryList, HistoryItem } from "./HistoryList";

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

  // Show privacy notice on component mount
  useEffect(() => {
    const hasSeenPrivacyNotice = sessionStorage.getItem("hasSeenPrivacyNotice");
    if (!hasSeenPrivacyNotice) {
      toast.message("Privacy & Data Use", {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        description:
          "Your PDF is sent to Google AI for analysis only. Results are stored locally in your browser - not on any servers.",
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

      // File uploaded successfully
      toast.success("Got it! File uploaded", {
        id: uploadToast,
      });
      setIsUploading(false);

      const response = await fetch("/api", {
        method: "POST",
        body: formData,
        signal,
      });

      if (!response.ok) {
        toast.dismiss(uploadToast);
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Start AI analysis
      setIsAnalyzing(true);
      const analysisToast = toast.loading("AI doing its magic... hang tight");

      // Parse and validate the response
      const result = await response.json();

      try {
        let parsedData: FinancialAnalysis;

        // Check if result.text is defined and contains JSON
        if (result.text) {
          // Find the JSON part between triple backticks if present
          const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            parsedData = JSON.parse(jsonMatch[1]);
          } else {
            // Try parsing the whole text as JSON
            parsedData = JSON.parse(result.text);
          }
        } else {
          // If result is already the parsed JSON
          parsedData = result;
        }

        // Validate that the data seems to be a UPI statement
        if (!parsedData.transactions || parsedData.transactions.length === 0) {
          throw new Error("No transactions found. Is this a UPI statement?");
        }

        // Set the analysis data
        setAnalysisData(parsedData);
        setShowResults(true);

        // Save to localStorage
        saveToHistory(parsedData);

        // Show success message
        toast.success(
          `Done! Found ${parsedData.transactions.length} transactions`,
          {
            id: analysisToast,
          },
        );
      } catch (parseError) {
        console.error("Error parsing analysis data:", parseError);
        toast.error("Hmm, that doesn't look right", {
          id: analysisToast,
          description:
            "This doesn't seem to be a UPI statement. Try a different file?",
        });
        setError(
          "We couldn't find any UPI transactions in that PDF. Make sure you're uploading the right file.",
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
          appName = "Google Pay";
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

      // Get existing history
      let history: HistoryItem[] = [];
      const storedHistory = localStorage.getItem("askupi-history");
      if (storedHistory) {
        history = JSON.parse(storedHistory);
      }

      // Add new item and save
      history.unshift(historyItem);
      localStorage.setItem("askupi-history", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save to history:", error);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setAnalysisData(item.data);
    setShowResults(true);
  };

  const isProcessing = isUploading || isAnalyzing;

  if (error) {
    return (
      <div className="w-full space-y-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold">That didn&apos;t work</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {!showResults ? (
        <div className="w-full space-y-6">
          <FileUploader
            onSubmit={handleFileSubmit}
            isProcessing={isProcessing}
          />

          {isAnalyzing && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                className="text-destructive"
                onClick={handleCancelAnalysis}
              >
                Cancel
              </Button>
            </div>
          )}

          <HistoryList onSelectHistory={handleSelectHistory} />
        </div>
      ) : (
        <>
          <div className="mb-6 flex w-full items-center justify-start">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              Try Another Statement
            </Button>
          </div>

          {analysisData ? (
            <div className="w-full">
              <TransactionSummary data={analysisData} />
            </div>
          ) : isAnalyzing ? (
            <div className="bg-card text-card-foreground flex w-full flex-col items-center rounded-lg border p-8 shadow-sm">
              <Loader2 className="mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">
                Crunching those numbers...
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                Just a moment while we analyze everything
              </p>
              <Button
                variant="outline"
                className="text-destructive mt-4"
                onClick={handleCancelAnalysis}
              >
                Stop Analysis
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
