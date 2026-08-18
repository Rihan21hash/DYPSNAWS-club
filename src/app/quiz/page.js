import QuizLandingClient from "./QuizLandingClient";

export const metadata = {
  title: "Quizzes | AWS Cloud Club",
  description: "Join live quizzes, test your AWS knowledge, and compete on the real-time leaderboard.",
};

export default function QuizPage() {
  return <QuizLandingClient />;
}
