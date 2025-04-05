"use client";

import { AnalysisProcessor } from "~/components/AnalysisProcessor";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-full w-full px-4 py-6 md:px-6">
      <div className="flex w-full max-w-6xl flex-col items-center gap-6">
        <div className="w-full text-center mb-2 space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            AskUPI<span className="text-primary">.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Drop your UPI statement, get insights. Simple as that.
          </p>
          <div className="flex flex-col gap-2 mx-auto max-w-md">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Privacy & Data</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Your UPI statement is sent directly to Google&apos;s AI for
                analysis only.
              </p>
              <p className="text-xs text-muted-foreground text-center">
                No database, no tracking, just immediate insights.
              </p>
            </div>
          </div>
        </div>
        <AnalysisProcessor />
      </div>
    </main>
  );
}
