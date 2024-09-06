"use client";

import { SignUp } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <main className="flex w-full justify-center mt-10">
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 rounded-lg w-80 h-96"></div>
      ) : (
        <SignUp />
      )}
    </main>
  );
};

export default SignUpPage;
