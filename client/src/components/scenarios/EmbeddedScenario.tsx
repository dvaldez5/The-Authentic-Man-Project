import { useQuery } from "@tanstack/react-query";
import { ScenarioPlayer } from "./ScenarioPlayer";
import { Skeleton } from "@/components/ui/skeleton";

interface EmbeddedScenarioProps {
  scenarioId: number;
}

export function EmbeddedScenario({ scenarioId }: EmbeddedScenarioProps) {
  const { data: scenario, isLoading, error } = useQuery({
    queryKey: [`/api/scenarios/${scenarioId}`],
    enabled: !!scenarioId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4 bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-5/6 bg-gray-700" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full bg-gray-700" />
          <Skeleton className="h-12 w-full bg-gray-700" />
          <Skeleton className="h-12 w-full bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="text-center py-8 px-6 bg-[#333333]/10 rounded-lg border border-[#333333]/20">
        <p className="text-[#333333] italic text-sm font-['Montserrat']">
          We couldn't load the real-world moment for this lesson. You can still complete it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      <ScenarioPlayer scenario={scenario} />
    </div>
  );
}