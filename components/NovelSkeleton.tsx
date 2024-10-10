import { Skeleton } from "@/components/ui/skeleton";

export function NovelSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full h-[278px] rounded-md" />
      <Skeleton className="w-3/4 h-4 mt-2" />
    </div>
  );
}
