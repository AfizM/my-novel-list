"use client";

import React, { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dummyPost = {
  id: 1,
  content:
    "Just finished reading an amazing book! It's 'The Midnight Library' by Matt Haig. Highly recommend it to anyone looking for a thought-provoking read about life choices and parallel universes.",
  time_ago: "2 hours ago",
  likes: 15,
  users: {
    first_name: "Jane",
    last_name: "Doe",
    image_url: "https://example.com/jane-doe-avatar.jpg",
  },
  comments: [],
};

const handleLike = () => {
  console.log("Like clicked");
};

const handleComment = (comment) => {
  console.log("New comment:", comment);
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("following");

  return (
    <div className="min-h-screen">
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto my-0 px-9 flex justify-center">
        <div className="w-full max-w-xl">
          {/* Title and Tabs */}
          <div className="flex justify-between items-center mb-6 mt-8">
            <h2 className="text-2xl font-bold">Activity</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="global">Global</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Input field */}
          <Input className="mb-6" placeholder="Write a status..." />

          <PostCard
            post={dummyPost}
            currentUser={{ id: 2, name: "Current User" }}
            onLike={handleLike}
            onComment={handleComment}
          />
        </div>
      </div>
    </div>
  );
}
