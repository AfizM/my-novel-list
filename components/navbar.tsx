"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
import { useUser } from "@clerk/nextjs";
import { NotificationBell } from "@/components/NotificationBell";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  const navItems = [
    { name: "Browse", href: "/browse" },
    { name: "Social", href: "/" },
    { name: "Submission", href: "/submission" },
  ];

  const signedInNavItems = [
    { name: "Home", href: "/" },
    { name: "Browse", href: "/browse" },
    { name: "Profile", href: `/profile/${user?.username}` },
    { name: "Novel List", href: `/profile/${user?.username}/novellist` },
    { name: "Submission", href: "/submission" },
  ];

  return (
    <nav className="shadow-[0_2px_4px_0_var(--shadow-color)] bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/" className="text-2xl font-bold hover:text-primary">
              <div className="flex items-center">
                <img src="/img/logo.png" alt="" width="35" height="20" />
                <div className="ml-[2px]">MyNovelList</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden nav:flex items-center justify-center">
            <SignedOut>
              <div className="flex ">
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
              <div className="flex">
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
          <div className="hidden nav:flex items-center justify-end flex-1">
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
                    userButtonPopover: "z-[100]",
                  },
                }}
              />
            </SignedIn>
            <ModeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="nav:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <SignedOut>
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <SignInButton>
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton>
                      <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full"
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex flex-col space-y-4">
                      {signedInNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-4 mt-4 border-t space-y-4">
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 justify-start px-3"
                        onClick={() => {
                          openUserProfile();
                          setIsOpen(false);
                        }}
                      >
                        <img
                          src={user?.imageUrl}
                          alt="Profile"
                          className="h-8 w-8 rounded-full"
                        />
                        <span>Manage Account</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 justify-start px-3 text-destructive hover:text-destructive"
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                      </Button>
                      <div className="mt-4 -ml-[0.74rem]">
                        <ModeToggle />
                      </div>
                    </div>
                  </SignedIn>
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
