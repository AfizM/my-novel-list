import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
  return (
    <main className="auth-page h-full flex justify-center items-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: {
              fontSize: 14,
              textTransform: "none",
              backgroundColor: "#16a34a",
              "&:hover, &:focus, &:active": {
                backgroundColor: "##16a34a",
              },
            },
          },
        }}
      />
    </main>
  );
};

export default SignInPage;
