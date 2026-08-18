"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What does AWS stand for?",
    options: [
      "Amazon Web Services",
      "Advanced Web Solutions",
      "Amazon Wide Systems",
      "Automated Web Services",
    ],
    correctIndex: 0,
    explanation: "AWS stands for Amazon Web Services — Amazon's cloud computing platform.",
  },
  {
    id: 2,
    question: "Which AWS service is used for scalable object storage?",
    options: ["Amazon EC2", "Amazon RDS", "Amazon S3", "Amazon VPC"],
    correctIndex: 2,
    explanation:
      "Amazon S3 (Simple Storage Service) provides scalable, durable object storage in the cloud.",
  },
  {
    id: 3,
    question: "What is Amazon EC2 primarily used for?",
    options: [
      "Domain name registration",
      "Virtual compute capacity in the cloud",
      "Email sending",
      "Content delivery",
    ],
    correctIndex: 1,
    explanation:
      "Amazon EC2 (Elastic Compute Cloud) provides resizable virtual servers (instances) in the cloud.",
  },
  {
    id: 4,
    question: "Which AWS service provides a managed relational database?",
    options: ["Amazon S3", "Amazon DynamoDB", "Amazon RDS", "AWS Lambda"],
    correctIndex: 2,
    explanation:
      "Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale relational databases.",
  },
  {
    id: 5,
    question: "What is the AWS shared responsibility model?",
    options: [
      "AWS is responsible for everything",
      "The customer is responsible for everything",
      "AWS manages security OF the cloud; customers manage security IN the cloud",
      "Security is managed by a third party",
    ],
    correctIndex: 2,
    explanation:
      "Under the shared responsibility model, AWS secures the underlying infrastructure while customers are responsible for securing their data and configurations.",
  },
  {
    id: 6,
    question: "Which AWS service lets you run code without provisioning servers?",
    options: ["Amazon EC2", "AWS Lambda", "Amazon ECS", "AWS Elastic Beanstalk"],
    correctIndex: 1,
    explanation:
      "AWS Lambda is a serverless compute service that runs your code in response to events without you managing servers.",
  },
  {
    id: 7,
    question: "What does IAM stand for in AWS?",
    options: [
      "Internet Access Management",
      "Identity and Access Management",
      "Integrated Application Management",
      "Infrastructure Automation Module",
    ],
    correctIndex: 1,
    explanation:
      "AWS IAM (Identity and Access Management) lets you securely manage access to AWS services and resources.",
  },
  {
    id: 8,
    question: "Which service is AWS's Content Delivery Network (CDN)?",
    options: ["Amazon Route 53", "Amazon CloudFront", "AWS Direct Connect", "Amazon VPC"],
    correctIndex: 1,
    explanation:
      "Amazon CloudFront is a fast CDN that delivers data, videos, and APIs globally with low latency.",
  },
  {
    id: 9,
    question: "What is an AWS Region?",
    options: [
      "A single data center",
      "A geographical area containing multiple isolated Availability Zones",
      "A virtual private cloud",
      "A type of EC2 instance",
    ],
    correctIndex: 1,
    explanation:
      "An AWS Region is a geographical area with multiple, isolated Availability Zones for fault tolerance and low latency.",
  },
  {
    id: 10,
    question: "Which AWS service is a fully managed NoSQL database?",
    options: ["Amazon RDS", "Amazon Aurora", "Amazon DynamoDB", "Amazon Redshift"],
    correctIndex: 2,
    explanation:
      "Amazon DynamoDB is a fully managed, serverless NoSQL database designed for high-performance applications.",
  },
  {
    id: 11,
    question: "What is the purpose of Amazon VPC?",
    options: [
      "To store objects in the cloud",
      "To create an isolated virtual network within AWS",
      "To manage user identities",
      "To send notifications",
    ],
    correctIndex: 1,
    explanation:
      "Amazon VPC (Virtual Private Cloud) lets you provision a logically isolated section of the AWS Cloud.",
  },
  {
    id: 12,
    question: "Which pricing model lets you pay only for what you use with no upfront cost?",
    options: [
      "Reserved Instances",
      "On-Demand pricing",
      "Savings Plans",
      "Dedicated Hosts",
    ],
    correctIndex: 1,
    explanation:
      "On-Demand pricing lets you pay for compute capacity by the hour or second with no long-term commitments.",
  },
  {
    id: 13,
    question: "What AWS service is used for DNS (Domain Name System) management?",
    options: ["Amazon CloudFront", "AWS WAF", "Amazon Route 53", "AWS Shield"],
    correctIndex: 2,
    explanation:
      "Amazon Route 53 is a scalable DNS web service for domain registration, DNS routing, and health checking.",
  },
  {
    id: 14,
    question: "Which service provides automated backups and snapshots for EC2?",
    options: [
      "Amazon EBS (Elastic Block Store)",
      "Amazon S3 Glacier",
      "AWS Backup",
      "Both A and C",
    ],
    correctIndex: 3,
    explanation:
      "Amazon EBS provides snapshots for block storage, and AWS Backup provides a centralized backup service across AWS resources.",
  },
  {
    id: 15,
    question: "What is the AWS Free Tier?",
    options: [
      "A premium support plan",
      "A set of services available for free or with limited free usage for new accounts",
      "A type of EC2 instance",
      "A free domain registration service",
    ],
    correctIndex: 1,
    explanation:
      "The AWS Free Tier provides limited free usage of certain AWS services for 12 months after sign-up, plus always-free and trial offerings.",
  },
];

