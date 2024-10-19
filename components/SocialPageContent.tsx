"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  user_id: string;
  username: string;
  image_url: string;
}

interface SocialPageContentProps {
  user: User;
}

export default function SocialPageContent({ user }: SocialPageContentProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);

  useEffect(() => {
    fetchFollowers();
    fetchFollowing();
  }, [user.user_id]);

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/users/${user.user_id}/followers`);
      if (!response.ok) throw new Error("Failed to fetch followers");
      const data = await response.json();
      setFollowers(data);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/users/${user.user_id}/following`);
      if (!response.ok) throw new Error("Failed to fetch following");
      const data = await response.json();
      setFollowing(data);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const UserList = ({ users }: { users: User[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
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
          <UserList users={followers} />
        </TabsContent>
        <TabsContent value="following">
          <UserList users={following} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
