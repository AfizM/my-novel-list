import { SignUp } from "@clerk/nextjs";
import React from "react";

const SignUpPage = () => {
  return (
    <main className="auth-page  h-full flex justify-center items-center">
      <SignUp />
    </main>
  );
};

export default SignUpPage;
