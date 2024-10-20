"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDebounce } from "@/hooks/useDebounce";

interface Novel {
  id: number;
  name: string;
  cover_image_url: string;
  favoriteOrder: number;
}

interface FavoriteNovelsListProps {
  user: {
    user_id: string;
    username: string;
  };
  isCurrentUser: boolean;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

const FavoriteNovelsList: React.FC<FavoriteNovelsListProps> = ({
  user,
  isCurrentUser,
}) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<{
    data: Novel[];
    timestamp: number;
  } | null>(null);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchFavoriteNovels = useCallback(async () => {
    if (cache && Date.now() - cache.timestamp < CACHE_TIME) {
      setNovels(cache.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/users/${user.user_id}/favorite-novels`,
      );
      if (!response.ok) throw new Error("Failed to fetch favorite novels");
      const data = await response.json();
      setNovels(data);
      setCache({ data, timestamp: Date.now() });
    } catch (error) {
      console.error("Error fetching favorite novels:", error);
      setError("Failed to fetch favorite novels. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user.user_id, cache]);

  useEffect(() => {
    fetchFavoriteNovels();
  }, [fetchFavoriteNovels]);

  const handleReorder = () => {
    setIsReordering(!isReordering);
  };

  const handleSaveOrder = async () => {
    try {
      const response = await fetch(
        `/api/users/${user.user_id}/favorite-novels`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novels }),
        },
      );
      if (!response.ok)
        throw new Error("Failed to update favorite novels order");
      setIsReordering(false);
      toast.success("Favorite novels order updated successfully");
      // Update cache after successful reorder
      setCache({ data: novels, timestamp: Date.now() });
    } catch (error) {
      console.error("Error updating favorite novels order:", error);
      toast.error("Failed to update favorite novels order");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(novels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNovels(
      items.map((item, index) => ({ ...item, favoriteOrder: index + 1 })),
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
          Favorite Novels
        </h2>
        {isCurrentUser && (
          <Button
            onClick={isReordering ? handleSaveOrder : handleReorder}
            disabled={debouncedLoading}
          >
            {isReordering ? "Save Order" : "Reorder"}
          </Button>
        )}
      </div>
      <Card>
        <CardContent>
          {error && (
            <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
              {error}
              <Button onClick={fetchFavoriteNovels} className="ml-2">
                Retry
              </Button>
            </div>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="favorites" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-wrap gap-4 mt-6 space-x-4"
                >
                  {debouncedLoading
                    ? Array(6)
                        .fill(0)
                        .map((_, index) => (
                          <div key={index} className="w-24">
                            <Skeleton height={144} className="mb-2" />
                            <Skeleton width={96} height={20} />
                          </div>
                        ))
                    : novels.map((novel, index) => (
                        <Draggable
                          key={novel.id}
                          draggableId={novel.id.toString()}
                          index={index}
                          isDragDisabled={!isReordering}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative ${
                                snapshot.isDragging ? "z-10" : ""
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <div className="w-24 h-36 overflow-hidden rounded-md shadow-md">
                                  <img
                                    src={
                                      novel.cover_image_url ||
                                      "/img/novel-placeholder.jpg"
                                    }
                                    alt={novel.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="mt-2 text-sm font-medium text-center line-clamp-2 w-24">
                                  {novel.name}
                                </p>
                                {isReordering && (
                                  <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white p-1 rounded">
                                    {index + 1}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoriteNovelsList;
