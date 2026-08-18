import { Suspense } from "react";
import SignupClient from "./SignupClient";

export const metadata = {
  title: "Sign Up | AWS Student Builder Group",
  description: "Create your DYPSN AWS Student Builder Group account.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fdf8f8",
          }}
        />
      }
    >
      <SignupClient />
    </Suspense>
  );
}
