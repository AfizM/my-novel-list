"use client";
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

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

const FavoriteNovelsList: React.FC<FavoriteNovelsListProps> = ({
  user,
  isCurrentUser,
}) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    fetchFavoriteNovels();
  }, [user.user_id]);

  const fetchFavoriteNovels = async () => {
    try {
      const response = await fetch(
        `/api/users/${user.user_id}/favorite-novels`,
      );
      if (!response.ok) throw new Error("Failed to fetch favorite novels");
      const data = await response.json();
      setNovels(data);
    } catch (error) {
      console.error("Error fetching favorite novels:", error);
      toast.error("Failed to fetch favorite novels");
    }
  };

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
          <Button onClick={isReordering ? handleSaveOrder : handleReorder}>
            {isReordering ? "Save Order" : "Reorder"}
          </Button>
        )}
      </div>
      <Card>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="favorites" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-wrap gap-4 mt-6 space-x-4"
                >
                  {novels.map((novel, index) => (
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
