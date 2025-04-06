"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getHistoryFromStorage } from "~/lib/localStorage";
import { HistoryItem } from "./UnifiedHistoryList";
import { useChat } from "~/lib/ChatContext";
import { Skeleton } from "~/components/ui/skeleton";
import dynamic from "next/dynamic";

// Dynamic imports with loading fallbacks
const DynamicTransactionSummary = dynamic(
  () =>
    import("./TransactionSummary").then((mod) => ({
      default: mod.TransactionSummary,
    })),
  {
    loading: () => <Skeleton className="w-full" />,
  },
);

const DynamicChatUI = dynamic(
  () => import("./ChatUI").then((mod) => ({ default: mod.ChatUI })),
  {
    loading: () => <Skeleton className="w-full" />,
  },
);

export function AnalysisDetail({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [historyItem, setHistoryItem] = useState<HistoryItem | null>(null);
  const { chats, createChat, selectChat } = useChat();

  useEffect(() => {
    // Load the specific analysis data from localStorage
    const historyItems = getHistoryFromStorage();
    const item = historyItems.find((item) => item.id === analysisId);

    if (item) {
      setHistoryItem(item);

      // Find or create chat for this analysis
      const matchingChat = chats.find(
        (chat) =>
          chat.analysisData.summary.start_date ===
            item.data.summary.start_date &&
          chat.analysisData.summary.end_date === item.data.summary.end_date,
      );

      if (matchingChat) {
        selectChat(matchingChat.id);
      } else {
        createChat(item.data);
      }
    } else {
      // Analysis not found, redirect to home
      router.push("/");
    }
  }, [analysisId, chats, createChat, selectChat, router]);

  if (!historyItem) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-sm">
          Loading analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 md:px-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2"
          onClick={() => router.push("/")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          {historyItem.appName} Transactions
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {new Date(historyItem.startDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          —{" "}
          {new Date(historyItem.endDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="w-full" />}>
          <DynamicTransactionSummary data={historyItem.data} />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full" />}>
          <DynamicChatUI />
        </Suspense>
      </div>
    </div>
  );
}
