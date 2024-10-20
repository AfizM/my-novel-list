"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  user_id: string;
  username: string;
  image_url: string;
}

interface SocialPageContentProps {
  user: User;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function SocialPageContent({ user }: SocialPageContentProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState({ followers: true, following: true });
  const [error, setError] = useState({ followers: null, following: null });
  const [cache, setCache] = useState<{
    [key: string]: { data: User[]; timestamp: number };
  }>({});

  const debouncedLoading = useDebounce(loading, 200);

  const fetchUsers = useCallback(
    async (type: "followers" | "following") => {
      const cacheKey = `${user.user_id}-${type}`;
      const cachedData = cache[cacheKey];

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
        type === "followers"
          ? setFollowers(cachedData.data)
          : setFollowing(cachedData.data);
        setLoading((prev) => ({ ...prev, [type]: false }));
        return;
      }

      setLoading((prev) => ({ ...prev, [type]: true }));
      setError((prev) => ({ ...prev, [type]: null }));

      try {
        const response = await fetch(`/api/users/${user.user_id}/${type}`);
        if (!response.ok) throw new Error(`Failed to fetch ${type}`);
        const data = await response.json();
        type === "followers" ? setFollowers(data) : setFollowing(data);
        setCache((prev) => ({
          ...prev,
          [cacheKey]: { data, timestamp: Date.now() },
        }));
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        setError((prev) => ({
          ...prev,
          [type]: `Failed to load ${type}. Please try again.`,
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [user.user_id, cache],
  );

  useEffect(() => {
    fetchUsers("followers");
    fetchUsers("following");
  }, [fetchUsers]);

  const UserList = ({
    users,
    type,
  }: {
    users: User[];
    type: "followers" | "following";
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {debouncedLoading[type]
        ? Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
        : users.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center space-x-4 p-4 border rounded-lg"
            >
              <Avatar>
                <AvatarImage src={user.image_url} alt={user.username} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.username}</p>
              </div>
            </div>
          ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="followers">
        <TabsList>
          <TabsTrigger value="followers">
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({following.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="followers">
          {error.followers && (
            <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
              {error.followers}
              <Button onClick={() => fetchUsers("followers")} className="ml-2">
                Retry
              </Button>
            </div>
          )}
          <UserList users={followers} type="followers" />
        </TabsContent>
        <TabsContent value="following">
          {error.following && (
            <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
              {error.following}
              <Button onClick={() => fetchUsers("following")} className="ml-2">
                Retry
              </Button>
            </div>
          )}
          <UserList users={following} type="following" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
