import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: "DYPSN | AWS Student Builder Group",
    template: "%s | DYPSN AWS Builders",
  },
  description:
    "The official AWS Cloud Student Builder Group of D.Y Patil Salonkhenagar — a high-performance technical collective dedicated to mastering cloud architecture.",
  icons: {
    icon: "/BuilderLogo.png",
    shortcut: "/BuilderLogo.png",
    apple: "/BuilderLogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/BuilderLogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/BuilderLogo.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="antialiased selection:bg-black selection:text-white bg-white text-[#131313]">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
