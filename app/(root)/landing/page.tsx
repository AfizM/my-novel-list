"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Share2,
  TrendingUp,
  Sparkles,
  BookMarked,
  Users,
  Star,
  Bookmark,
  Zap,
} from "lucide-react";
import Image from "next/image";

const WavyBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <svg
      className="absolute left-[calc(50%-11rem)] top-[-50rem] -z-10 h-[100rem] w-[100rem] rotate-[30deg] transform-gpu blur-3xl sm:left-[calc(50%-30rem)] sm:top-[-40rem]"
      viewBox="0 0 1155 678"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
        fillOpacity=".3"
        d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
      />
      <defs>
        <linearGradient
          id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
          x1="1155.49"
          x2="-78.208"
          y1=".177"
          y2="474.645"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9089FC" />
          <stop offset={1} stopColor="#FF80B5" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <motion.div
        className="flex items-center space-x-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

export default function LandingPage() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground overflow-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <section className="py-20 text-center relative">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2">
              <motion.h1
                className="text-5xl font-extrabold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={controls}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Discover, Track, and Share Web Novels
              </motion.h1>
              <motion.p
                className="text-xl mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={controls}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Your personal library for the vast world of web novels. Join a
                community of passionate readers!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={controls}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button size="lg" className="animate-pulse">
                  <Sparkles className="mr-2 h-5 w-5" /> Join Now!
                </Button>
              </motion.div>
            </div>
            <motion.div
              className="md:w-1/2 mt-8 md:mt-0"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="relative w-64 h-96 mx-auto">
                <img
                  src="https://cdn.novelupdates.com/images/2016/06/1416425191645.jpg"
                  alt="Web Novel Cover"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-2xl"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
                <motion.div
                  className="absolute bottom-4 left-4 right-4 text-white text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  <p className="text-lg font-semibold">Featured Novel</p>
                  <p className="text-sm">Explore our top picks</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
