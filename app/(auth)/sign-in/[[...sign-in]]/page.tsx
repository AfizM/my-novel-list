import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
  return (
    <main className="flex w-full justify-center mt-10">
      <SignIn />
    </main>
  );
};

export default SignInPage;
