import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/lib/store/app-context";
import Navbar from "./components/navbar";
import { AuthContextProvider } from "@/lib/store/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cookie Recipes",
  description: "Get and discover cookie recipes!",
  icons: {
    icon: "/Cookie.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider>
          <AppContextProvider>
            <Navbar />
            {children}
          </AppContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