export default function AWSFundamentalsQuiz() {
  const [phase, setPhase] = useState("intro"); // intro | playing | result
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctIndex }
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState([]); // track all answers for review
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || feedback !== null) return;

    if (timeLeft <= 0) {
      handleAnswer(-1); // time expired
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, phase, feedback]);

  const startQuiz = () => {
    setPhase("playing");
    setCurrentQ(0);
    setScore(0);
    setSelectedIndex(null);
    setFeedback(null);
    setAnsweredCount(0);
    setTimeLeft(30);
    setAnswers([]);
  };

  const handleAnswer = useCallback(
    (index) => {
      if (feedback !== null) return;

      clearTimeout(timerRef.current);
      setSelectedIndex(index);

      const q = QUIZ_QUESTIONS[currentQ];
      const isCorrect = index === q.correctIndex;

      if (isCorrect) {
        setScore((s) => s + 1);
      }

      setFeedback({ isCorrect, correctIndex: q.correctIndex });
      setAnsweredCount((c) => c + 1);
      setAnswers((prev) => [
        ...prev,
        { questionId: q.id, selected: index, correct: q.correctIndex, isCorrect },
      ]);

      // Advance after delay
      setTimeout(() => {
        if (currentQ >= QUIZ_QUESTIONS.length - 1) {
          setPhase("result");
        } else {
          setCurrentQ((c) => c + 1);
          setSelectedIndex(null);
          setFeedback(null);
          setTimeLeft(30);
        }
      }, 2000);
    },
    [feedback, currentQ]
  );

  const restartQuiz = () => {
    setPhase("intro");
    setCurrentQ(0);
    setScore(0);
    setSelectedIndex(null);
    setFeedback(null);
    setAnsweredCount(0);
    setTimeLeft(30);
    setAnswers([]);
  };

  const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const timerPercent = (timeLeft / 30) * 100;

  return (
    <SmoothScroller>
      <PageTransition>
        <div className="bg-[#fdf8f8] min-h-screen flex flex-col pt-20 text-[#1c1b1b]">
          <main className="flex-grow max-w-[1440px] mx-auto px-5 md:px-16 w-full pt-16 md:pt-24 pb-24">
            {/* ──────────── INTRO ──────────── */}
            {phase === "intro" && (
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs text-gray-600 mb-6 uppercase tracking-widest bg-white">
                  AWS Fundamentals Quiz
                </span>

                <h1 className="font-display-xl text-4xl sm:text-6xl md:text-7xl text-[#131313] font-extrabold tracking-tight mb-6">
                  Test Your
                  <br />
                  Cloud Knowledge.
                </h1>

                <p className="font-body-lg text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-10">
                  {QUIZ_QUESTIONS.length} multiple-choice questions covering core
                  AWS services, architecture concepts, and cloud fundamentals. 30
                  seconds per question. Immediate feedback after each answer.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="font-headline-lg-mobile text-2xl font-bold text-[#131313] block">
                      {QUIZ_QUESTIONS.length}
                    </span>
                    <span className="font-mono-label text-[10px] text-gray-500 uppercase">
                      Questions
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="font-headline-lg-mobile text-2xl font-bold text-[#131313] block">
                      30s
                    </span>
                    <span className="font-mono-label text-[10px] text-gray-500 uppercase">
                      Per Question
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="font-headline-lg-mobile text-2xl font-bold text-[#131313] block">
                      MCQ
                    </span>
                    <span className="font-mono-label text-[10px] text-gray-500 uppercase">
                      Format
                    </span>
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  className="bg-[#131313] text-white font-mono-label text-sm px-10 py-4 rounded-sm hover:opacity-90 transition-opacity active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
                >
                  Start Quiz
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            )}

            {/* ──────────── PLAYING ──────────── */}
            {phase === "playing" && (
              <div className="max-w-3xl mx-auto">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-label text-xs text-gray-500 uppercase tracking-widest">
                      Question {currentQ + 1}/{QUIZ_QUESTIONS.length}
                    </span>
                    <span className="font-mono-label text-xs text-gray-400">
                      Score: {score}
                    </span>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                          timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${timerPercent}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono-label text-sm font-bold w-8 text-right ${
                        timeLeft <= 5 ? "text-red-500" : "text-[#131313]"
                      }`}
                    >
                      {timeLeft}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mb-10">
                  <div
                    className="h-full bg-[#131313] rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentQ + (feedback ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Card */}
                <div className="glass-panel bg-white border border-gray-200 rounded-xl p-6 sm:p-8 md:p-10 shadow-sm mb-8">
                  <h2 className="font-headline-lg-mobile text-xl sm:text-2xl md:text-3xl font-bold text-[#131313] mb-8 leading-snug">
                    {QUIZ_QUESTIONS[currentQ].question}
                  </h2>

                  {/* Options */}
                  <div className="flex flex-col gap-3">
                    {QUIZ_QUESTIONS[currentQ].options.map((option, i) => {
                      let optionClass =
                        "bg-[#f7f3f2] border border-gray-200 hover:border-[#131313] hover:bg-white";
                      let indicator = null;

                      if (feedback) {
                        if (i === feedback.correctIndex) {
                          optionClass =
                            "bg-emerald-50 border-2 border-emerald-500 text-emerald-900";
                          indicator = (
                            <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                              check_circle
                            </span>
                          );
                        } else if (i === selectedIndex && !feedback.isCorrect) {
                          optionClass =
                            "bg-red-50 border-2 border-red-400 text-red-900";
                          indicator = (
                            <span className="material-symbols-outlined text-red-400 text-[20px]">
                              cancel
                            </span>
                          );
                        } else {
                          optionClass =
                            "bg-gray-50 border border-gray-200 opacity-50";
                        }
                      } else if (i === selectedIndex) {
                        optionClass =
                          "bg-[#131313] text-white border border-[#131313]";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={feedback !== null}
                          className={`w-full text-left px-5 py-4 rounded-lg transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer disabled:cursor-default ${optionClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono-label text-xs font-bold w-6 flex-shrink-0 opacity-60">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="font-body-md text-sm sm:text-base font-medium">
                              {option}
                            </span>
                          </div>
                          {indicator}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation (shown after answer) */}
                {feedback && (
                  <div
                    className={`p-5 rounded-xl border text-sm font-body-md leading-relaxed ${
                      feedback.isCorrect
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 font-mono-label text-xs font-bold uppercase">
                      <span className="material-symbols-outlined text-[16px]">
                        {feedback.isCorrect ? "lightbulb" : "info"}
                      </span>
                      {feedback.isCorrect ? "Correct!" : "Not quite."}
                    </div>
                    {QUIZ_QUESTIONS[currentQ].explanation}
                  </div>
                )}
              </div>
            )}

            {/* ──────────── RESULTS ──────────── */}
            {phase === "result" && (
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs text-gray-600 mb-6 uppercase tracking-widest bg-white">
                  Quiz Complete
                </span>

                <h1 className="font-display-xl text-4xl sm:text-6xl md:text-7xl text-[#131313] font-extrabold tracking-tight mb-4">
                  {percentage >= 80
                    ? "Excellent Work!"
                    : percentage >= 50
                    ? "Good Effort!"
                    : "Keep Learning!"}
                </h1>

                <p className="font-body-lg text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-10">
                  You scored {score} out of {QUIZ_QUESTIONS.length} questions correctly.
                </p>

                {/* Score Card */}
                <div className="glass-panel bg-white border border-gray-200 rounded-xl p-8 md:p-10 shadow-sm max-w-md mx-auto mb-12">
                  {/* Circular Progress */}
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg
                      className="w-40 h-40 -rotate-90"
                      viewBox="0 0 128 128"
                    >
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke={
                          percentage >= 80
                            ? "#10b981"
                            : percentage >= 50
                            ? "#f59e0b"
                            : "#ef4444"
                        }
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-headline-lg text-4xl font-bold text-[#131313]">
                        {percentage}%
                      </span>
                      <span className="font-mono-label text-[10px] text-gray-500 uppercase">
                        Accuracy
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 font-mono-label text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase mb-1">
                        Correct
                      </span>
                      <span className="text-emerald-600 font-bold text-lg block">
                        {score}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase mb-1">
                        Wrong
                      </span>
                      <span className="text-red-500 font-bold text-lg block">
                        {QUIZ_QUESTIONS.length - score}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase mb-1">
                        Total
                      </span>
                      <span className="text-[#131313] font-bold text-lg block">
                        {QUIZ_QUESTIONS.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answer Review */}
                <div className="text-left mb-12">
                  <h3 className="font-mono-label text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 text-center">
                    Answer Review
                  </h3>
                  <div className="flex flex-col gap-3">
                    {answers.map((a, idx) => {
                      const q = QUIZ_QUESTIONS.find((qq) => qq.id === a.questionId);
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border flex items-start gap-3 ${
                            a.isCorrect
                              ? "bg-emerald-50/50 border-emerald-200"
                              : "bg-red-50/50 border-red-200"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5 ${
                              a.isCorrect ? "text-emerald-500" : "text-red-400"
                            }`}
                          >
                            {a.isCorrect ? "check_circle" : "cancel"}
                          </span>
                          <div>
                            <p className="font-body-md text-sm font-medium text-[#131313] mb-1">
                              {q?.question}
                            </p>
                            {!a.isCorrect && (
                              <p className="font-body-md text-xs text-gray-600">
                                Correct answer:{" "}
                                <span className="font-semibold text-emerald-700">
                                  {q?.options[a.correct]}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={restartQuiz}
                    className="bg-[#131313] text-white font-mono-label text-sm px-8 py-3.5 rounded-sm hover:opacity-90 transition-opacity active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      replay
                    </span>
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
