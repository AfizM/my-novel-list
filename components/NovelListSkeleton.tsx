import { Skeleton } from "@/components/ui/skeleton";

export function NovelListSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[50px] ml-auto" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
