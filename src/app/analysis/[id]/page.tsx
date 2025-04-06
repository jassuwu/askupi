import { Suspense } from "react";
import { AnalysisDetail } from "~/components/AnalysisDetail";
import { AnalysisDetailSkeleton } from "~/components/skeletons";

export const experimental_ppr = true;

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<AnalysisDetailSkeleton />}>
      <AnalysisDetail analysisId={id} />
    </Suspense>
  );
}
