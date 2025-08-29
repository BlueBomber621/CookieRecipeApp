"use client";

import { authContext } from "@/lib/store/auth-context";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const { user, loading, GoogleAuthHandler } = useContext(authContext);

  if (user) return redirect("/");

  return (
    <div className="flex flex-col p-10 gap-5">
      {loading ? (
        <div className="w-full min-h-[280px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      ) : (
        <div className="flex flex-col mx-auto p-5 gap-5 min-w-[360px] max-w-[840px] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900">
          <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100 mb-4">
            Log in with an account to see and use more features!
          </p>
          <button
            className="btn btn-primary btn-small"
            onClick={GoogleAuthHandler}
          >
            <FaGoogle className="pr-1" /> Google
          </button>
        </div>
      )}
    </div>
  );
}
