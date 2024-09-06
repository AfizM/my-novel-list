import { SignUp } from "@clerk/nextjs";
import React from "react";

const SignUpPage = () => {
  return (
    <main className="flex w-full justify-center mt-10">
      <SignUp />
    </main>
  );
};

export default SignUpPage;
