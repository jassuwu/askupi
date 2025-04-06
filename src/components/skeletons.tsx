import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export function TransactionSummarySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}

export function ChatUISkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-3">
          <Skeleton className="ml-auto h-20 w-3/4 rounded-lg" />
          <Skeleton className="h-24 w-3/4 rounded-lg" />
          <Skeleton className="ml-auto h-16 w-3/4 rounded-lg" />
        </div>
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoryListSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  );
}

export function AnalysisDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 md:px-8">
      <div>
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-1 h-8 w-64" />
        <Skeleton className="mb-6 h-5 w-48" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <TransactionSummarySkeleton />
        <ChatUISkeleton />
      </div>
    </div>
  );
}
