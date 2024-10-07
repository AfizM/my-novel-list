import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGridIcon, SlidersHorizontal } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        {/* Filters */}

        <div className="py-4">
          <div className="flex mb-4 space-x-6">
            <div className="flex-col w-full max-w-[300px]">
              <div className="ml-1 py-2 font-semibold">Search</div>
              <Input
                type="search"
                placeholder="Search"
                className="shadow-[0_2px_4px_0_var(--shadow-color)]"
              />
            </div>

            <div className="flex space-x-6 w-full items-end">
              <div className="flex-col w-full  max-w-72 ">
                <div className="ml-1 py-2 font-semibold">Sort</div>
                <Select>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full max-w-48 ">
                <div className="ml-1 py-2 font-semibold">Status</div>
                <Select>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full max-w-48 ">
                <div className="ml-1 py-2 text-base font-semibold">Genre</div>
                <Select>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full max-w-48 ">
                <div className="ml-1 py-2 text-base font-semibold">Tags</div>
                <Select>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full max-w-48 ml ">
                <Button
                  variant="outline"
                  className="p-2 shadow-[0_2px_4px_0_var(--shadow-color)] ml-2 "
                >
                  <SlidersHorizontal className="h-5 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 xl:gap-[2.3rem]">
          {[...Array(16)].map((_, index) => (
            <div key={index} className="flex flex-col">
              <img
                src="img/novel1.jpg"
                alt=""
                className="w-full h-auto aspect-[185/278] object-cover rounded-md"
              />
              <a href="/novel">
                <div className="mt-2 text-sm font-medium hover:text-primary">
                  Regressor's Tale of Cultivation
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
