"use client";

import { authContext } from "@/lib/store/auth-context";
import { useContext } from "react";

export default function Navbar() {
  const { user, Logout } = useContext(authContext);

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-4 px-2 py-3">
        <a className="font-bold text-lg" href="/">
          YourLogo
        </a>
        <ul className="md:ml-auto flex gap-5">
          <li>
            <a
              href="/"
              className="text-center text-foreground hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200"
            >
              Recipes
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-center text-foreground hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-center text-foreground hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200"
            >
              Contact
            </a>
          </li>
          {user ? (
            <li>
              <a
                href="/user"
                className="text-center text-foreground text-sm hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200"
              >
                Welcome, {user.displayName.split(" ")[0] || user.email}!
              </a>
            </li>
          ) : (
            <li>
              <a
                href="/login"
                className="text-center text-foreground text-sm hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200"
              >
                Welcome, Guest! Login here!
              </a>
            </li>
          )}
          {user ? (
            <li>
              <button
                className="btn btn-danger p-1 px-2 text-sm"
                onClick={Logout}
              >
                Logout
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}
