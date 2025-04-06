import { Suspense } from "react";
import { AnalysisProcessor } from "~/components";
import { HistoryListSkeleton } from "~/components/skeletons";

export const experimental_ppr = true;

export default function Home() {
  return (
    <main className="flex min-h-full w-full flex-col items-center justify-start px-4 py-6 sm:px-6 md:px-8 lg:px-12">
      <div className="mb-8 w-full max-w-[1600px] text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          Ask<span className="text-primary">UPI</span>
        </h1>
        <p className="text-muted-foreground text-center text-base text-pretty">
          Upload your UPI statement PDF and get instant financial insights.
          <br />
          <span className="text-xs">
            Analysis by Google AI. Data stored locally.
          </span>
        </p>
      </div>

      <div className="w-full max-w-[1600px]">
        <Suspense
          fallback={
            <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-2 xl:gap-8">
              <div></div>
              <HistoryListSkeleton />
            </div>
          }>
          <AnalysisProcessor />
        </Suspense>
      </div>
    </main>
  );
}
