"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Book, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Sign } from "crypto";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Browse", href: "/browse" },
    { name: "Social", href: "/" },
    { name: "Forum", href: "/" },
  ];

  const signedInNavItems = [
    { name: "Home", href: "/" },
    { name: "Profile", href: "/profile" },
    { name: "Novel List", href: "/novellist" },
    { name: "Browse", href: "/browse" },
    { name: "Forum", href: "/" },
  ];

  return (
    <nav className="shadow-[0_2px_4px_0_var(--shadow-color)] bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center ">
            <Link href="/" className="text-2xl font-bold hover:text-primary ">
              <div className="flex items-center">
                <img src="img/logo.png" alt="" width="35" height="20" />
                <div className="ml-[2px]">MyNovelList</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1  ">
            <SignedOut>
              <div className="flex ml-[57px]">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="hover:text-primary px-4 py-2 rounded-md text-[0.92rem] font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex mr-[87px]">
                {signedInNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="hover:text-primary px-4 py-2 rounded-md text-[0.92rem] font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SignedIn>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center">
            <SignedOut>
              <SignInButton>
                <Button variant="outline" className="mr-2">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="mr-2">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </SignedIn>
            <ModeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className=" hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                  <Button className="w-full">Sign Up</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
