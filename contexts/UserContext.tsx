"use client";
import { createContext, useContext, useState, useCallback } from "react";

interface User {
  user_id: string;
  username: string;
  image_url: string;
  banner_url: string;
  about_me?: string;
}

interface UserContextType {
  userData: User | null;
  updateUserData: (data: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUserData,
}: {
  children: React.ReactNode;
  initialUserData: User;
}) {
  const [userData, setUserData] = useState(initialUserData);

  const updateUserData = useCallback((data: Partial<User>) => {
    setUserData((prev) => {
      const updated = { ...prev, ...data };
      if (updated.banner_url && !updated.banner_url.includes("?t=")) {
        updated.banner_url = `${updated.banner_url}?t=${Date.now()}`;
      }
      return updated;
    });
  }, []);

  return (
    <UserContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
}
