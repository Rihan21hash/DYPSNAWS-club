import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Sign In | AWS Student Builder Group",
  description: "Sign in to your DYPSN AWS Student Builder Group account.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#06050d",
          }}
        />
      }
    >
      <LoginClient />
    </Suspense>
  );
}
