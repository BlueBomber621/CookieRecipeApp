"use client";

import { createContext } from "react";

import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  getIdTokenResult,
  onAuthStateChanged,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export const authContext = createContext({
  user: null,
  loading: false,
  GoogleAuthHandler: async () => {},
  Logout: () => {},
});

export const AuthContextProvider = (props) => {
  const [user, loading] = useAuthState(auth);

  const GoogleAuthHandler = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      throw error;
    }
  };

  const Logout = () => {
    signOut(auth);
  };

  const values = {
    user,
    loading,
    GoogleAuthHandler,
    Logout,
  };

  return (
    <authContext.Provider value={values}>{props.children}</authContext.Provider>
  );
};
