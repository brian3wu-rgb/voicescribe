import { notFound } from "next/navigation";
import { getResult } from "@/lib/store";
import type { AppResult } from "@/lib/types";
import Header from "@/app/components/Header";
import ResultView from "@/app/components/ResultView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SharedResultPage({ params }: Props) {
  const { id } = await params;
  const result = (await getResult(id)) as AppResult | null;

  if (!result) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ResultView result={result} />
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const result = (await getResult(id)) as AppResult | null;
  if (!result) return { title: "找不到記錄" };
  return {
    title: `${result.fileName} — AI 會議記錄`,
    description: `包含 ${result.keyPoints.length} 個重點與 ${result.actionItems.length} 個待辦項目`,
  };
}
