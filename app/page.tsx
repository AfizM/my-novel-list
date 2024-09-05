import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGridIcon } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="min-h-screen ">
        {/* Container */}
        <div className="w-full max-w-6xl mx-auto my-0 px-9">
          {/* Filters */}

          <div className=" p-4">
            <div className="flex mb-4 space-x-4">
              <div className="flex-col w-full max-w-[300px]">
                <div className="ml-1 py-2">Search</div>
                <Input
                  type="search"
                  placeholder="Search"
                  className="shadow-[0_2px_4px_0_var(--shadow-color)]"
                />
              </div>

              <div className="flex space-x-4 w-full items-end">
                <div className="flex-col w-full max-w-48 ">
                  <div className="ml-1 py-2">Sort</div>
                  <Select>
                    <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-col w-full max-w-48 ">
                  <div className="ml-1 py-2">Status</div>
                  <Select>
                    <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-col w-full max-w-48 ">
                  <div className="ml-1 py-2">Genre</div>
                  <Select>
                    <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-col w-full max-w-48 ">
                  <Button
                    variant="outline"
                    className="p-2 shadow-[0_2px_4px_0_var(--shadow-color)] "
                  >
                    <LayoutGridIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500 text-white p-4">Content 2</div>
        </div>
      </div>
    </div>
  );
}
