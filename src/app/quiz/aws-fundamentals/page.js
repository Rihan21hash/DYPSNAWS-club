import AWSFundamentalsQuizClient from "./AWSFundamentalsQuizClient";

export const metadata = {
  title: "AWS Fundamentals Quiz | AWS Student Builder Group",
  description:
    "Test your AWS cloud knowledge with 15 multiple-choice questions on core services, architecture, and cloud fundamentals.",
};

export default function AWSFundamentalsQuizPage() {
  return <AWSFundamentalsQuizClient />;
}
